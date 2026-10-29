const express = require('express');
const { asyncHandler, HttpError } = require('../lib/errors');
const { z, validate, page, mediaId } = require('../lib/validate');
const metadata = require('../services/metadata');

const router = express.Router();

const upstream = (err) => (err instanceof HttpError ? err : new HttpError(502, 'Movie data provider is unavailable'));

router.get(
  '/search',
  validate({ query: z.object({ q: z.string().trim().min(1, 'Search query is required').max(100), page }) }),
  asyncHandler(async (req, res) => {
    const { q, page: pageNum } = req.query;
    try {
      const { results, totalResults } = await metadata.searchOmdb(q, pageNum);
      res.json({ results, totalResults, page: pageNum });
    } catch (err) {
      throw upstream(err);
    }
  })
);

router.get(
  '/popular/list',
  asyncHandler(async (req, res) => {
    try {
      res.json({ movies: await metadata.getPopular() });
    } catch (err) {
      throw upstream(err);
    }
  })
);

// Batch lookup of cached summaries: POST { ids: [...] } -> { movies: [...] }
router.post(
  '/batch',
  validate({ body: z.object({ ids: z.array(mediaId).min(1).max(50) }) }),
  asyncHandler(async (req, res) => {
    res.json({ movies: await metadata.getSummaries(req.body.ids) });
  })
);

router.get(
  '/:imdbId',
  validate({ params: z.object({ imdbId: mediaId }) }),
  asyncHandler(async (req, res) => {
    try {
      res.json({ movie: await metadata.getDetails(req.params.imdbId) });
    } catch (err) {
      throw upstream(err);
    }
  })
);

module.exports = router;
