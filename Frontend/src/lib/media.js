// Helpers that turn TMDB and backend payloads into one "poster item" shape used by every card:
// { id, title, year, poster, rating, type, overview, backdrop }
export const TMDB_IMG = 'https://image.tmdb.org/t/p'

export const posterUrl = (path, size = 'w500') => (path ? `${TMDB_IMG}/${size}${path}` : null)

const year = (date) => (date ? date.split('-')[0] : null)
const rating = (value) => (value ? Math.round(value * 10) / 10 : null)

// Movies use `tmdb<id>` and series use `tmdbtv<id>`, because TMDB reuses ids across both types.
export const fromTmdbMovie = (m) => ({
  id: `tmdb${m.id}`,
  title: m.title,
  year: year(m.release_date),
  poster: posterUrl(m.poster_path),
  backdrop: posterUrl(m.backdrop_path, 'w1280'),
  rating: rating(m.vote_average),
  overview: m.overview,
  type: 'movie',
})

export const fromTmdbTv = (s) => ({
  id: `tmdbtv${s.id}`,
  title: s.name,
  year: year(s.first_air_date),
  poster: posterUrl(s.poster_path),
  backdrop: posterUrl(s.backdrop_path, 'w1280'),
  rating: rating(s.vote_average),
  overview: s.overview,
  type: 'series',
})

// Results from /search/multi can be movies, series or people
export const fromTmdbMulti = (item) => {
  if (item.media_type === 'movie') return fromTmdbMovie(item)
  if (item.media_type === 'tv') return fromTmdbTv(item)
  return null
}

// A row from the backend's Movie table (watchlist, favorites, recommendations, feed)
export const fromSummary = (row) => ({
  id: row.id,
  title: row.title,
  year: row.year,
  poster: row.poster,
  rating: row.rating ? Math.round(row.rating * 10) / 10 : null,
  overview: row.plot,
  type: row.type,
  reason: row.reason,
})

export const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
]
