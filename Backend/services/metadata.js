const axios = require('axios');
const prisma = require('../lib/prisma');
const cache = require('../lib/cache');
const { HttpError } = require('../lib/errors');

const TMDB_BASE = 'https://api.themoviedb.org/3';
const OMDB_BASE = 'https://www.omdbapi.com/';
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500';

const HOUR = 3600;
const TTL = { details: 24 * HOUR, list: HOUR, search: 30 * 60 };

const http = axios.create({ timeout: 8000 });

// One retry for transient upstream failures (timeouts, 5xx)
async function requestWithRetry(config) {
  try {
    return await http.request(config);
  } catch (err) {
    const status = err.response?.status;
    if (!status || status >= 500) return http.request(config);
    throw err;
  }
}

async function tmdbGet(path, params = {}) {
  if (!process.env.TMDB_API_KEY) throw new HttpError(503, 'TMDB is not configured');
  const response = await requestWithRetry({
    url: `${TMDB_BASE}${path}`,
    params: { ...params, api_key: process.env.TMDB_API_KEY }
  });
  return response.data;
}

async function omdbGet(params) {
  const response = await requestWithRetry({
    url: OMDB_BASE,
    params: { ...params, apikey: process.env.OMDB_API_KEY }
  });
  return response.data;
}

// Cached TMDB passthrough used by the /api/tmdb proxy route
function tmdbCached(path, params = {}) {
  const key = `tmdb:${path}:${JSON.stringify(Object.entries(params).sort())}`;
  return cache.wrap(key, TTL.list, () => tmdbGet(path, params));
}

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// ---- Normalisers: both providers map to the OMDb-style shape the frontend already renders ----

function fromTmdb(data, type) {
  const isTv = type === 'tv';
  const date = isTv ? data.first_air_date : data.release_date;
  const crew = data.credits?.crew || [];
  return {
    id: `tmdb${data.id}`,
    Title: isTv ? data.name : data.title,
    Year: date?.split('-')[0] || null,
    Rated: 'Not Rated',
    Released: date || null,
    Runtime: isTv
      ? (data.episode_run_time?.[0] ? `${data.episode_run_time[0]} min` : 'N/A')
      : (data.runtime ? `${data.runtime} min` : 'N/A'),
    Genre: data.genres?.map((g) => g.name).join(', ') || '',
    Director: isTv
      ? data.created_by?.map((c) => c.name).join(', ') || 'N/A'
      : crew.find((c) => c.job === 'Director')?.name || 'N/A',
    Writer: isTv
      ? data.created_by?.map((c) => c.name).join(', ') || 'N/A'
      : crew.filter((c) => c.job === 'Writer').map((c) => c.name).join(', ') || 'N/A',
    Actors: data.credits?.cast?.slice(0, 5).map((c) => c.name).join(', ') || 'N/A',
    Plot: data.overview,
    Language: data.original_language,
    Country: isTv
      ? data.origin_country?.join(', ') || 'N/A'
      : data.production_countries?.map((c) => c.name).join(', ') || 'N/A',
    Awards: 'N/A',
    Poster: data.poster_path ? `${TMDB_IMAGE}${data.poster_path}` : 'N/A',
    Ratings: [{ Source: 'TMDB', Value: `${data.vote_average}/10` }],
    imdbRating: data.vote_average ? data.vote_average.toFixed(1) : 'N/A',
    imdbVotes: data.vote_count?.toLocaleString(),
    Type: isTv ? 'series' : 'movie',
    BoxOffice: 'N/A',
    Production: data.production_companies?.map((c) => c.name).join(', ') || 'N/A'
  };
}

function toRow(id, d) {
  return {
    id,
    title: d.Title || 'Untitled',
    year: d.Year || null,
    type: d.Type === 'series' ? 'series' : 'movie',
    poster: d.Poster && d.Poster !== 'N/A' ? d.Poster : null,
    plot: d.Plot && d.Plot !== 'N/A' ? d.Plot : null,
    genres: (d.Genre || '').split(',').map((g) => g.trim()).filter(Boolean),
    runtime: d.Runtime && d.Runtime !== 'N/A' ? d.Runtime : null,
    director: d.Director && d.Director !== 'N/A' ? d.Director : null,
    actors: d.Actors && d.Actors !== 'N/A' ? d.Actors : null,
    rating: num(d.imdbRating),
    votes: d.imdbVotes ? parseInt(String(d.imdbVotes).replace(/,/g, ''), 10) || null : null
  };
}

async function saveMovie(id, details) {
  const row = toRow(id, details);
  try {
    await prisma.movie.upsert({ where: { id }, update: { ...row, fetchedAt: new Date() }, create: row });
  } catch (err) {
    console.error('Failed to cache movie row:', err.message);
  }
}

async function fetchTmdbDetails(rawId, preferred) {
  const order = preferred ? [preferred] : ['movie', 'tv'];
  for (const type of order) {
    try {
      const data = await tmdbGet(`/${type}/${rawId}`, { append_to_response: 'credits' });
      if (data?.id) return fromTmdb(data, type);
    } catch (err) {
      if (err.response?.status !== 404) throw err;
    }
  }
  return null;
}

