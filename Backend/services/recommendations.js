const prisma = require('../lib/prisma');
const metadata = require('./metadata');

// Weight of each signal when building a user's genre taste profile
const WEIGHTS = { favorite: 3, watched: 1, watchlist: 0.5 };
const ratingWeight = (rating) => rating - 2.5; // 5★ = +2.5, 1★ = -1.5, 3★ ≈ neutral

// Pure: turn weighted interactions into { genre: score }. Exported for unit tests.
function genreAffinity(interactions) {
  const scores = {};
  for (const { genres, weight } of interactions) {
    for (const genre of genres) scores[genre] = (scores[genre] || 0) + weight;
  }
  return scores;
}

const topGenres = (scores, n) =>
  Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([genre]) => genre);

// Pure: given the target user's liked ids and other users' liked ids, score unseen movies by how
// many similar users liked them, weighted by taste overlap (Jaccard similarity).
function collaborativeScores(myLiked, seen, othersLiked) {
  const mine = new Set(myLiked);
  const scores = new Map();
  for (const theirs of othersLiked) {
    const overlap = theirs.filter((id) => mine.has(id)).length;
    if (overlap === 0) continue;
    const similarity = overlap / (mine.size + theirs.length - overlap);
    for (const id of theirs) {
      if (seen.has(id)) continue;
      scores.set(id, (scores.get(id) || 0) + similarity);
    }
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id, score]) => ({ id, score }));
}

async function loadUserSignals(userId) {
  const [favorites, watched, watchlist, reviews] = await Promise.all([
    prisma.favorite.findMany({ where: { userId }, select: { imdbId: true } }),
    prisma.watched.findMany({ where: { userId }, select: { imdbId: true } }),
    prisma.watchlist.findMany({ where: { userId }, select: { imdbId: true } }),
    prisma.review.findMany({ where: { userId }, select: { imdbId: true, rating: true } })
  ]);
  return { favorites, watched, watchlist, reviews };
}

async function recommend(userId, { limit = 12 } = {}) {
  const { favorites, watched, watchlist, reviews } = await loadUserSignals(userId);
  const seen = new Set([...watched, ...reviews].map((x) => x.imdbId));
  const liked = [...new Set([...favorites.map((f) => f.imdbId), ...reviews.filter((r) => r.rating >= 4).map((r) => r.imdbId)])];

  const picks = [];
  const picked = new Set();
  const add = (movie, reason) => {
    if (!movie || picked.has(movie.id) || seen.has(movie.id)) return;
    picked.add(movie.id);
    picks.push({ ...movie, reason });
  };

  // 1) Collaborative: movies liked by users whose taste overlaps with mine
  if (liked.length > 0) {
    const others = await prisma.review.findMany({
      where: { rating: { gte: 4 }, userId: { not: userId }, imdbId: { in: liked } },
      select: { userId: true }
    });
    const similarUsers = [...new Set(others.map((o) => o.userId))].slice(0, 200);
    if (similarUsers.length > 0) {
      const theirReviews = await prisma.review.findMany({
        where: { userId: { in: similarUsers }, rating: { gte: 4 } },
        select: { userId: true, imdbId: true }
      });
      const byUser = new Map();
      for (const r of theirReviews) byUser.set(r.userId, [...(byUser.get(r.userId) || []), r.imdbId]);
      const ranked = collaborativeScores(liked, seen, [...byUser.values()]).slice(0, limit);
      const movies = await metadata.getSummaries(ranked.map((r) => r.id));
      movies.forEach((m) => add(m, 'Liked by people with similar taste'));
    }
  }

  // 2) Content-based: top genres from what the user has watched, favorited and rated
  const interactions = [];
  const ids = [
    ...favorites.map((f) => ({ id: f.imdbId, weight: WEIGHTS.favorite })),
    ...watched.map((w) => ({ id: w.imdbId, weight: WEIGHTS.watched })),
    ...watchlist.map((w) => ({ id: w.imdbId, weight: WEIGHTS.watchlist })),
    ...reviews.map((r) => ({ id: r.imdbId, weight: ratingWeight(r.rating) }))
  ];
  if (ids.length > 0) {
    const movies = await metadata.getSummaries(ids.map((i) => i.id));
    const genresById = new Map(movies.map((m) => [m.id, m.genres]));
    for (const { id, weight } of ids) interactions.push({ genres: genresById.get(id) || [], weight });
  }
  const favouriteGenres = topGenres(genreAffinity(interactions), 2);

  if (favouriteGenres.length > 0 && picks.length < limit) {
    const genreList = await metadata.tmdbCached('/genre/movie/list');
    const genreIds = genreList.genres.filter((g) => favouriteGenres.includes(g.name)).map((g) => g.id);
    if (genreIds.length > 0) {
      const found = await metadata.tmdbCached('/discover/movie', {
        with_genres: genreIds.join(','),
        sort_by: 'vote_average.desc',
        'vote_count.gte': 1000
      });
      for (const m of found.results || []) {
        add(
          {
            id: `tmdb${m.id}`,
            title: m.title,
            year: m.release_date?.split('-')[0] || null,
            type: 'movie',
            poster: m.poster_path ? `${metadata.TMDB_IMAGE}${m.poster_path}` : null,
            rating: m.vote_average || null
          },
          `Because you like ${favouriteGenres.join(' & ')}`
        );
      }
    }
  }

  // 3) Cold start: trending
  if (picks.length === 0) {
    const trending = await metadata.tmdbCached('/trending/movie/week');
    for (const m of trending.results || []) {
      add(
        {
          id: `tmdb${m.id}`,
          title: m.title,
          year: m.release_date?.split('-')[0] || null,
          type: 'movie',
          poster: m.poster_path ? `${metadata.TMDB_IMAGE}${m.poster_path}` : null,
          rating: m.vote_average || null
        },
        'Trending this week'
      );
    }
  }

  return picks.slice(0, limit);
}

module.exports = { genreAffinity, topGenres, collaborativeScores, recommend };
