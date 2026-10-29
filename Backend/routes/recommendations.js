const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../lib/errors');
const { z, validate, limit } = require('../lib/validate');
const { recommend } = require('../services/recommendations');
const { userStats } = require('../services/stats');

const router = express.Router();

router.get(
  '/recommendations',
  authenticateToken,
  validate({ query: z.object({ limit: limit(30, 12) }) }),
  asyncHandler(async (req, res) => {
    res.json({ recommendations: await recommend(req.user.id, { limit: req.query.limit }) });
  })
);

router.get(
  '/stats/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    res.json({ stats: await userStats(req.user.id) });
  })
);

module.exports = router;
