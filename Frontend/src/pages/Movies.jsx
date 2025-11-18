import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faFilter, 
  faSort, 
  faThLarge, 
  faList,
  faStar,
  faCalendar,
  faClock,
  faFilm,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons'
import MovieCard from '../components/MovieCard'
import { watchlistAPI, favoritesAPI } from '../services/api'

const Movies = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalResults, setTotalResults] = useState(0)
  const [filters, setFilters] = useState({
    genre: '',
    year: ''
  })
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [genres, setGenres] = useState([])
  
  const TMDB_API_KEY = '3757ac660ffc9e9bc47412ea8c89e23c'
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
  const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

  useEffect(() => {
    fetchGenres()
    fetchMovies()
  }, [])

  useEffect(() => {
    fetchMovies()
  }, [currentPage, filters, sortBy])

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`)
      const data = await response.json()
      setGenres(data.genres || [])
    } catch (error) {
      console.error('Error fetching genres:', error)
    }
  }

  const fetchMovies = async () => {
    try {
      setLoading(true)
      let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&page=${currentPage}&sort_by=${sortBy}`
      
      if (filters.genre) url += `&with_genres=${filters.genre}`
      if (filters.year) url += `&primary_release_year=${filters.year}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      setMovies(data.results || [])
      setTotalPages(data.total_pages || 0)
      setTotalResults(data.total_results || 0)
    } catch (error) {
      console.error('Error fetching movies:', error)
      setMovies([])
      setTotalPages(0)
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  const years = Array.from({ length: 30 }, (_, i) => 2024 - i)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background with gradient mesh */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0f0f1a]"></div>
        <div className="absolute inset-0 gradient-mesh animate-gradient-shift"></div>
        <div className="absolute inset-0 noise-overlay"></div>
      </div>

      {/* Floating orbs for depth */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in-up">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            <FontAwesomeIcon icon={faFilm} className="text-5xl text-cyan-400 animate-glow-pulse" />
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-4 text-cinematic animate-gradient-shift">
            Discover Movies
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide">
            Explore the world's most captivating cinematic experiences
          </p>
          
          {/* Decorative line */}
          <div className="mt-6 flex justify-center">
            <div className="w-32 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"></div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="glass-glow rounded-2xl p-6 md:p-8 mb-10 animate-slide-in-left border-neon-blue">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative group">
                <select
                  value={filters.genre}
                  onChange={(e) => {
                    setFilters({ ...filters, genre: e.target.value })
                    setCurrentPage(1)
                  }}
                  className="bg-cinematic-card border border-cinematic-border rounded-xl px-6 py-3 text-white font-medium focus:outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all duration-300 appearance-none pr-10 cursor-pointer hover:border-electric-blue/50"
                >
                  <option value="" className="bg-cinematic-card text-white">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre.id} value={genre.id} className="bg-cinematic-card text-white">{genre.name}</option>
                  ))}
                </select>
                <FontAwesomeIcon icon={faFilter} className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
              </div>

              <div className="relative group">
                <select
                  value={filters.year}
                  onChange={(e) => {
                    setFilters({ ...filters, year: e.target.value })
                    setCurrentPage(1)
                  }}
                  className="bg-cinematic-card border border-cinematic-border rounded-xl px-6 py-3 text-white font-medium focus:outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all duration-300 appearance-none pr-10 cursor-pointer hover:border-electric-blue/50"
                >
                  <option value="" className="bg-cinematic-card text-white">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year} className="bg-cinematic-card text-white">{year}</option>
                  ))}
                </select>
                <FontAwesomeIcon icon={faCalendar} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-cinematic-card border border-cinematic-border rounded-xl px-6 py-3 text-white font-medium focus:outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 transition-all duration-300 appearance-none pr-10 cursor-pointer hover:border-electric-blue/50"
                >
                  <option value="popularity.desc" className="bg-cinematic-card text-white">Most Popular</option>
                  <option value="release_date.desc" className="bg-cinematic-card text-white">Newest First</option>
                  <option value="vote_average.desc" className="bg-cinematic-card text-white">Highest Rated</option>
                  <option value="title.asc" className="bg-cinematic-card text-white">A-Z</option>
                </select>
                <FontAwesomeIcon icon={faSort} className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none" />
              </div>

              <div className="flex glass-dark rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FontAwesomeIcon icon={faThLarge} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.genre || filters.year) && (
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
              {Object.entries(filters).map(([key, value]) => 
                value && (
                  <span
                    key={key}
                    className="glass-light border border-cyan-400/30 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-3 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all duration-300"
                  >
                    <span className="capitalize">{key}: <span className="text-cyan-400">{key === 'genre' ? genres.find(g => g.id === parseInt(value))?.name : value}</span></span>
                    <button
                      onClick={() => setFilters({ ...filters, [key]: '' })}
                      className="hover:text-cyan-400 transition-colors text-lg font-bold"
                    >
                      ×
                    </button>
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-8 flex items-center justify-between">
          <div className="glass-dark px-6 py-3 rounded-xl border border-white/10 inline-block">
            <p className="text-gray-300 font-medium">
              <span className="text-cyan-400 font-bold">{movies.length}</span> of{' '}
              <span className="text-purple-400 font-bold">{totalResults.toLocaleString()}</span> movies
              <span className="text-gray-500 mx-2">•</span>
              Page <span className="text-pink-400 font-bold">{currentPage}</span> of{' '}
              <span className="text-pink-400 font-bold">{totalPages}</span>
            </p>
          </div>
        </div>

        {/* Movies Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {[...Array(10)].map((_, index) => (
              <div key={index} className={`glass-card rounded-2xl overflow-hidden animate-pulse stagger-${(index % 8) + 1}`}>
                <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900 shimmer animate-shimmer"></div>
                <div className="p-5">
                  <div className="h-5 bg-gray-700 rounded-lg mb-3 shimmer animate-shimmer"></div>
                  <div className="h-4 bg-gray-700 rounded-lg w-2/3 shimmer animate-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8'
            : 'space-y-6'
          }>
            {movies.map((movie, index) => (
              viewMode === 'grid' ? (
                <div key={movie.id} className={`animate-fade-in-up stagger-${(index % 8) + 1}`}>
                  <MovieCard
                    movie={{
                      imdbId: `tmdb${movie.id}`,
                      title: movie.title,
                      year: movie.release_date?.split('-')[0],
                      poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : '/placeholder-movie.svg',
                      imdbRating: movie.vote_average?.toFixed(1),
                      runtime: 'N/A',
                      genre: movie.genre_ids?.join(', ') || 'N/A',
                      plot: movie.overview,
                      type: 'movie'
                    }}
                    onAddToWatchlist={async () => {
                      try {
                        await watchlistAPI.add(`tmdb${movie.id}`)
                        toast.success('Added to watchlist!')
                      } catch (error) {
                        toast.error(error.response?.data?.error || 'Failed to add to watchlist')
                      }
                    }}
                    onAddToFavorites={async () => {
                      try {
                        await favoritesAPI.add(`tmdb${movie.id}`)
                        toast.success('Added to favorites!')
                      } catch (error) {
                        toast.error(error.response?.data?.error || 'Failed to add to favorites')
                      }
                    }}
                    isInWatchlist={false}
                    isInFavorites={false}
                  />
                </div>
              ) : (
                <div key={movie.id} className="glass-card rounded-2xl p-6 flex gap-6 hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] transition-all duration-500 animate-fade-in-up border border-white/5 hover:border-cyan-400/30">
                  <img
                    src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : '/placeholder-movie.svg'}
                    alt={movie.title}
                    className="w-24 h-36 object-cover rounded-xl shadow-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-3 text-white hover:text-transparent hover:bg-gradient-to-r hover:from-cyan-400 hover:to-purple-400 hover:bg-clip-text transition-all duration-300">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                      <span className="flex items-center gap-2 glass-dark px-3 py-1.5 rounded-lg">
                        <FontAwesomeIcon icon={faCalendar} className="text-cyan-400" />
                        <span className="font-medium">{movie.release_date?.split('-')[0]}</span>
                      </span>
                      <span className="flex items-center gap-2 glass-dark px-3 py-1.5 rounded-lg">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                        <span className="font-medium">{movie.vote_average?.toFixed(1)}</span>
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{movie.overview}</p>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-16">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="glass-glow hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] disabled:opacity-30 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold border border-cyan-400/30 hover:border-cyan-400 disabled:hover:border-cyan-400/30 disabled:hover:shadow-none flex items-center space-x-2 group"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Previous</span>
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, currentPage - 2) + i
                if (page > totalPages) return null
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(0,212,255,0.5)] scale-110'
                        : 'glass-dark text-gray-300 hover:text-white border border-white/10 hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="glass-glow hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] disabled:opacity-30 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold border border-cyan-400/30 hover:border-cyan-400 disabled:hover:border-cyan-400/30 disabled:hover:shadow-none flex items-center space-x-2 group"
            >
              <span>Next</span>
              <FontAwesomeIcon icon={faChevronRight} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div className="text-center py-20">
            <div className="glass-glow rounded-3xl p-12 max-w-2xl mx-auto border-neon-purple">
              <div className="mb-6">
                <FontAwesomeIcon icon={faFilm} className="text-7xl text-purple-400 opacity-50" />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white">No Movies Found</h3>
              <p className="text-xl text-gray-400 mb-8">We couldn't find any movies matching your criteria</p>
              <button
                onClick={() => {
                  setFilters({ genre: '', year: '' })
                  setCurrentPage(1)
                }}
                className="relative px-8 py-4 rounded-xl font-bold text-white overflow-hidden group/btn transform transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 blur-lg bg-gradient-to-r from-purple-500 to-pink-600 opacity-50 group-hover/btn:opacity-75 transition-opacity duration-300"></div>
                <span className="relative">Clear All Filters</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Movies