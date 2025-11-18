import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faStar, 
  faHeart, 
  faBookmark, 
  faPlay,
  faCalendar,
  faClock
} from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartOutline, faBookmark as faBookmarkOutline } from '@fortawesome/free-regular-svg-icons'

const MovieCard = ({ movie, onAddToWatchlist, onAddToFavorites, isInWatchlist, isInFavorites }) => {
  const getRatingColor = (rating) => {
    const numRating = parseFloat(rating)
    if (numRating >= 7.5) return 'text-electric-blue'
    return 'text-cinematic-muted'
  }

  const getTypeIcon = (type) => {
    return type === 'series' ? 'TV' : 'MOVIE'
  }

  const getTypeColor = (type) => {
    return type === 'series' 
      ? 'bg-cinematic-muted' 
      : 'bg-electric-blue'
  }

  return (
    <div className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]">
      {/* Main card */}
      <div className="relative glass-card rounded-xl overflow-hidden shadow-2xl border border-cinematic-border film-grain">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.poster && movie.poster !== 'N/A' ? movie.poster : '/placeholder-movie.svg'}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.src = '/placeholder-movie.svg'
            }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70"></div>
          
          {/* Glass overlay on hover */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <Link
              to={`/movie/${movie.imdbId}`}
              className="px-6 py-3 bg-electric-blue hover:bg-[#0080dd] rounded-lg font-medium text-white transition-colors flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faPlay} />
              <span>View Details</span>
            </Link>
          </div>

          {/* Type Badge */}
          <div className={`absolute top-3 left-3 ${getTypeColor(movie.type)} text-white px-2.5 py-1 rounded text-xs font-medium`}>
            {getTypeIcon(movie.type)}
          </div>

          {/* Rating Badge */}
          {movie.imdbRating && movie.imdbRating !== 'N/A' && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded px-2.5 py-1 flex items-center space-x-1.5">
              <FontAwesomeIcon icon={faStar} className={`text-xs ${getRatingColor(movie.imdbRating)}`} />
              <span className="text-xs font-semibold text-white">{movie.imdbRating}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => onAddToFavorites(movie)}
              className="bg-black/70 backdrop-blur-sm hover:bg-electric-blue text-white p-2 rounded transition-colors"
            >
              <FontAwesomeIcon 
                icon={isInFavorites ? faHeart : faHeartOutline} 
                className="text-sm"
              />
            </button>
            <button
              onClick={() => onAddToWatchlist(movie)}
              className="bg-black/70 backdrop-blur-sm hover:bg-electric-blue text-white p-2 rounded transition-colors"
            >
              <FontAwesomeIcon 
                icon={isInWatchlist ? faBookmark : faBookmarkOutline}
                className="text-sm"
              />
            </button>
          </div>
        </div>

        {/* Movie Info */}
        <div className="p-4 relative">
          <div className="relative">
            <h3 className="font-serif text-lg mb-2 line-clamp-2 text-white group-hover:text-electric-blue transition-colors">
              {movie.title}
            </h3>
            
            <div className="flex items-center space-x-3 text-sm text-cinematic-muted mb-2">
              <div className="flex items-center space-x-1.5">
                <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                <span>{movie.year}</span>
              </div>
              {movie.runtime && movie.runtime !== 'N/A' && (
                <div className="flex items-center space-x-1.5">
                  <FontAwesomeIcon icon={faClock} className="text-xs" />
                  <span>{movie.runtime}</span>
                </div>
              )}
            </div>

            {/* Genre */}
            {movie.genre && movie.genre !== 'N/A' && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {movie.genre.split(',').slice(0, 2).map((genre, index) => (
                  <span
                    key={index}
                    className="text-cinematic-muted text-xs"
                  >
                    {genre.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Plot Preview */}
            {movie.plot && movie.plot !== 'N/A' && (
              <p className="text-cinematic-muted text-sm line-clamp-2">
                {movie.plot}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard