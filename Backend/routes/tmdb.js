const express = require('express');
const { asyncHandler, HttpError } = require('../lib/errors');
const metadata = require('../services/metadata');

const router = express.Router();

// The browser never sees the TMDB key: it calls these whitelisted read-only endpoints instead.
const ALLOWED = [
  /^\/trending\/(all|movie|tv)\/(day|week)$/,
  /^\/discover\/(movie|tv)$/,
  /^\/genre\/(movie|tv)\/list$/,
  /^\/(movie|tv)\/(popular|top_rated|now_playing|on_the_air|airing_today|upcoming)$/,
  /^\/search\/(movie|tv|multi)$/,
  /^\/(movie|tv)\/\d+$/,
  /^\/(movie|tv)\/\d+\/(recommendations|similar|credits|videos)$/
];

router.get(
  '/*splat',
  asyncHandler(async (req, res) => {
    if (!ALLOWED.some((re) => re.test(req.path))) throw new HttpError(404, 'Unsupported TMDB endpoint');

    const { api_key, ...params } = req.query; // never forward a client-supplied key
    try {
      res.set('Cache-Control', 'public, max-age=300');
      res.json(await metadata.tmdbCached(req.path, params));
    } catch (err) {
      if (err instanceof HttpError) throw err;
      const status = err.response?.status;
      if (status === 404) throw new HttpError(404, 'Not found on TMDB');
      throw new HttpError(502, 'Movie data provider is unavailable');
    }
  })
);

module.exports = router;
