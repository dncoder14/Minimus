import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faStar, faUser } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import { socialAPI } from '../services/api'

const ACTION_TEXT = {
  review: 'reviewed',
  favorite: 'added to favorites',
  watched: 'watched',
}

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

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    try {
      const res = await socialAPI.searchUsers(query.trim())
      setResults(res.data.users || [])
      setSearched(true)
    } catch {
      toast.error('Search failed')
    }
  }

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
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
        <section className="md:col-span-2">
          <h1 className="text-3xl font-bold text-white mb-6">Activity from people you follow</h1>

          {feedLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : feed.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">
              {following === 0
                ? 'You are not following anyone yet. Find people with the search box.'
                : 'No recent activity from the people you follow.'}
            </div>
          ) : (
            <ul className="space-y-3">
              {feed.map((item, i) => (
                <li key={`${item.type}-${item.imdbId}-${item.user.id}-${i}`} className="bg-gray-800 rounded-xl p-4 flex gap-4">
                  <Link to={`/movie/${item.imdbId}`} className="shrink-0">
                    <img
                      src={item.movie?.poster || '/placeholder-movie.svg'}
                      alt={item.movie?.title || 'Poster'}
                      className="w-14 h-20 object-cover rounded-md"
                    />
                  </Link>
                  <div className="min-w-0">
                    <p className="text-gray-300">
                      <span className="font-semibold text-white">{item.user.name}</span> {ACTION_TEXT[item.type]}{' '}
                      <Link to={`/movie/${item.imdbId}`} className="text-cyan-400 hover:underline">
                        {item.movie?.title || item.imdbId}
                      </Link>
                    </p>
                    {item.type === 'review' && (
                      <>
                        <div className="flex items-center space-x-1 my-1">
                          {[...Array(5)].map((_, s) => (
                            <FontAwesomeIcon key={s} icon={faStar} className={s < item.rating ? 'text-yellow-400 text-sm' : 'text-gray-600 text-sm'} />
                          ))}
                        </div>
                        {item.spoiler ? (
                          <p className="text-yellow-400 text-sm">Review contains spoilers</p>
                        ) : (
                          item.comment && <p className="text-gray-400 text-sm line-clamp-2">{item.comment}</p>
                        )}
                      </>
                    )}
                    <p className="text-gray-500 text-xs mt-1">{new Date(item.at).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside>
          <h2 className="text-xl font-semibold text-white mb-4">Find people</h2>
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-500" />
          </form>

          {searched && results.length === 0 && <p className="text-gray-400 text-sm">No users found.</p>}
          <ul className="space-y-2">
            {results.map((person) => (
              <li key={person.id} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                  <div className="min-w-0">
                    <div className="text-white truncate">{person.name}</div>
                    <div className="text-gray-500 text-xs">
                      {person._count.followers} followers, {person._count.reviews} reviews
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(person)}
                  className={`text-sm px-3 py-1 rounded-full ${person.isFollowing ? 'bg-gray-700 text-gray-300' : 'bg-cyan-600 text-white'}`}
                >
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
