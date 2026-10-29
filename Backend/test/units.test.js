const { genreAffinity, topGenres, collaborativeScores } = require('../services/recommendations');
const { summarize } = require('../services/stats');

describe('recommendations', () => {
  test('genreAffinity sums weights per genre', () => {
    const scores = genreAffinity([
      { genres: ['Drama', 'Crime'], weight: 3 },
      { genres: ['Drama'], weight: 1 },
      { genres: ['Comedy'], weight: -1.5 }
    ]);
    expect(scores).toEqual({ Drama: 4, Crime: 3, Comedy: -1.5 });
  });

  test('topGenres ignores negative scores and respects the limit', () => {
    expect(topGenres({ A: 5, B: 3, C: -2, D: 1 }, 2)).toEqual(['A', 'B']);
  });

  test('collaborativeScores ranks unseen titles by similarity and skips seen ones', () => {
    const mine = ['m1', 'm2'];
    const seen = new Set(['m1', 'm2', 'm3']);
    const others = [
      ['m1', 'm2', 'x'], // very similar user
      ['m1', 'y', 'z'], // weakly similar user
      ['q', 'r'] // no overlap, ignored
    ];
    const ranked = collaborativeScores(mine, seen, others).map((r) => r.id);
    expect(ranked[0]).toBe('x');
    expect(ranked).toEqual(expect.arrayContaining(['x', 'y', 'z']));
    expect(ranked).not.toContain('m3');
    expect(ranked).not.toContain('q');
  });
});

describe('stats', () => {
  test('summarize computes hours, genres, ratings and monthly counts', () => {
    const result = summarize({
      watched: [
        { imdbId: 'a', watchedAt: '2026-01-10T00:00:00Z' },
        { imdbId: 'b', watchedAt: '2026-01-20T00:00:00Z' },
        { imdbId: 'c', watchedAt: '2026-02-01T00:00:00Z' }
      ],
      reviews: [{ rating: 5 }, { rating: 4 }, { rating: 4 }],
      movies: [
        { id: 'a', runtime: '120 min', genres: ['Drama'] },
        { id: 'b', runtime: '60 min', genres: ['Drama', 'Crime'] },
        { id: 'c', runtime: 'N/A', genres: ['Comedy'] }
      ]
    });
    expect(result.watchedCount).toBe(3);
    expect(result.hoursWatched).toBe(3);
    expect(result.topGenres[0]).toEqual({ genre: 'Drama', count: 2 });
    expect(result.averageRating).toBe(4.3);
    expect(result.ratingDistribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 2, 5: 1 });
    expect(result.watchedPerMonth).toEqual([
      { month: '2026-01', count: 2 },
      { month: '2026-02', count: 1 }
    ]);
  });
});

describe('paged discovery', () => {
  // jest.mock in api.test.js is per-file, so the real service is loaded here
  const { pageWindow, discover } = require('../services/metadata');

  test('pageWindow maps our pages onto TMDB pages of 20', () => {
    expect(pageWindow(1, 18)).toEqual({ firstTmdbPage: 1, lastTmdbPage: 1, offset: 0 });
    expect(pageWindow(2, 18)).toEqual({ firstTmdbPage: 1, lastTmdbPage: 2, offset: 18 }); // items 18-35
    expect(pageWindow(3, 18)).toEqual({ firstTmdbPage: 2, lastTmdbPage: 3, offset: 16 }); // items 36-53
    expect(pageWindow(4, 18)).toEqual({ firstTmdbPage: 3, lastTmdbPage: 4, offset: 14 }); // items 54-71
    expect(pageWindow(1, 20)).toEqual({ firstTmdbPage: 1, lastTmdbPage: 1, offset: 0 });
    expect(pageWindow(1, 40)).toEqual({ firstTmdbPage: 1, lastTmdbPage: 2, offset: 0 });
  });

  // Fake TMDB: 10,000 results, ids are the global position so gaps and repeats are easy to spot
  const fakeTmdb = jest.fn(async (path, params) => ({
    total_results: 10000,
    results: Array.from({ length: 20 }, (_, i) => ({ id: (params.page - 1) * 20 + i, title: `Movie ${i}` }))
  }));

  test('consecutive pages join up with no gaps or repeats', async () => {
    const ids = [];
    for (let p = 1; p <= 5; p += 1) {
      const { results } = await discover('movie', { page: p, limit: 18 }, fakeTmdb);
      expect(results).toHaveLength(18);
      ids.push(...results.map((r) => r.id));
    }
    expect(ids).toEqual(Array.from({ length: 90 }, (_, i) => `tmdb${i}`));
  });

  test('reports totals, builds filters and respects the 500 page cap', async () => {
    fakeTmdb.mockClear();
    const res = await discover('movie', { genre: 28, year: 2024, sort: 'top_rated', page: 1, limit: 18 }, fakeTmdb);
    expect(res.totalResults).toBe(10000);
    expect(res.totalPages).toBe(Math.ceil(10000 / 18));
    expect(fakeTmdb).toHaveBeenCalledWith('/discover/movie', {
      sort_by: 'vote_average.desc', 'vote_count.gte': 50, with_genres: 28, primary_release_year: 2024, page: 1
    });

    const beyond = await discover('movie', { page: 600, limit: 18 }, fakeTmdb); // start 10782 > TMDB's 10000
    expect(beyond.results).toEqual([]);
  });

  test('series use the tv id prefix and tv-specific params', async () => {
    fakeTmdb.mockClear();
    const res = await discover('tv', { year: 2020, sort: 'newest', page: 1, limit: 5 }, async (path, params) => {
      fakeTmdb(path, params);
      return { total_results: 1, results: [{ id: 7, name: 'Show', first_air_date: '2020-05-01', poster_path: '/p.jpg' }] };
    });
    expect(res.results[0]).toMatchObject({ id: 'tmdbtv7', title: 'Show', year: '2020', type: 'series' });
    expect(fakeTmdb.mock.calls[0][1]).toMatchObject({ sort_by: 'first_air_date.desc', first_air_date_year: 2020 });
  });
});
