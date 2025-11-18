import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { watchlistAPI, favoritesAPI, watchedAPI, reviewsAPI, moviesAPI } from '../services/api'
import { 
  faStar, 
  faHeart, 
  faBookmark, 
  faPlay,
  faCalendar,
  faClock,
  faGlobe,
  faAward,
  faUsers,
  faFilm,
  faSpinner,
  faArrowLeft,
  faUser
} from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartOutline, faBookmark as faBookmarkOutline } from '@fortawesome/free-regular-svg-icons'

const MovieDetail = () => {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isInFavorites, setIsInFavorites] = useState(false)
  const [isWatched, setIsWatched] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true)
        
        let movieData
        if (id.startsWith('tmdb')) {
          // TMDB ID - check if it's a movie or series
          const tmdbId = id.replace('tmdb', '')
          
          // Try movie first
          let response = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=3757ac660ffc9e9bc47412ea8c89e23c&append_to_response=credits`)
          let data = await response.json()
          
          // If movie not found, try TV series
          if (data.success === false || !data.id) {
            response = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=3757ac660ffc9e9bc47412ea8c89e23c&append_to_response=credits`)
            data = await response.json()
            
            if (data.id) {
              // It's a TV series
              movieData = {
                Title: data.name,
                Year: data.first_air_date?.split('-')[0],
                Rated: 'Not Rated',
                Released: data.first_air_date,
                Runtime: data.episode_run_time?.[0] ? `${data.episode_run_time[0]} min` : 'N/A',
                Genre: data.genres?.map(g => g.name).join(', '),
                Director: data.created_by?.map(c => c.name).join(', ') || 'N/A',
                Writer: data.created_by?.map(c => c.name).join(', ') || 'N/A',
                Actors: data.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'N/A',
                Plot: data.overview,
                Language: data.original_language,
                Country: data.origin_country?.join(', ') || 'N/A',
                Awards: 'N/A',
                Poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'N/A',
                Ratings: [{ Source: 'TMDB', Value: `${data.vote_average}/10` }],
                imdbRating: data.vote_average?.toFixed(1),
                imdbVotes: data.vote_count?.toLocaleString(),
                Type: 'series',
                BoxOffice: 'N/A',
                Production: data.production_companies?.map(c => c.name).join(', ') || 'N/A'
              }
              setMovie(movieData)
              return
            } else {
              setError('Content not found')
              return
            }
          }
          
          // It's a movie
          if (data.id) {
            movieData = {
              Title: data.title,
              Year: data.release_date?.split('-')[0],
              Rated: 'Not Rated',
              Released: data.release_date,
              Runtime: `${data.runtime} min`,
              Genre: data.genres?.map(g => g.name).join(', '),
              Director: data.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A',
              Writer: data.credits?.crew?.filter(c => c.job === 'Writer').map(c => c.name).join(', ') || 'N/A',
              Actors: data.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'N/A',
              Plot: data.overview,
              Language: data.original_language,
              Country: data.production_countries?.map(c => c.name).join(', ') || 'N/A',
              Awards: 'N/A',
              Poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'N/A',
              Ratings: [{ Source: 'TMDB', Value: `${data.vote_average}/10` }],
              imdbRating: data.vote_average?.toFixed(1),
              imdbVotes: data.vote_count?.toLocaleString(),
              Type: 'movie',
              BoxOffice: 'N/A',
              Production: data.production_companies?.map(c => c.name).join(', ') || 'N/A'
            }
          } else {
            setError('Movie not found')
            return
          }
        } else {
          // OMDB ID (use backend API)
          const response = await moviesAPI.getById(id)
          movieData = response.data.movie
        }
        
        setMovie(movieData)
      } catch (error) {
        setError('Failed to fetch movie details')
      } finally {
        setLoading(false)
      }
    }

    const checkStatus = async () => {
      try {
        const [watchlistRes, favoritesRes, watchedRes] = await Promise.all([
          watchlistAPI.check(id),
          favoritesAPI.check(id),
          watchedAPI.check(id)
        ])
        setIsInWatchlist(watchlistRes.data.inWatchlist)
        setIsInFavorites(favoritesRes.data.inFavorites)
        setIsWatched(watchedRes.data.isWatched)
      } catch (error) {
        console.error('Error checking status:', error)
      }
    }

    const fetchReviews = async () => {
      try {
        const res = await reviewsAPI.getByMovie(id)
        setReviews(res.data.reviews || [])
        setAverageRating(res.data.averageRating || 0)
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    }

    if (id) {
      fetchMovieDetails()
      checkStatus()
      fetchReviews()
    }
  }, [id])

  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating)
    if (numRating >= 8) return 'text-green-400'
    if (numRating >= 7) return 'text-yellow-400'
    if (numRating >= 6) return 'text-orange-400'
    return 'text-red-400'
  }

  const handleAddToWatchlist = async () => {
    try {
      if (isInWatchlist) {
        await watchlistAPI.remove(id)
      } else {
        await watchlistAPI.add(id)
      }
      setIsInWatchlist(!isInWatchlist)
    } catch (error) {
      console.error('Error updating watchlist:', error)
    }
  }

  const handleAddToFavorites = async () => {
    try {
      if (isInFavorites) {
        await favoritesAPI.remove(id)
      } else {
        await favoritesAPI.add(id)
      }
      setIsInFavorites(!isInFavorites)
    } catch (error) {
      console.error('Error updating favorites:', error)
    }
  }

  const handleMarkAsWatched = async () => {
    try {
      if (isWatched) {
        await watchedAPI.remove(id)
      } else {
        await watchedAPI.add(id)
      }
      setIsWatched(!isWatched)
    } catch (error) {
      console.error('Error updating watched:', error)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    try {
      await reviewsAPI.create({ imdbId: id, rating, comment })
      toast.success('Review submitted!')
      setShowReviewForm(false)
      setRating(0)
      setComment('')
      const res = await reviewsAPI.getByMovie(id)
      setReviews(res.data.reviews || [])
      setAverageRating(res.data.averageRating || 0)
    } catch (error) {
      toast.error('Failed to submit review')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-red-500 animate-spin mb-4" />
          <p className="text-xl text-gray-400">Loading movie details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-semibold mb-4">Movie Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/movies"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <Link
          to="/movies"
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>Back to Movies</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-movie.jpg'}
                  alt={movie.Title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Movie Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Basic Info */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    movie.Type === 'series' ? 'bg-purple-600' : 'bg-blue-600'
                  }`}>
                    {movie.Type === 'series' ? 'TV Series' : 'Movie'}
                  </span>
                  {movie.Rated && movie.Rated !== 'N/A' && (
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                      {movie.Rated}
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.Title}</h1>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faCalendar} />
                    <span>{movie.Year}</span>
                  </div>
                  {movie.Runtime && movie.Runtime !== 'N/A' && (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClock} />
                      <span>{movie.Runtime}</span>
                    </div>
                  )}
                  {movie.Language && movie.Language !== 'N/A' && (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faGlobe} />
                      <span>{movie.Language}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ratings */}
              <div className="flex flex-wrap gap-4">
                {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <FontAwesomeIcon icon={faStar} className={getRatingColor(movie.imdbRating)} />
                      <span className="text-2xl font-bold">{movie.imdbRating}</span>
                    </div>
                    <p className="text-sm text-gray-400">IMDB</p>
                    {movie.imdbVotes && (
                      <p className="text-xs text-gray-500">{movie.imdbVotes} votes</p>
                    )}
                  </div>
                )}
                
                {movie.Ratings && movie.Ratings.length > 0 && (
                  <>
                    {movie.Ratings.find(r => r.Source === 'Rotten Tomatoes') && (
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold mb-1">
                          {movie.Ratings.find(r => r.Source === 'Rotten Tomatoes').Value}
                        </div>
                        <p className="text-sm text-gray-400">Rotten Tomatoes</p>
                      </div>
                    )}
                    
                    {movie.Ratings.find(r => r.Source === 'Metacritic') && (
                      <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold mb-1">
                          {movie.Ratings.find(r => r.Source === 'Metacritic').Value}
                        </div>
                        <p className="text-sm text-gray-400">Metacritic</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleAddToWatchlist}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isInWatchlist
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-blue-600 text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={isInWatchlist ? faBookmark : faBookmarkOutline} />
                  <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
                
                <button
                  onClick={handleAddToFavorites}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isInFavorites
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-700 hover:bg-red-600 text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={isInFavorites ? faHeart : faHeartOutline} />
                  <span>{isInFavorites ? 'Favorited' : 'Add to Favorites'}</span>
                </button>

                <button
                  onClick={handleMarkAsWatched}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isWatched
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-700 hover:bg-green-600 text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={faPlay} />
                  <span>{isWatched ? 'Watched' : 'Mark as Watched'}</span>
                </button>

                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold bg-gray-700 hover:bg-purple-600 text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faStar} />
                  <span>Write Review</span>
                </button>
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Write Your Review</h3>
                  <div className="mb-4">
                    <label className="block mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                        >
                          <FontAwesomeIcon icon={faStar} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Comment (optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      rows="4"
                      placeholder="Share your thoughts..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={rating === 0}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Plot */}
              {movie.Plot && movie.Plot !== 'N/A' && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Plot</h3>
                  <p className="text-gray-300 leading-relaxed">{movie.Plot}</p>
                </div>
              )}

              {/* Genres */}
              {movie.Genre && movie.Genre !== 'N/A' && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.Genre.split(',').map((genre, index) => (
                      <span
                        key={index}
                        className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cast & Crew */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <FontAwesomeIcon icon={faUsers} />
              <span>Cast & Crew</span>
            </h3>
            
            <div className="space-y-4">
              {movie.Director && movie.Director !== 'N/A' && (
                <div>
                  <h4 className="font-medium text-gray-300">Director</h4>
                  <p className="text-gray-400">{movie.Director}</p>
                </div>
              )}
              
              {movie.Writer && movie.Writer !== 'N/A' && (
                <div>
                  <h4 className="font-medium text-gray-300">Writer</h4>
                  <p className="text-gray-400">{movie.Writer}</p>
                </div>
              )}
              
              {movie.Actors && movie.Actors !== 'N/A' && (
                <div>
                  <h4 className="font-medium text-gray-300">Starring</h4>
                  <p className="text-gray-400">{movie.Actors}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <FontAwesomeIcon icon={faFilm} />
              <span>Details</span>
            </h3>
            
            <div className="space-y-4">
              {movie.Country && movie.Country !== 'N/A' && (
                <div>
                  <h4 className="font-medium text-gray-300">Country</h4>
                  <p className="text-gray-400">{movie.Country}</p>
                </div>
              )}
              
              {movie.Released && movie.Released !== 'N/A' && (
                <div>
                  <h4 className="font-medium text-gray-300">Release Date</h4>
                  <p className="text-gray-400">{movie.Released}</p>
                </div>
              )}
              
              {movie.BoxOffice && movie.BoxOffice !== 'N/A' && (
                <div>
                  <h4 className="font-medium text-gray-300">Box Office</h4>
                  <p className="text-gray-400">{movie.BoxOffice}</p>
                </div>
              )}
              
              {movie.Production && movie.Production !== 'N/A' && (
                <div>
                  <h4 className="font-medium text-gray-300">Production</h4>
                  <p className="text-gray-400">{movie.Production}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Awards */}
        {movie.Awards && movie.Awards !== 'N/A' && movie.Awards !== 'N/A' && (
          <div className="bg-gray-800 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <FontAwesomeIcon icon={faAward} className="text-yellow-500" />
              <span>Awards & Recognition</span>
            </h3>
            <p className="text-gray-300">{movie.Awards}</p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-gray-800 rounded-xl p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
            <span>User Reviews</span>
            {averageRating > 0 && (
              <span className="text-gray-400 text-base">({averageRating.toFixed(1)}/5)</span>
            )}
          </h3>
          
          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                      <span className="font-semibold">{review.user.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-300">{review.comment}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieDetail