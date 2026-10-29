const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../lib/errors');
const { z, validate, page, limit } = require('../lib/validate');
const metadata = require('../services/metadata');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

const idParams = z.object({ id: z.coerce.number().int().positive() });
const paging = { page, limit: limit(100, 20) };

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const [totalUsers, totalMovies, totalReviews, totalWatchlistItems, totalFavorites, totalAdmins, recentUsers, recentReviews] =
      await Promise.all([
        prisma.user.count(),
        prisma.movie.count(),
        prisma.review.count(),
        prisma.watchlist.count(),
        prisma.favorite.count(),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.findMany({ select: { id: true, name: true, email: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
        prisma.review.findMany({ include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 5 })
      ]);

    const movies = await metadata.getSummaries(recentReviews.map((r) => r.imdbId));
    const byId = new Map(movies.map((m) => [m.id, m]));

    res.json({
      stats: { totalUsers, totalMovies, totalReviews, totalWatchlistItems, totalFavorites, totalAdmins },
      recentUsers,
      recentReviews: recentReviews.map((r) => ({ ...r, movie: byId.get(r.imdbId) || null }))
    });
  })
);

router.get(
  '/users',
  validate({ query: z.object({ ...paging, search: z.string().trim().max(80).optional() }) }),
  asyncHandler(async (req, res) => {
    const { page: pageNum, limit: take, search } = req.query;
    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {};

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { reviews: true, watchlists: true, favorites: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip: (pageNum - 1) * take
      }),
      prisma.user.count({ where })
    ]);

    res.json({ users, totalUsers, page: pageNum, totalPages: Math.ceil(totalUsers / take) });
  })
);

router.put(
  '/users/:id/role',
  validate({ params: idParams, body: z.object({ role: z.enum(['USER', 'ADMIN']) }) }),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id) throw new HttpError(400, 'Cannot change your own role');
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json({ message: 'User role updated successfully', user });
  })
);

router.delete(
  '/users/:id',
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id) throw new HttpError(400, 'Cannot delete your own account');
    await prisma.user.delete({ where: { id: req.params.id } }); // related rows cascade
    res.json({ message: 'User deleted successfully' });
  })
);

router.get(
  '/movies',
  validate({ query: z.object({ ...paging, search: z.string().trim().max(80).optional() }) }),
  asyncHandler(async (req, res) => {
    const { page: pageNum, limit: take, search } = req.query;
    const where = search
      ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { director: { contains: search, mode: 'insensitive' } }, { actors: { contains: search, mode: 'insensitive' } }] }
      : {};

    const [movies, totalMovies] = await Promise.all([
      prisma.movie.findMany({ where, orderBy: { fetchedAt: 'desc' }, take, skip: (pageNum - 1) * take }),
      prisma.movie.count({ where })
    ]);

    res.json({ movies, totalMovies, page: pageNum, totalPages: Math.ceil(totalMovies / take) });
  })
);

// Removes the cached metadata only; it is re-fetched on next view
router.delete(
  '/movies/:movieId',
  asyncHandler(async (req, res) => {
    await prisma.movie.deleteMany({ where: { id: req.params.movieId } });
    res.json({ message: 'Cached movie deleted successfully' });
  })
);

router.get(
  '/reviews',
  validate({ query: z.object(paging) }),
  asyncHandler(async (req, res) => {
    const { page: pageNum, limit: take } = req.query;
    const [reviews, totalReviews] = await Promise.all([
      prisma.review.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip: (pageNum - 1) * take
      }),
      prisma.review.count()
    ]);

    const movies = await metadata.getSummaries(reviews.map((r) => r.imdbId));
    const byId = new Map(movies.map((m) => [m.id, m]));
    res.json({
      reviews: reviews.map((r) => ({ ...r, movie: byId.get(r.imdbId) || null })),
      totalReviews,
      page: pageNum,
      totalPages: Math.ceil(totalReviews / take)
    });
  })
);

router.delete(
  '/reviews/:id',
  validate({ params: idParams }),
  asyncHandler(async (req, res) => {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ message: 'Review deleted successfully' });
  })
);

module.exports = router;
