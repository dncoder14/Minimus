import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tmdb, discoverAPI, watchlistAPI } from '../services/api'
import { fromTmdbMovie, fromTmdbTv, fromSummary, MOVIE_GENRES } from '../lib/media'
import HeroCarousel from '../components/HeroCarousel'
import PosterRow from '../components/PosterRow'
import { Chip, ErrorState, SectionHeader, PosterSkeleton } from '../components/ui'
import PosterCard from '../components/PosterCard'
import { GRID } from '../components/ui'

const Dashboard = () => {
  const [hero, setHero] = useState([])
  const [trending, setTrending] = useState([])
  const [series, setSeries] = useState([])
  const [recommended, setRecommended] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [genre, setGenre] = useState('trending')
  const [genreItems, setGenreItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [genreLoading, setGenreLoading] = useState(false)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [movies, tv] = await Promise.all([tmdb.get('/trending/movie/week'), tmdb.get('/trending/tv/week')])
      const mapped = (movies.results || []).map(fromTmdbMovie)
      setTrending(mapped)
      setHero(mapped.filter((m) => m.backdrop).slice(0, 5))
      setSeries((tv.results || []).map(fromTmdbTv))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
    // Personal rows are optional: a failure here should not hide the rest of the page
    discoverAPI.recommendations(14).then((res) => setRecommended((res.data.recommendations || []).map(fromSummary))).catch(() => {})
    watchlistAPI.get(14).then((res) => setWatchlist((res.data.watchlist || []).filter((w) => w.movie).map((w) => fromSummary(w.movie)))).catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (genre === 'trending') {
      setGenreItems(trending)
      return
    }
    let cancelled = false
    setGenreLoading(true)
    tmdb
      .get('/discover/movie', { with_genres: genre, sort_by: 'popularity.desc' })
      .then((data) => !cancelled && setGenreItems((data.results || []).map(fromTmdbMovie)))
      .catch(() => !cancelled && setGenreItems([]))
      .finally(() => !cancelled && setGenreLoading(false))
    return () => {
      cancelled = true
    }
  }, [genre, trending])

  if (error) return <ErrorState onRetry={load} />

  return (
    <div className="space-y-12">
      {loading ? <div className="aspect-[4/5] animate-pulse rounded-card bg-surface sm:aspect-[16/8] lg:aspect-[21/8]" /> : <HeroCarousel items={hero} />}

      {recommended.length > 0 && (
        <PosterRow title="Recommended for you" subtitle={recommended[0].reason} items={recommended} />
      )}

      <section>
        <SectionHeader
          title="Discover"
          action={
            <Link to={genre === 'trending' ? '/movies' : `/movies?genre=${genre}`} className="text-sm font-medium text-amber hover:underline">
              View all
            </Link>
          }
        />
        <div className="scrollbar-hide -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Chip active={genre === 'trending'} onClick={() => setGenre('trending')}>
            Trending
          </Chip>
          {MOVIE_GENRES.map((g) => (
            <Chip key={g.id} active={genre === String(g.id)} onClick={() => setGenre(String(g.id))}>
              {g.name}
            </Chip>
          ))}
        </div>
        {loading || genreLoading ? (
          <PosterSkeleton count={12} />
        ) : (
          <div className={GRID}>
            {genreItems.slice(0, 12).map((item) => (
              <PosterCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <PosterRow title="Trending series" subtitle="What everyone is watching this week" items={series} loading={loading} action={<Link to="/series" className="mr-2 flex items-center text-sm font-medium text-amber hover:underline">View all</Link>} />

      {watchlist.length > 0 && (
        <PosterRow
          title="From your watchlist"
          items={watchlist}
          action={<Link to="/profile?tab=watchlist" className="mr-2 flex items-center text-sm font-medium text-amber hover:underline">View all</Link>}
        />
      )}
    </div>
  )
}

export default Dashboard
