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
        _count: { select: { followers: true, following: true, reviews: true, watched: true } }
      }
    });
    if (!user) throw new HttpError(404, 'User not found');

    const [reviews, favorites, follow] = await Promise.all([
      prisma.review.findMany({ where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.favorite.findMany({ where: { userId: id }, orderBy: { addedAt: 'desc' }, take: 8 }),
      req.user
        ? prisma.follow.findUnique({ where: { followerId_followingId: { followerId: req.user.id, followingId: id } } })
        : null
    ]);
    const movies = await metadata.getSummaries([...reviews.map((r) => r.imdbId), ...favorites.map((f) => f.imdbId)]);
    const byId = new Map(movies.map((m) => [m.id, m]));

    res.json({
      user,
      isFollowing: !!follow,
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

// Activity from people the user follows: reviews, favorites and watched, newest first
router.get(
  '/feed',
  authenticateToken,
  validate({ query: z.object({ limit: limit(50, 20) }) }),
  asyncHandler(async (req, res) => {
    const follows = await prisma.follow.findMany({ where: { followerId: req.user.id }, select: { followingId: true } });
    const ids = follows.map((f) => f.followingId);
    if (ids.length === 0) return res.json({ items: [], following: 0 });

    const take = req.query.limit;
    const base = { where: { userId: { in: ids } }, include: { user: { select: { id: true, name: true } } }, take };
    const [reviews, favorites, watched] = await Promise.all([
      prisma.review.findMany({ ...base, orderBy: { createdAt: 'desc' } }),
      prisma.favorite.findMany({ ...base, orderBy: { addedAt: 'desc' } }),
      prisma.watched.findMany({ ...base, orderBy: { watchedAt: 'desc' } })
    ]);

    const items = [
      ...reviews.map((r) => ({ type: 'review', at: r.createdAt, user: r.user, imdbId: r.imdbId, rating: r.rating, comment: r.spoiler ? null : r.comment, spoiler: r.spoiler })),
      ...favorites.map((f) => ({ type: 'favorite', at: f.addedAt, user: f.user, imdbId: f.imdbId })),
      ...watched.map((w) => ({ type: 'watched', at: w.watchedAt, user: w.user, imdbId: w.imdbId }))
    ]
      .sort((a, b) => b.at - a.at)
      .slice(0, take);

    const movies = await metadata.getSummaries(items.map((i) => i.imdbId));
    const byId = new Map(movies.map((m) => [m.id, m]));
    res.json({ items: items.map((i) => ({ ...i, movie: byId.get(i.imdbId) || null })), following: ids.length });
  })
);

module.exports = router;
