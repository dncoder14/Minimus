const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../lib/errors');
const { z, validate, limit } = require('../lib/validate');
const metadata = require('../services/metadata');

const router = express.Router();

const userIdParams = z.object({ id: z.coerce.number().int().positive() });

router.get(
  '/users',
  optionalAuth,
  validate({ query: z.object({ q: z.string().trim().min(1).max(60), limit: limit(30, 10) }) }),
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      where: { name: { contains: req.query.q, mode: 'insensitive' }, ...(req.user ? { id: { not: req.user.id } } : {}) },
      select: { id: true, name: true, _count: { select: { followers: true, reviews: true } } },
      take: req.query.limit
    });
    const following = req.user
      ? new Set((await prisma.follow.findMany({ where: { followerId: req.user.id }, select: { followingId: true } })).map((f) => f.followingId))
      : new Set();
    res.json({ users: users.map((u) => ({ ...u, isFollowing: following.has(u.id) })) });
  })
);

router.get(
  '/users/:id',
  optionalAuth,
  validate({ params: userIdParams }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        activityVisibility: true,
        showFavorites: true,
        _count: { select: { followers: true, following: true, reviews: true, watched: true } }
      }
    });
    if (!user) throw new HttpError(404, 'User not found');

    const isSelf = req.user?.id === id;
    const follow = req.user && !isSelf
      ? await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: req.user.id, followingId: id } } })
      : null;

    const { activityVisibility, showFavorites, ...publicUser } = user;
    const visible =
      isSelf || activityVisibility === 'PUBLIC' || (activityVisibility === 'FOLLOWERS' && !!follow);
    const base = { user: publicUser, isFollowing: !!follow, activityVisible: visible };
    if (!visible) return res.json({ ...base, recentReviews: [], favorites: [] });

    const [reviews, favorites] = await Promise.all([
      prisma.review.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 5 }),
      isSelf || showFavorites
        ? prisma.favorite.findMany({ where: { userId: id }, orderBy: { addedAt: 'desc' }, take: 8 })
        : []
    ]);
    const movies = await metadata.getSummaries([...reviews.map((r) => r.imdbId), ...favorites.map((f) => f.imdbId)]);
    const byId = new Map(movies.map((m) => [m.id, m]));

    res.json({
      ...base,
      recentReviews: reviews.map((r) => ({ ...r, movie: byId.get(r.imdbId) || null })),
      favorites: favorites.map((f) => ({ ...f, movie: byId.get(f.imdbId) || null }))
    });
  })
);

router.post(
  '/follow/:id',
  authenticateToken,
  validate({ params: userIdParams }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (id === req.user.id) throw new HttpError(400, 'You cannot follow yourself');
    if (!(await prisma.user.findUnique({ where: { id }, select: { id: true } }))) throw new HttpError(404, 'User not found');

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: req.user.id, followingId: id } },
      update: {},
      create: { followerId: req.user.id, followingId: id }
    });
    res.json({ isFollowing: true });
  })
);

router.delete(
  '/follow/:id',
  authenticateToken,
  validate({ params: userIdParams }),
  asyncHandler(async (req, res) => {
    await prisma.follow.deleteMany({ where: { followerId: req.user.id, followingId: req.params.id } });
    res.json({ isFollowing: false });
  })
);

// Activity from people the user follows, one card per person and title. Reviews and favorites
// create cards; "watched" only appears as a detail on a card that already exists, because on its
// own it is noisy and the most private signal. Users who set their activity to PRIVATE are skipped.
router.get(
  '/feed',
  authenticateToken,
  validate({ query: z.object({ limit: limit(50, 20) }) }),
  asyncHandler(async (req, res) => {
    const follows = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { following: { select: { id: true, name: true, activityVisibility: true, showFavorites: true } } }
    });
    const people = follows.map((f) => f.following);
    const visible = people.filter((p) => p.activityVisibility !== 'PRIVATE');
    if (visible.length === 0) return res.json({ items: [], following: people.length });

    const take = req.query.limit;
    const byUser = new Map(visible.map((p) => [p.id, p]));
    const favoriteUsers = visible.filter((p) => p.showFavorites).map((p) => p.id);
    const include = { user: { select: { id: true, name: true } } };

    const [reviews, favorites] = await Promise.all([
      prisma.review.findMany({ where: { userId: { in: [...byUser.keys()] } }, include, orderBy: { createdAt: 'desc' }, take }),
      favoriteUsers.length
        ? prisma.favorite.findMany({ where: { userId: { in: favoriteUsers } }, include, orderBy: { addedAt: 'desc' }, take })
        : []
    ]);

    // Merge events for the same person and title into one card
    const cards = new Map();
    const card = (user, imdbId) => {
      const key = `${user.id}:${imdbId}`;
      if (!cards.has(key)) cards.set(key, { user, imdbId, at: new Date(0), actions: [] });
      return cards.get(key);
    };
    const touch = (c, at, action) => {
      if (at > c.at) c.at = at;
      if (!c.actions.includes(action)) c.actions.push(action);
    };
    for (const r of reviews) {
      const c = card(r.user, r.imdbId);
      touch(c, r.createdAt, 'reviewed');
      c.rating = r.rating;
      c.spoiler = r.spoiler;
      c.comment = r.spoiler ? null : r.comment;
    }
    for (const f of favorites) touch(card(f.user, f.imdbId), f.addedAt, 'favorited');

    // Attach "watched" to existing cards only
    const watched = await prisma.watched.findMany({
      where: { OR: [...cards.values()].map((c) => ({ userId: c.user.id, imdbId: c.imdbId })) }
    });
    for (const w of watched) touch(cards.get(`${w.userId}:${w.imdbId}`), cards.get(`${w.userId}:${w.imdbId}`).at, 'watched');

    const items = [...cards.values()].sort((a, b) => b.at - a.at).slice(0, take);
    const movies = await metadata.getSummaries(items.map((i) => i.imdbId));
    const byId = new Map(movies.map((m) => [m.id, m]));
    res.json({ items: items.map((i) => ({ ...i, movie: byId.get(i.imdbId) || null })), following: people.length });
  })
);

const settingsBody = z.object({
  activityVisibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).optional(),
  showFavorites: z.boolean().optional()
});

router.get(
  '/settings',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const settings = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { activityVisibility: true, showFavorites: true }
    });
    res.json({ settings });
  })
);

router.put(
  '/settings',
  authenticateToken,
  validate({ body: settingsBody }),
  asyncHandler(async (req, res) => {
    const settings = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
      select: { activityVisibility: true, showFavorites: true }
    });
    res.json({ settings });
  })
);

module.exports = router;
