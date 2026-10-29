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
