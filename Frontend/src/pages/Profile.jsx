import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { watchlistAPI, favoritesAPI, watchedAPI, reviewsAPI } from '../services/api'
import { 
  faUser, 
  faHeart, 
  faBookmark, 
  faEye,
  faEdit,
  faStar,
  faCalendar,
  faFilm,
  faTv
} from '@fortawesome/free-solid-svg-icons'

const Profile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('watchlist')
  const [watchlistData, setWatchlistData] = useState([])
  const [favoritesData, setFavoritesData] = useState([])
  const [watchedData, setWatchedData] = useState([])
  const [reviewsData, setReviewsData] = useState([])
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState({ watchlist: 0, favorites: 0, reviews: 0 })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchMovieDetails = async (imdbId) => {
    try {
      if (imdbId.startsWith('tmdb')) {
        const tmdbId = imdbId.replace('tmdb', '')
        const response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=3757ac660ffc9e9bc47412ea8c89e23c`)
        const data = await response.json()
        return data.id ? {
          Title: data.title,
          Year: data.release_date?.split('-')[0],
          Poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'N/A',
          imdbRating: data.vote_average?.toFixed(1),
          Type: 'movie'
        } : null
      } else {
        const response = await fetch(`http://www.omdbapi.com/?i=${imdbId}&apikey=c1c5dd61`)
        const data = await response.json()
        return data.Response === 'True' ? data : null
      }
    } catch (error) {
      console.error('Error fetching movie details:', error)
      return null
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [watchlistRes, favoritesRes, watchedRes, reviewsRes] = await Promise.all([
        watchlistAPI.get(),
        favoritesAPI.get(),
        watchedAPI.get(),
        reviewsAPI.getUserReviews()
      ])
      
      const watchlistWithDetails = await Promise.all(
        (watchlistRes.data.watchlist || []).map(async (item) => {
          const movieDetails = await fetchMovieDetails(item.imdbId)
          return { ...item, movieDetails }
        })
      )
      
      const favoritesWithDetails = await Promise.all(
        (favoritesRes.data.favorites || []).map(async (item) => {
          const movieDetails = await fetchMovieDetails(item.imdbId)
          return { ...item, movieDetails }
        })
      )

      const watchedWithDetails = await Promise.all(
        (watchedRes.data.watched || []).map(async (item) => {
          const movieDetails = await fetchMovieDetails(item.imdbId)
          return { ...item, movieDetails }
        })
      )
      
      setWatchlistData(watchlistWithDetails)
      setFavoritesData(favoritesWithDetails)
      setWatchedData(watchedWithDetails)
      setReviewsData(reviewsRes.data.reviews || [])
      setCounts({
        watchlist: watchlistRes.data.totalItems || 0,
        favorites: favoritesRes.data.totalItems || 0,
        reviews: reviewsRes.data.totalReviews || 0
      })
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faUser} className="text-6xl text-gray-600 mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
          <p className="text-gray-400">You need to be logged in to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="bg-gradient-to-r from-red-500 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-3xl text-white" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-gray-400 mb-4">{user.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{counts.watchlist}</div>
                  <div className="text-gray-400">Watchlist</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">{counts.favorites}</div>
                  <div className="text-gray-400">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{counts.reviews}</div>
                  <div className="text-gray-400">Reviews</div>
                </div>
              </div>
            </div>
            
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <FontAwesomeIcon icon={faEdit} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-xl mb-8">
          <div className="flex flex-wrap border-b border-gray-700">
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'watchlist'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faBookmark} />
              <span>Watchlist</span>
            </button>
            
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faHeart} />
              <span>Favorites</span>
            </button>
            
            <button
              onClick={() => setActiveTab('watched')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'watched'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={faEye} />
              <span>Watched</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'watchlist' && (
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <FontAwesomeIcon icon={faBookmark} className="text-red-500" />
                  <span>My Watchlist</span>
                </h3>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                  </div>
                ) : watchlistData.length === 0 ? (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faBookmark} className="text-4xl text-gray-600 mb-4" />
                    <p className="text-gray-400">Your watchlist is empty</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {watchlistData.map((item) => (
                      <Link key={item.id} to={`/movie/${item.imdbId}`} className="block bg-gray-700 rounded-xl overflow-hidden hover:bg-gray-600 transition-colors">
                        {item.movieDetails ? (
                          <>
                            <div className="aspect-[2/3] overflow-hidden">
                              <img
                                src={item.movieDetails.Poster !== 'N/A' ? item.movieDetails.Poster : '/placeholder-movie.svg'}
                                alt={item.movieDetails.Title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h4 className="text-white font-medium mb-2 line-clamp-2">{item.movieDetails.Title}</h4>
                              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                <span>{item.movieDetails.Year}</span>
                                {item.movieDetails.imdbRating !== 'N/A' && (
                                  <div className="flex items-center space-x-1">
                                    <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                    <span>{item.movieDetails.imdbRating}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs">Added: {new Date(item.addedAt).toLocaleDateString()}</p>
                            </div>
                          </>
                        ) : (
                          <div className="p-4">
                            <p className="text-white font-medium">{item.imdbId}</p>
                            <p className="text-gray-400 text-sm">Added: {new Date(item.addedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <FontAwesomeIcon icon={faHeart} className="text-red-500" />
                  <span>My Favorites</span>
                </h3>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                  </div>
                ) : favoritesData.length === 0 ? (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faHeart} className="text-4xl text-gray-600 mb-4" />
                    <p className="text-gray-400">No favorites yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favoritesData.map((item) => (
                      <Link key={item.id} to={`/movie/${item.imdbId}`} className="block bg-gray-700 rounded-xl overflow-hidden hover:bg-gray-600 transition-colors">
                        {item.movieDetails ? (
                          <>
                            <div className="aspect-[2/3] overflow-hidden">
                              <img
                                src={item.movieDetails.Poster !== 'N/A' ? item.movieDetails.Poster : '/placeholder-movie.svg'}
                                alt={item.movieDetails.Title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h4 className="text-white font-medium mb-2 line-clamp-2">{item.movieDetails.Title}</h4>
                              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                <span>{item.movieDetails.Year}</span>
                                {item.movieDetails.imdbRating !== 'N/A' && (
                                  <div className="flex items-center space-x-1">
                                    <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                    <span>{item.movieDetails.imdbRating}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs">Added: {new Date(item.addedAt).toLocaleDateString()}</p>
                            </div>
                          </>
                        ) : (
                          <div className="p-4">
                            <p className="text-white font-medium">{item.imdbId}</p>
                            <p className="text-gray-400 text-sm">Added: {new Date(item.addedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'watched' && (
              <div>
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <FontAwesomeIcon icon={faEye} className="text-red-500" />
                  <span>Watched Movies</span>
                </h3>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                  </div>
                ) : watchedData.length === 0 ? (
                  <div className="text-center py-12">
                    <FontAwesomeIcon icon={faEye} className="text-4xl text-gray-600 mb-4" />
                    <p className="text-gray-400">No watched movies yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {watchedData.map((item) => (
                      <Link key={item.id} to={`/movie/${item.imdbId}`} className="block bg-gray-700 rounded-xl overflow-hidden hover:bg-gray-600 transition-colors">
                        {item.movieDetails ? (
                          <>
                            <div className="aspect-[2/3] overflow-hidden">
                              <img
                                src={item.movieDetails.Poster !== 'N/A' ? item.movieDetails.Poster : '/placeholder-movie.svg'}
                                alt={item.movieDetails.Title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h4 className="text-white font-medium mb-2 line-clamp-2">{item.movieDetails.Title}</h4>
                              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                <span>{item.movieDetails.Year}</span>
                                {item.movieDetails.imdbRating !== 'N/A' && (
                                  <div className="flex items-center space-x-1">
                                    <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                    <span>{item.movieDetails.imdbRating}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-500 text-xs">Watched: {new Date(item.watchedAt).toLocaleDateString()}</p>
                            </div>
                          </>
                        ) : (
                          <div className="p-4">
                            <p className="text-white font-medium">{item.imdbId}</p>
                            <p className="text-gray-400 text-sm">Watched: {new Date(item.watchedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile