const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Add to watchlist
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { imdbId } = req.body;

    if (!imdbId) {
      return res.status(400).json({ error: 'IMDB ID is required' });
    }

    // Check if already in watchlist
    const existingEntry = await prisma.watchlist.findUnique({
      where: {
        userId_imdbId: {
          userId: req.user.id,
          imdbId: imdbId
        }
      }
    });

    if (existingEntry) {
      return res.status(400).json({ error: 'Movie already in watchlist' });
    }

    const watchlistEntry = await prisma.watchlist.create({
      data: {
        userId: req.user.id,
        imdbId: imdbId
      }
    });

    res.status(201).json({
      message: 'Movie added to watchlist',
      watchlistEntry
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Remove from watchlist
router.delete('/:imdbId', authenticateToken, async (req, res) => {
  try {
    const { imdbId } = req.params;

    const watchlistEntry = await prisma.watchlist.findUnique({
      where: {
        userId_imdbId: {
          userId: req.user.id,
          imdbId: imdbId
        }
      }
    });

    if (!watchlistEntry) {
      return res.status(404).json({ error: 'Movie not in watchlist' });
    }

    await prisma.watchlist.delete({
      where: {
        userId_imdbId: {
          userId: req.user.id,
          imdbId: imdbId
        }
      }
    });

    res.json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

// Get user's watchlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const watchlist = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      orderBy: { addedAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const totalItems = await prisma.watchlist.count({
      where: { userId: req.user.id }
    });

    res.json({
      watchlist,
      totalItems,
      page: parseInt(page),
      totalPages: Math.ceil(totalItems / parseInt(limit))
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Check if movie is in watchlist
router.get('/check/:imdbId', authenticateToken, async (req, res) => {
  try {
    const { imdbId } = req.params;

    const watchlistEntry = await prisma.watchlist.findUnique({
      where: {
        userId_imdbId: {
          userId: req.user.id,
          imdbId: imdbId
        }
      }
    });

    res.json({ inWatchlist: !!watchlistEntry });
  } catch (error) {
    console.error('Check watchlist error:', error);
    res.status(500).json({ error: 'Failed to check watchlist status' });
  }
});

// Clear entire watchlist
router.delete('/', authenticateToken, async (req, res) => {
  try {
    await prisma.watchlist.deleteMany({
      where: { userId: req.user.id }
    });

    res.json({ message: 'Watchlist cleared successfully' });
  } catch (error) {
    console.error('Clear watchlist error:', error);
    res.status(500).json({ error: 'Failed to clear watchlist' });
  }
});

module.exports = router;