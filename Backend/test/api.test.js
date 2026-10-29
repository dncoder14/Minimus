const request = require('supertest');

// Upstream providers are mocked so tests are fast, offline and deterministic
jest.mock('../services/metadata', () => {
  const movies = {
    tt0111161: { id: 'tt0111161', title: 'The Shawshank Redemption', year: '1994', type: 'movie', poster: null, plot: null, genres: ['Drama'], runtime: '142 min', director: null, actors: null, rating: 9.3, votes: 1 },
    tt0068646: { id: 'tt0068646', title: 'The Godfather', year: '1972', type: 'movie', poster: null, plot: null, genres: ['Crime', 'Drama'], runtime: '175 min', director: null, actors: null, rating: 9.2, votes: 1 }
  };
  return {
    TMDB_IMAGE: 'https://image.tmdb.org/t/p/w500',
    getSummaries: jest.fn(async (ids) => ids.map((id) => movies[id]).filter(Boolean)),
    getDetails: jest.fn(async (id) => ({ Title: movies[id]?.title || 'Unknown', imdbID: id })),
    getPopular: jest.fn(async () => []),
    searchOmdb: jest.fn(async () => ({ results: [], totalResults: 0 })),
    tmdbCached: jest.fn(async (path) => (path === '/genre/movie/list' ? { genres: [{ id: 18, name: 'Drama' }] } : { results: [] }))
  };
});

const app = require('../app');
const prisma = require('../lib/prisma');

const email = (n) => `${n}-${Date.now()}@test.dev`;
const register = async (name) => {
  const res = await request(app).post('/api/auth/register').send({ name, email: email(name), password: 'secret123' });
  return { token: res.body.token, user: res.body.user, res };
};
const auth = (token) => ({ Authorization: `Bearer ${token}` });

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: '@test.dev' } } });
  await prisma.$disconnect();
});

describe('system', () => {
  test('health reports database status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('up');
  });

  test('unknown routes return JSON 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe('auth', () => {
  test('register validates input', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'x', email: 'not-an-email', password: '123' });
    expect(res.status).toBe(400);
  });

  test('register, then login, then /me', async () => {
    const { token, res } = await register('alice');
    expect(res.status).toBe(201);
    expect(res.body.user.password).toBeUndefined();

    const me = await request(app).get('/api/auth/me').set(auth(token));
    expect(me.status).toBe(200);
    expect(me.body.user.name).toBe('alice');
  });

  test('login rejects a wrong password', async () => {
    const addr = email('bob');
    await request(app).post('/api/auth/register').send({ name: 'bob', email: addr, password: 'secret123' });
    const res = await request(app).post('/api/auth/login').send({ email: addr, password: 'wrong-pass' });
    expect(res.status).toBe(401);
  });

  test('protected routes require a token', async () => {
    expect((await request(app).get('/api/watchlist')).status).toBe(401);
    expect((await request(app).get('/api/watchlist').set(auth('garbage'))).status).toBe(403);
  });

  test('google login rejects a forged credential', async () => {
    const forged = ['eyJhbGciOiJub25lIn0', Buffer.from(JSON.stringify({ email: 'a@b.c', email_verified: true })).toString('base64url'), 'sig'].join('.');
    const res = await request(app).post('/api/auth/google').send({ credential: forged });
    expect(res.status).toBe(401);
  });
});

describe('lists', () => {
  test('watchlist add, duplicate, check, list with metadata, remove', async () => {
    const { token } = await register('lister');
    const add = await request(app).post('/api/watchlist').set(auth(token)).send({ imdbId: 'tt0111161' });
    expect(add.status).toBe(201);

    const dup = await request(app).post('/api/watchlist').set(auth(token)).send({ imdbId: 'tt0111161' });
    expect(dup.status).toBe(409);

    const check = await request(app).get('/api/watchlist/check/tt0111161').set(auth(token));
    expect(check.body.inWatchlist).toBe(true);

    const list = await request(app).get('/api/watchlist').set(auth(token));
    expect(list.body.totalItems).toBe(1);
    expect(list.body.watchlist[0].movie.title).toBe('The Shawshank Redemption');

    expect((await request(app).delete('/api/watchlist/tt0111161').set(auth(token))).status).toBe(200);
    expect((await request(app).delete('/api/watchlist/tt0111161').set(auth(token))).status).toBe(404);
  });

  test('rejects malformed ids', async () => {
    const { token } = await register('badid');
    const res = await request(app).post('/api/favorites').set(auth(token)).send({ imdbId: "x'; DROP TABLE" });
    expect(res.status).toBe(400);
  });
});

