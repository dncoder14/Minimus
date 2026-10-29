import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faEye, faHeart, faStar, faFilm } from '@fortawesome/free-solid-svg-icons'
import { watchlistAPI, favoritesAPI, watchedAPI, reviewsAPI, moviesAPI, discoverAPI, socialAPI } from '../services/api'
import { fromSummary } from '../lib/media'
import { useLibrary } from '../context/LibraryContext'
import PosterCard from '../components/PosterCard'
import { EmptyState, GRID, PageHeader, PosterSkeleton, Rating, cx } from '../components/ui'

const TABS = [
  { key: 'watchlist', label: 'Watchlist', icon: faBookmark },
  { key: 'favorites', label: 'Favorites', icon: faHeart },
  { key: 'watched', label: 'Watched', icon: faEye },
  { key: 'reviews', label: 'Reviews', icon: faStar },
]

const EMPTY = {
  watchlist: 'Save titles you want to watch and they will show up here.',
  favorites: 'Heart the titles you love and they will show up here.',
  watched: 'Mark what you have seen to build your viewing history.',
  reviews: 'Rate and review titles to see them here.',
}

const Stat = ({ value, label }) => (
  <div className="rounded-control border border-line bg-elevated/50 p-4">
    <div className="text-2xl font-bold">{value}</div>
    <div className="mt-0.5 text-xs text-muted">{label}</div>
  </div>
)

const Profile = ({ user }) => {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'watchlist'
  const { has } = useLibrary()

  const [lists, setLists] = useState({ watchlist: [], favorites: [], watched: [] })
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [privacy, setPrivacy] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [wl, fav, wd, rv] = await Promise.all([watchlistAPI.get(), favoritesAPI.get(), watchedAPI.get(), reviewsAPI.getUserReviews()])
      const toItems = (rows = []) => rows.filter((r) => r.movie).map((r) => fromSummary(r.movie))
      setLists({ watchlist: toItems(wl.data.watchlist), favorites: toItems(fav.data.favorites), watched: toItems(wd.data.watched) })

      const userReviews = rv.data.reviews || []
      const summaries = userReviews.length ? (await moviesAPI.getBatch(userReviews.map((r) => r.imdbId))).data.movies : []
      const byId = new Map(summaries.map((m) => [m.id, m]))
      setReviews(userReviews.map((r) => ({ ...r, movie: byId.get(r.imdbId) ? fromSummary(byId.get(r.imdbId)) : null })))
    } catch {
      toast.error('Could not load your library')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    discoverAPI.stats().then((res) => setStats(res.data.stats)).catch(() => {})
    socialAPI.getSettings().then((res) => setPrivacy(res.data.settings)).catch(() => {})
  }, [load])

  const updatePrivacy = async (changes) => {
    const previous = privacy
    setPrivacy({ ...privacy, ...changes })
    try {
      const res = await socialAPI.updateSettings(changes)
      setPrivacy(res.data.settings)
      toast.success('Privacy settings saved')
    } catch {
      setPrivacy(previous)
      toast.error('Could not save privacy settings')
    }
  }

  // Items vanish from a tab as soon as they are removed, without waiting for a refetch
  const visible = tab === 'reviews' ? reviews : lists[tab].filter((item) => has(tab, item.id))
  const counts = { watchlist: lists.watchlist.length, favorites: lists.favorites.length, watched: lists.watched.length, reviews: reviews.length }

  return (
    <div className="animate-fade-in space-y-8">
      <section className="card flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-amber text-3xl font-bold text-obsidian">
          {(user?.name || '?').trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight">{user?.name}</h1>
          <p className="truncate text-sm text-muted">{user?.email}</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-3 sm:w-auto">
          {[['watchlist', 'Watchlist'], ['favorites', 'Favorites'], ['reviews', 'Reviews']].map(([key, label]) => (
            <Stat key={key} value={counts[key]} label={label} />
          ))}
        </div>
      </section>

      {stats && stats.watchedCount > 0 && (
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-semibold">Viewing stats</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat value={stats.watchedCount} label="Titles watched" />
            <Stat value={stats.hoursWatched} label="Hours watched" />
            <Stat value={stats.averageRating || '-'} label="Average rating given" />
            <Stat value={stats.topGenres[0]?.genre || '-'} label="Top genre" />
          </div>
          {stats.topGenres.length > 0 && (
            <div className="mt-5 space-y-2.5">
              {stats.topGenres.map(({ genre, count }) => (
                <div key={genre} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-muted">{genre}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-elevated">
                    <div className="h-1.5 rounded-full bg-amber" style={{ width: `${(count / stats.topGenres[0].count) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-muted">{count}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {privacy && (
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Activity privacy</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Controls what others see in their feed and on your public profile. "Watched" is never shown on its own.</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label className="flex items-center gap-3 text-sm">
              <span className="text-muted">Who can see my activity</span>
              <select value={privacy.activityVisibility} onChange={(e) => updatePrivacy({ activityVisibility: e.target.value })} className="field w-auto py-2">
                <option value="PUBLIC">Everyone</option>
                <option value="FOLLOWERS">Followers only</option>
                <option value="PRIVATE">Only me</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={privacy.showFavorites} onChange={(e) => updatePrivacy({ showFavorites: e.target.checked })} className="accent-amber" />
              Show my favorites
            </label>
          </div>
        </section>
      )}

      <section>
        <PageHeader title="Your library" />
        <div className="scrollbar-hide -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0" role="tablist">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setParams({ tab: key }, { replace: true })}
              className={cx(
                '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                tab === key ? 'border-amber text-amber' : 'border-transparent text-muted hover:text-ink'
              )}
            >
              <FontAwesomeIcon icon={icon} />
              {label}
              <span className="rounded-full bg-elevated px-2 py-0.5 text-xs text-muted">{counts[key]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <PosterSkeleton count={10} />
        ) : visible.length === 0 ? (
          <EmptyState icon={faFilm} title={`Nothing in your ${tab} yet`}>
            {EMPTY[tab]}{' '}
            <Link to="/movies" className="text-amber hover:underline">Browse movies</Link>
          </EmptyState>
        ) : tab === 'reviews' ? (
          <ul className="space-y-3">
            {visible.map((review) => (
              <li key={review.id} className="card flex gap-4 p-4">
                {review.movie && (
                  <Link to={`/movie/${review.imdbId}`} className="w-16 shrink-0 sm:w-20">
                    <div className="aspect-[2/3] overflow-hidden rounded-control border border-line bg-elevated">
                      {review.movie.poster && <img src={review.movie.poster} alt={review.movie.title} className="h-full w-full object-cover" />}
                    </div>
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <Link to={`/movie/${review.imdbId}`} className="font-medium hover:text-amber">{review.movie?.title || review.imdbId}</Link>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <Rating value={review.rating} /> <span>/ 5</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p className="mt-2 line-clamp-3 text-sm text-ink/85">{review.comment}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={GRID}>
            {visible.map((item) => (
              <PosterCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Profile
