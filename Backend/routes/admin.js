const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.movie.count(),
      prisma.review.count(),
      prisma.watchlist.count(),
      prisma.favorite.count(),
      prisma.user.count({ where: { role: 'ADMIN' } })
    ]);

    const [totalUsers, totalMovies, totalReviews, totalWatchlistItems, totalFavorites, totalAdmins] = stats;

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentReviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true } },
        movie: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      stats: {
        totalUsers,
        totalMovies,
        totalReviews,
        totalWatchlistItems,
        totalFavorites,
        totalAdmins
      },
      recentUsers,
      recentReviews
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            watchlists: true,
            favorites: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const totalUsers = await prisma.user.count({ where });

    res.json({
      users,
      totalUsers,
      page: parseInt(page),
      totalPages: Math.ceil(totalUsers / parseInt(limit))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id: parseInt(userId) }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all movies
router.get('/movies', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { director: { contains: search, mode: 'insensitive' } },
        { actors: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const movies = await prisma.movie.findMany({
      where,
      select: {
        id: true,
        imdbId: true,
        title: true,
        year: true,
        type: true,
        poster: true,
        imdbRating: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            watchlists: true,
            favorites: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const totalMovies = await prisma.movie.count({ where });

    res.json({
      movies,
      totalMovies,
      page: parseInt(page),
      totalPages: Math.ceil(totalMovies / parseInt(limit))
    });
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Delete movie
router.delete('/movies/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;

    await prisma.movie.delete({
      where: { id: parseInt(movieId) }
    });

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

// Get all reviews
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        movie: { select: { id: true, title: true, poster: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const totalReviews = await prisma.review.count();

    res.json({
      reviews,
      totalReviews,
      page: parseInt(page),
      totalPages: Math.ceil(totalReviews / parseInt(limit))
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Delete review
router.delete('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;

    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;