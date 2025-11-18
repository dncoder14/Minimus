const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Create or update review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { imdbId, rating, comment } = req.body;

    if (!imdbId || !rating) {
      return res.status(400).json({ error: 'IMDB ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = await prisma.review.upsert({
      where: {
        userId_imdbId: {
          userId: req.user.id,
          imdbId: imdbId
        }
      },
      update: {
        rating: parseInt(rating),
        comment: comment || null
      },
      create: {
        userId: req.user.id,
        imdbId: imdbId,
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      message: 'Review saved successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

// Get reviews for a movie
router.get('/movie/:imdbId', async (req, res) => {
  try {
    const { imdbId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await prisma.review.findMany({
      where: { imdbId: imdbId },
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const totalReviews = await prisma.review.count({
      where: { imdbId: imdbId }
    });

    const averageRating = await prisma.review.aggregate({
      where: { imdbId: imdbId },
      _avg: { rating: true }
    });

    res.json({
      reviews,
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      page: parseInt(page),
      totalPages: Math.ceil(totalReviews / parseInt(limit))
    });
  } catch (error) {
    console.error('Get movie reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get user's reviews
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await prisma.review.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const totalReviews = await prisma.review.count({
      where: { userId: req.user.id }
    });

    res.json({
      reviews,
      totalReviews,
      page: parseInt(page),
      totalPages: Math.ceil(totalReviews / parseInt(limit))
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});

// Delete review
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get recent reviews (public)
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch recent reviews' });
  }
});

module.exports = router;