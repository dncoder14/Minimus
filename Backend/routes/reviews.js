const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../lib/errors');
const { z, validate, page, limit, mediaId } = require('../lib/validate');

const router = express.Router();

const reviewBody = z.object({
  imdbId: mediaId,
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().max(2000).optional().nullable(),
  spoiler: z.boolean().optional()
});

// Shape a review for the client, adding like data for the (optional) current user
const serialize = (review, userId) => {
  const { likes, ...rest } = review;
  return {
    ...rest,
    likeCount: review._count?.likes ?? 0,
    likedByMe: userId ? (likes || []).some((l) => l.userId === userId) : false
  };
};

const reviewInclude = (userId) => ({
  user: { select: { id: true, name: true } },
  _count: { select: { likes: true } },
  likes: userId ? { where: { userId }, select: { userId: true } } : false
});

router.post(
  '/',
  authenticateToken,
  validate({ body: reviewBody }),
  asyncHandler(async (req, res) => {
    const { imdbId, rating, comment, spoiler } = req.body;
    const data = { rating, comment: comment || null, spoiler: spoiler ?? false };

    const review = await prisma.review.upsert({
      where: { userId_imdbId: { userId: req.user.id, imdbId } },
      update: data,
      create: { userId: req.user.id, imdbId, ...data },
      include: reviewInclude(req.user.id)
    });

    res.status(201).json({ message: 'Review saved successfully', review: serialize(review, req.user.id) });
  })
);

// Reviews for a movie. sort=recent (default) | helpful | rating
router.get(
  '/movie/:imdbId',
  optionalAuth,
  validate({
    query: z.object({ page, limit: limit(50, 10), sort: z.enum(['recent', 'helpful', 'rating']).default('recent') })
  }),
  asyncHandler(async (req, res) => {
    const { imdbId } = req.params;
    const { page: pageNum, limit: take, sort } = req.query;
    const userId = req.user?.id;

    const orderBy = {
      recent: [{ createdAt: 'desc' }],
      helpful: [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }],
      rating: [{ rating: 'desc' }, { createdAt: 'desc' }]
    }[sort];

    const [reviews, totalReviews, aggregate] = await Promise.all([
      prisma.review.findMany({
        where: { imdbId },
        include: reviewInclude(userId),
        orderBy,
        take,
        skip: (pageNum - 1) * take
      }),
      prisma.review.count({ where: { imdbId } }),
      prisma.review.aggregate({ where: { imdbId }, _avg: { rating: true } })
    ]);

    res.json({
      reviews: reviews.map((r) => serialize(r, userId)),
      totalReviews,
      averageRating: aggregate._avg.rating || 0,
      page: pageNum,
      totalPages: Math.ceil(totalReviews / take)
    });
  })
);

router.get(
  '/user',
  authenticateToken,
  validate({ query: z.object({ page, limit: limit(100, 10) }) }),
  asyncHandler(async (req, res) => {
    const { page: pageNum, limit: take } = req.query;
    const [reviews, totalReviews] = await Promise.all([
      prisma.review.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take,
        skip: (pageNum - 1) * take
      }),
      prisma.review.count({ where: { userId: req.user.id } })
    ]);

    res.json({ reviews, totalReviews, page: pageNum, totalPages: Math.ceil(totalReviews / take) });
  })
);

// Recent reviews across the site (public). Declared before "/:reviewId" routes.
router.get(
  '/recent',
  validate({ query: z.object({ limit: limit(50, 10) }) }),
  asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      include: { user: { select: { id: true, name: true } }, _count: { select: { likes: true } } },
      orderBy: { createdAt: 'desc' },
      take: req.query.limit
    });
    res.json({ reviews: reviews.map((r) => serialize(r)) });
  })
);

const reviewIdParams = z.object({ reviewId: z.coerce.number().int().positive() });

router.post(
  '/:reviewId/like',
  authenticateToken,
  validate({ params: reviewIdParams }),
  asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new HttpError(404, 'Review not found');
    if (review.userId === req.user.id) throw new HttpError(400, 'You cannot like your own review');

    await prisma.reviewLike.upsert({
      where: { userId_reviewId: { userId: req.user.id, reviewId } },
      update: {},
      create: { userId: req.user.id, reviewId }
    });
    res.json({ likeCount: await prisma.reviewLike.count({ where: { reviewId } }), likedByMe: true });
  })
);

router.delete(
  '/:reviewId/like',
  authenticateToken,
  validate({ params: reviewIdParams }),
  asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    await prisma.reviewLike.deleteMany({ where: { userId: req.user.id, reviewId } });
    res.json({ likeCount: await prisma.reviewLike.count({ where: { reviewId } }), likedByMe: false });
  })
);

router.delete(
  '/:reviewId',
  authenticateToken,
  validate({ params: reviewIdParams }),
  asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new HttpError(404, 'Review not found');
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new HttpError(403, 'Not authorized to delete this review');
    }

    await prisma.review.delete({ where: { id: reviewId } });
    res.json({ message: 'Review deleted successfully' });
  })
);

module.exports = router;
