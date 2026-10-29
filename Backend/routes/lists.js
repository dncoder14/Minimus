const express = require('express');
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, HttpError } = require('../lib/errors');
const { z, validate, page, limit, mediaId } = require('../lib/validate');
const metadata = require('../services/metadata');

// Builds the router shared by watchlist, favorites and watched: same shape, different table/labels.
function createListRouter({ model, label, listKey, checkKey, dateField }) {
  const router = express.Router();
  const table = () => prisma[model];
  const where = (userId, imdbId) => ({ userId_imdbId: { userId, imdbId } });

  // Attach cached movie metadata so clients don't need a request per item
  async function withMovies(items) {
    const movies = await metadata.getSummaries(items.map((i) => i.imdbId));
    const byId = new Map(movies.map((m) => [m.id, m]));
    return items.map((item) => ({ ...item, movie: byId.get(item.imdbId) || null }));
  }

  router.post(
    '/',
    authenticateToken,
    validate({ body: z.object({ imdbId: mediaId }) }),
    asyncHandler(async (req, res) => {
      const { imdbId } = req.body;
      const existing = await table().findUnique({ where: where(req.user.id, imdbId) });
      if (existing) throw new HttpError(409, `Movie already in ${label}`);

      const entry = await table().create({ data: { userId: req.user.id, imdbId } });
      metadata.getDetails(imdbId).catch(() => {}); // warm the Movie cache, best effort
      res.status(201).json({ message: `Movie added to ${label}`, [`${listKey}Entry`]: entry, entry });
    })
  );

  router.delete(
    '/:imdbId',
    authenticateToken,
    asyncHandler(async (req, res) => {
      const result = await table().deleteMany({ where: { userId: req.user.id, imdbId: req.params.imdbId } });
      if (result.count === 0) throw new HttpError(404, `Movie not in ${label}`);
      res.json({ message: `Movie removed from ${label}` });
    })
  );

  router.get(
    '/',
    authenticateToken,
    validate({ query: z.object({ page, limit: limit(100, 20) }) }),
    asyncHandler(async (req, res) => {
      const { page: pageNum, limit: take } = req.query;
      const [items, totalItems] = await Promise.all([
        table().findMany({
          where: { userId: req.user.id },
          orderBy: { [dateField]: 'desc' },
          take,
          skip: (pageNum - 1) * take
        }),
        table().count({ where: { userId: req.user.id } })
      ]);

      res.json({
        [listKey]: await withMovies(items),
        totalItems,
        page: pageNum,
        totalPages: Math.ceil(totalItems / take)
      });
    })
  );

  router.get(
    '/check/:imdbId',
    authenticateToken,
    asyncHandler(async (req, res) => {
      const entry = await table().findUnique({ where: where(req.user.id, req.params.imdbId) });
      res.json({ [checkKey]: !!entry });
    })
  );

  router.delete(
    '/',
    authenticateToken,
    asyncHandler(async (req, res) => {
      await table().deleteMany({ where: { userId: req.user.id } });
      res.json({ message: `${label} cleared successfully` });
    })
  );

  return router;
}

module.exports = { createListRouter };