// Full details for "tt123" (OMDb) or "tmdb603" / "tmdbtv1399" (TMDB) ids.
async function getDetails(id) {
  const details = await cache.wrap(`details:${id}`, TTL.details, async () => {
    let result = null;
    const tmdb = id.match(/^tmdb(movie|tv)?(\d+)$/);
    if (tmdb) {
      result = await fetchTmdbDetails(tmdb[2], tmdb[1]);
    } else {
      const data = await omdbGet({ i: id });
      result = data.Response === 'True' ? data : null;
    }
    return result;
  });

  if (!details) throw new HttpError(404, 'Movie not found');
  // Keep the DB copy fresh in the background; list views and recommendations read from it
  saveMovie(id, details);
  return details;
}

// Summaries for many ids at once. Hits the Movie table first, then falls back to upstream.
async function getSummaries(ids) {
  const unique = [...new Set(ids)];
  const rows = await prisma.movie.findMany({ where: { id: { in: unique } } });
  const byId = new Map(rows.map((r) => [r.id, r]));

  const missing = unique.filter((id) => !byId.has(id));
  await Promise.all(
    missing.map(async (id) => {
      try {
        const details = await getDetails(id);
        byId.set(id, toRow(id, details));
      } catch {
        // skip ids that cannot be resolved
      }
    })
  );
  return unique.map((id) => byId.get(id)).filter(Boolean);
}

async function searchOmdb(query, page) {
  return cache.wrap(`search:${query.toLowerCase()}:${page}`, TTL.search, async () => {
    const data = await omdbGet({ s: query, page });
    if (data.Response !== 'True') return { results: [], totalResults: 0 };

    const results = (
      await Promise.all(data.Search.slice(0, 10).map((item) => getDetails(item.imdbID).catch(() => null)))
    ).filter(Boolean);
    return { results, totalResults: parseInt(data.totalResults, 10) || results.length };
  });
}

// ---- Paged discovery ----
// TMDB returns a fixed 20 titles per page and has no page-size option. To offer any `limit`, a page
// is cut out of the combined results of the one or more TMDB pages it spans.
const TMDB_PAGE_SIZE = 20;
const TMDB_MAX_PAGES = 500; // TMDB only serves the first 500 pages

// Which TMDB pages cover our page, and where our first item sits inside the combined results
function pageWindow(page, limit) {
  const start = (page - 1) * limit;
  const firstTmdbPage = Math.floor(start / TMDB_PAGE_SIZE) + 1;
  const lastTmdbPage = Math.floor((start + limit - 1) / TMDB_PAGE_SIZE) + 1;
  return { firstTmdbPage, lastTmdbPage, offset: start - (firstTmdbPage - 1) * TMDB_PAGE_SIZE };
}

const SORTS = {
  movie: { popular: 'popularity.desc', top_rated: 'vote_average.desc', newest: 'primary_release_date.desc' },
  tv: { popular: 'popularity.desc', top_rated: 'vote_average.desc', newest: 'first_air_date.desc' }
};

// One shape for every poster card: { id, title, year, poster, backdrop, rating, overview, type }
function toPosterItem(raw, kind) {
  const isTv = kind === 'tv';
  const date = isTv ? raw.first_air_date : raw.release_date;
  return {
    id: `${isTv ? 'tmdbtv' : 'tmdb'}${raw.id}`,
    title: isTv ? raw.name : raw.title,
    year: date ? date.split('-')[0] : null,
    poster: raw.poster_path ? `${TMDB_IMAGE}${raw.poster_path}` : null,
    backdrop: raw.backdrop_path ? `https://image.tmdb.org/t/p/w1280${raw.backdrop_path}` : null,
    rating: raw.vote_average ? Math.round(raw.vote_average * 10) / 10 : null,
    overview: raw.overview,
    type: isTv ? 'series' : 'movie'
  };
}

// `fetchPage` is injectable so the paging maths can be tested without network access
async function discover(kind, { genre, year, sort = 'popular', page = 1, limit = 18 }, fetchPage = tmdbCached) {
  const params = { sort_by: SORTS[kind][sort] };
  if (kind === 'movie') params['vote_count.gte'] = 50;
  if (genre) params.with_genres = genre;
  if (year) params[kind === 'movie' ? 'primary_release_year' : 'first_air_date_year'] = year;

  const { firstTmdbPage, lastTmdbPage, offset } = pageWindow(page, limit);
  if (firstTmdbPage > TMDB_MAX_PAGES) return { results: [], page, limit, totalResults: 0, totalPages: 0 };

  const pages = [];
  for (let p = firstTmdbPage; p <= Math.min(lastTmdbPage, TMDB_MAX_PAGES); p += 1) pages.push(p);
  const responses = await Promise.all(pages.map((p) => fetchPage(`/discover/${kind}`, { ...params, page: p })));

  const combined = responses.flatMap((r) => r.results || []);
  const totalResults = Math.min(responses[0].total_results || 0, TMDB_MAX_PAGES * TMDB_PAGE_SIZE);
  return {
    results: combined.slice(offset, offset + limit).map((item) => toPosterItem(item, kind)),
    page,
    limit,
    totalResults,
    totalPages: Math.ceil(totalResults / limit)
  };
}

const POPULAR_IDS = [
  'tt0111161', 'tt0068646', 'tt0468569', 'tt0050083', 'tt0108052',
  'tt0167260', 'tt0110912', 'tt0060196', 'tt0137523', 'tt0120737'
];

async function getPopular() {
  const settled = await Promise.all(POPULAR_IDS.map((id) => getDetails(id).catch(() => null)));
  return settled.filter(Boolean);
}

module.exports = { discover, pageWindow, toPosterItem, tmdbCached, getDetails, getSummaries, searchOmdb, getPopular, saveMovie, toRow, TMDB_IMAGE };
