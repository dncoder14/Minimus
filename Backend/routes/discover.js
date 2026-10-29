const express = require('express');
const { asyncHandler, HttpError } = require('../lib/errors');
const { z, validate, page, limit } = require('../lib/validate');
const metadata = require('../services/metadata');

const router = express.Router();

const query = z.object({
  genre: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().min(1888).max(2100).optional(),
  sort: z.enum(['popular', 'top_rated', 'newest']).default('popular'),
  page,
  limit: limit(40, 18)
});

// Paged browsing with our own page size: GET /api/discover/movie?genre=28&year=2024&page=2&limit=18
router.get(
  '/:kind',
  validate({ params: z.object({ kind: z.enum(['movie', 'tv']) }), query }),
  asyncHandler(async (req, res) => {
    try {
      res.json(await metadata.discover(req.params.kind, req.query));
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(502, 'Movie data provider is unavailable');
    }
  })
);

module.exports = router;
