import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import { socialAPI } from '../services/api'
import { EmptyState, PageHeader, Rating, cx } from '../components/ui'

// "reviewed, favorited and watched" style sentence from a card's actions
const describe = (actions) => {
  const order = ['reviewed', 'favorited', 'watched']
  const list = order.filter((a) => actions.includes(a))
  return list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}` : list[0]
}

const Avatar = ({ name }) => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-sm font-semibold">
    {name.charAt(0).toUpperCase()}
  </span>
)

const Community = () => {
  const [feed, setFeed] = useState([])
  const [following, setFollowing] = useState(0)
  const [feedLoading, setFeedLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)

  const loadFeed = async () => {
    try {
      const res = await socialAPI.feed()
      setFeed(res.data.items || [])
      setFollowing(res.data.following || 0)
    } catch {
      toast.error('Could not load your feed')
    } finally {
      setFeedLoading(false)
    }
  }

  useEffect(() => {
    loadFeed()
  }, [])

  // Search as the user types (debounced)
  useEffect(() => {
    const term = query.trim()
    if (!term) {
      setResults([])
      setSearched(false)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await socialAPI.searchUsers(term)
        setResults(res.data.users || [])
        setSearched(true)
      } catch {
        toast.error('Search failed')
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const toggleFollow = async (person) => {
    try {
      if (person.isFollowing) await socialAPI.unfollow(person.id)
      else await socialAPI.follow(person.id)
      setResults((prev) => prev.map((p) => (p.id === person.id ? { ...p, isFollowing: !p.isFollowing } : p)))
      loadFeed()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not update follow')
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Community" subtitle="See what people you follow are watching and reviewing" />

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Activity</h2>

          {feedLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-card bg-surface" />
              ))}
            </div>
          ) : feed.length === 0 ? (
            <EmptyState icon={faUserGroup} title={following === 0 ? 'You are not following anyone yet' : 'No recent activity'}>
              {following === 0 ? 'Search for people on the right and follow them to fill your feed.' : 'Their reviews and favorites will appear here.'}
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {feed.map((item, i) => (
                <li key={`${item.imdbId}-${item.user.id}-${i}`} className="card flex gap-4 p-4">
                  <Link to={`/movie/${item.imdbId}`} className="w-16 shrink-0 sm:w-20">
                    <div className="aspect-[2/3] overflow-hidden rounded-control border border-line bg-elevated">
                      {item.movie?.poster && <img src={item.movie.poster} alt={item.movie?.title} className="h-full w-full object-cover" />}
                    </div>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={item.user.name} />
                      <p className="text-sm text-muted">
                        <span className="font-semibold text-ink">{item.user.name}</span> {describe(item.actions)}
                      </p>
                    </div>
                    <Link to={`/movie/${item.imdbId}`} className="mt-2 block truncate font-medium hover:text-amber">
                      {item.movie?.title || item.imdbId}
                    </Link>
                    {item.actions.includes('reviewed') && (
                      <div className="mt-1">
                        <Rating value={item.rating} /> <span className="text-xs text-muted">/ 5</span>
                        {item.spoiler ? (
                          <p className="mt-1 text-sm text-ember">Review contains spoilers</p>
                        ) : (
                          item.comment && <p className="mt-1 line-clamp-2 text-sm text-ink/80">{item.comment}</p>
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-muted">{new Date(item.at).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside>
          <h2 className="mb-4 text-lg font-semibold">Find people</h2>
          <div className="relative mb-4">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name..." aria-label="Search people" className="field pl-10" />
          </div>

          {searched && results.length === 0 && <p className="text-sm text-muted">No users found.</p>}
          <ul className="space-y-2">
            {results.map((person) => (
              <li key={person.id} className="card flex items-center justify-between gap-3 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={person.name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{person.name}</p>
                    <p className="text-xs text-muted">
                      {person._count.followers} followers · {person._count.reviews} reviews
                    </p>
                  </div>
                </div>
                <button onClick={() => toggleFollow(person)} className={cx('shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors', person.isFollowing ? 'border border-line text-muted hover:text-ink' : 'bg-amber text-obsidian hover:bg-amber-dark')}>
                  {person.isFollowing ? 'Following' : 'Follow'}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}

export default Community