describe('reviews', () => {
  test('rating bounds are enforced, reviews upsert, likes work and sort by helpfulness', async () => {
    const author = await register('author');
    const fan = await register('fan');

    expect((await request(app).post('/api/reviews').set(auth(author.token)).send({ imdbId: 'tt0111161', rating: 9 })).status).toBe(400);

    const saved = await request(app).post('/api/reviews').set(auth(author.token)).send({ imdbId: 'tt0111161', rating: 5, comment: 'Great', spoiler: true });
    expect(saved.status).toBe(201);
    const reviewId = saved.body.review.id;

    // updating keeps one review per user per title
    await request(app).post('/api/reviews').set(auth(author.token)).send({ imdbId: 'tt0111161', rating: 4 });
    expect(await prisma.review.count({ where: { userId: author.user.id } })).toBe(1);

    expect((await request(app).post(`/api/reviews/${reviewId}/like`).set(auth(author.token))).status).toBe(400); // own review
    const like = await request(app).post(`/api/reviews/${reviewId}/like`).set(auth(fan.token));
    expect(like.body).toEqual({ likeCount: 1, likedByMe: true });

    const list = await request(app).get('/api/reviews/movie/tt0111161?sort=helpful').set(auth(fan.token));
    expect(list.body.reviews[0].likeCount).toBe(1);
    expect(list.body.reviews[0].likedByMe).toBe(true);

    const unlike = await request(app).delete(`/api/reviews/${reviewId}/like`).set(auth(fan.token));
    expect(unlike.body.likeCount).toBe(0);
  });
});

describe('recommendations and stats', () => {
  test('recommends from taste overlap and reports stats', async () => {
    const a = await register('reca');
    const b = await register('recb');

    // both love The Godfather; only B also loved Shawshank
    await request(app).post('/api/reviews').set(auth(a.token)).send({ imdbId: 'tt0068646', rating: 5 });
    await request(app).post('/api/reviews').set(auth(b.token)).send({ imdbId: 'tt0068646', rating: 5 });
    await request(app).post('/api/reviews').set(auth(b.token)).send({ imdbId: 'tt0111161', rating: 5 });

    const recs = await request(app).get('/api/recommendations').set(auth(a.token));
    expect(recs.status).toBe(200);
    expect(recs.body.recommendations.map((r) => r.id)).toContain('tt0111161');

    await request(app).post('/api/watched').set(auth(a.token)).send({ imdbId: 'tt0068646' });
    const stats = await request(app).get('/api/stats/me').set(auth(a.token));
    expect(stats.body.stats.watchedCount).toBe(1);
    expect(stats.body.stats.hoursWatched).toBeCloseTo(2.9, 1);
  });
});

describe('social', () => {
  test('follow, feed, unfollow', async () => {
    const a = await register('follower');
    const b = await register('followed');

    expect((await request(app).post(`/api/social/follow/${a.user.id}`).set(auth(a.token))).status).toBe(400);
    expect((await request(app).post(`/api/social/follow/${b.user.id}`).set(auth(a.token))).body.isFollowing).toBe(true);

    await request(app).post('/api/reviews').set(auth(b.token)).send({ imdbId: 'tt0111161', rating: 5, comment: 'Loved it' });
    const feed = await request(app).get('/api/social/feed').set(auth(a.token));
    expect(feed.body.items[0]).toMatchObject({ type: 'review', imdbId: 'tt0111161' });

    const profile = await request(app).get(`/api/social/users/${b.user.id}`).set(auth(a.token));
    expect(profile.body.isFollowing).toBe(true);

    expect((await request(app).delete(`/api/social/follow/${b.user.id}`).set(auth(a.token))).body.isFollowing).toBe(false);
  });
});

describe('admin and tmdb proxy', () => {
  test('admin routes reject normal users', async () => {
    const { token } = await register('plain');
    expect((await request(app).get('/api/admin/dashboard').set(auth(token))).status).toBe(403);
  });

  test('admin dashboard works for admins', async () => {
    const { token, user } = await register('boss');
    await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
    const res = await request(app).get('/api/admin/dashboard').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.stats.totalUsers).toBeGreaterThan(0);
  });

  test('tmdb proxy only serves whitelisted paths and never forwards a client key', async () => {
    const metadata = require('../services/metadata');
    expect((await request(app).get('/api/tmdb/trending/movie/week')).status).toBe(200);
    expect((await request(app).get('/api/tmdb/account/123')).status).toBe(404);

    await request(app).get('/api/tmdb/discover/movie?api_key=stolen&page=2');
    expect(metadata.tmdbCached).toHaveBeenLastCalledWith('/discover/movie', { page: '2' });
  });
});
