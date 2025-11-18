const express = require('express');
const { PrismaClient } = require('../generated/prisma');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Add to favorites
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { imdbId } = req.body;

    if (!imdbId) {
      return res.status(400).json({ error: 'IMDB ID is required' });
    }

    // Check if already in favorites
    const existingEntry = await prisma.favorite.findUnique({
      where: {
        userId_imdbId: {
          userId: req.user.id,
          imdbId: imdbId
        }
      }
    });

    if (existingEntry) {
      return res.status(400).json({ error: 'Movie already in favorites' });
    }

    const favoriteEntry = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        imdbId: imdbId
      }
    });

    res.status(201).json({
      message: 'Movie added to favorites',
      favoriteEntry
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites
router.delete('/:imdbId', authenticateToken, async (req, res) => {
  try {
    const { imdbId } = req.params;

    const favoriteEntry = await prisma.favorite.findUnique({
      where: {
        userId_imdbId: {
          userId: req.user.id,
          imdbId: imdbId
        }
      }
    });

    if (!favoriteEntry) {
      return res.status(404).json({ error: 'Movie not in favorites' });
    }

    await prisma.favorite.delete({
      where: {
        userId_imdbId: {
          userId: req.user.id,
          imdbId: imdbId
        }
      }
    });

    res.json({ message: 'Movie removed from favorites' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Get user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { addedAt: 'desc' },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    const totalItems = await prisma.favorite.count({
      where: { userId: req.user.id }
    });

    res.json({
      favorites,
      totalItems,
      page: parseInt(page),
      totalPages: Math.ceil(totalItems / parseInt(limit))
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Check if movie is in favorites
router.get('/check/:imdbId', authenticateToken, async (req, res) => {
  try {
    const { imdbId } = req.params;

    const favoriteEntry = await prisma.favorite.findUnique({
      where: {
        userId_imdbId: {
          userId: req.user.id,
          imdbId: imdbId
        }
      }
    });

    res.json({ inFavorites: !!favoriteEntry });
  } catch (error) {
    console.error('Check favorites error:', error);
    res.status(500).json({ error: 'Failed to check favorites status' });
  }
});

module.exports = router;