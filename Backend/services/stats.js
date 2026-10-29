const prisma = require('../lib/prisma');
const metadata = require('./metadata');

const minutes = (runtime) => {
  const m = String(runtime || '').match(/(\d+)\s*min/);
  return m ? parseInt(m[1], 10) : 0;
};

// Pure aggregation over already-loaded rows. Exported for unit tests.
function summarize({ watched, reviews, movies }) {
  const byId = new Map(movies.map((m) => [m.id, m]));

  const genreCounts = {};
  let totalMinutes = 0;
  for (const w of watched) {
    const movie = byId.get(w.imdbId);
    if (!movie) continue;
    totalMinutes += minutes(movie.runtime);
    for (const g of movie.genres) genreCounts[g] = (genreCounts[g] || 0) + 1;
  }

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) ratingDistribution[r.rating] += 1;

  const perMonth = {};
  for (const w of watched) {
    const key = new Date(w.watchedAt).toISOString().slice(0, 7);
    perMonth[key] = (perMonth[key] || 0) + 1;
  }

  return {
    watchedCount: watched.length,
    hoursWatched: Math.round((totalMinutes / 60) * 10) / 10,
    topGenres: Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count })),
    averageRating: reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0,
    ratingDistribution,
    watchedPerMonth: Object.entries(perMonth).sort().map(([month, count]) => ({ month, count }))
  };
}

async function userStats(userId) {
  const [watched, reviews] = await Promise.all([
    prisma.watched.findMany({ where: { userId }, select: { imdbId: true, watchedAt: true } }),
    prisma.review.findMany({ where: { userId }, select: { rating: true } })
  ]);
  const movies = await metadata.getSummaries(watched.map((w) => w.imdbId));
  return summarize({ watched, reviews, movies });
}

module.exports = { summarize, userStats };
