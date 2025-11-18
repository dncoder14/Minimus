const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Add to watched
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { imdbId } = req.body;
    const watched = await prisma.watched.create({
      data: { userId: req.user.id, imdbId }
    });
    res.json({ message: 'Marked as watched', watched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as watched' });
  }
});

// Remove from watched
router.delete('/:imdbId', authenticateToken, async (req, res) => {
  try {
    await prisma.watched.deleteMany({
      where: { userId: req.user.id, imdbId: req.params.imdbId }
    });
    res.json({ message: 'Removed from watched' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from watched' });
  }
});

// Get watched list
router.get('/', authenticateToken, async (req, res) => {
  try {
    const watched = await prisma.watched.findMany({
      where: { userId: req.user.id },
      orderBy: { watchedAt: 'desc' }
    });
    res.json({ watched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watched list' });
  }
});

// Check if watched
router.get('/check/:imdbId', authenticateToken, async (req, res) => {
  try {
    const watched = await prisma.watched.findFirst({
      where: { userId: req.user.id, imdbId: req.params.imdbId }
    });
    res.json({ isWatched: !!watched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check watched status' });
  }
});

module.exports = router;
