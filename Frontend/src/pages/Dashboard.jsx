import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faStar, 
  faPlay,
  faChevronLeft,
  faChevronRight,
  faChartLine
} from '@fortawesome/free-solid-svg-icons'

const Dashboard = () => {
  const [trendingMovies, setTrendingMovies] = useState([])
  const [genreMovies, setGenreMovies] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef(null)

  const genres = [
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 18, name: 'Drama' },
    { id: 27, name: 'Horror' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' }
  ]

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch trending movies
        const trendingRes = await fetch('https://api.themoviedb.org/3/trending/movie/week?api_key=3757ac660ffc9e9bc47412ea8c89e23c')
        const trendingData = await trendingRes.json()
        const filteredMovies = (trendingData.results || []).filter(movie => 
          !movie.title?.toLowerCase().includes('xxx')
        ).slice(0, 6)
        setTrendingMovies(filteredMovies)

        // Fetch movies by genre
        const genrePromises = genres.map(async (genre) => {
          const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=3757ac660ffc9e9bc47412ea8c89e23c&with_genres=${genre.id}&sort_by=popularity.desc`)
          const data = await res.json()
          return { [genre.name]: data.results?.slice(0, 6) || [] }
        })

        const genreResults = await Promise.all(genrePromises)
        const genreMoviesObj = Object.assign({}, ...genreResults)
        setGenreMovies(genreMoviesObj)
      } catch (error) {
        console.error('Error fetching movies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  useEffect(() => {
    if (trendingMovies.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingMovies.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [trendingMovies])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % trendingMovies.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + trendingMovies.length) % trendingMovies.length)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0A1B2F 0%, #05080E 100%)' }}>
      {/* Trending Carousel */}
      <section className="pt-24 pb-16">
        <div className="max-w-full">

          {loading ? (
            <div className="w-full px-4 md:px-8 lg:px-16">
              <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[21/9] bg-gradient-to-br from-gray-800 to-gray-900"></div>
              </div>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden">
              <div className="relative" ref={carouselRef}>
                <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                  {trendingMovies.map((movie) => (
                    <div key={movie.id} className="w-full flex-shrink-0 px-4 md:px-8 lg:px-16">
                      <Link to={`/movie/tmdb${movie.id}`} className="block group">
                        <div className="relative transition-all duration-500 hover:scale-[1.02]">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                          
                          <div className="relative glass-card rounded-2xl overflow-hidden">
                            <div className="aspect-[21/9] overflow-hidden relative">
                              <img
                                src={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : movie.poster_path ? `https://image.tmdb.org/t/p/original${movie.poster_path}` : '/placeholder-movie.svg'}
                                alt={movie.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                              
                              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                                <div className="max-w-3xl">
                                  <div className="flex items-center space-x-4 mb-4">
                                    <div className="glass-dark rounded-xl px-4 py-2 flex items-center space-x-2 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                                      <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                                      <span className="text-lg font-bold text-white">{movie.vote_average?.toFixed(1)}</span>
                                    </div>
                                    <span className="text-gray-300 text-lg font-medium">{movie.release_date?.split('-')[0]}</span>
                                  </div>
                                  <h3 className="font-display font-black text-3xl md:text-5xl mb-4 text-white group-hover:text-cyan-400 transition-colors">
                                    {movie.title}
                                  </h3>
                                  <p className="text-gray-300 text-base md:text-lg leading-relaxed line-clamp-3 mb-6">
                                    {movie.overview}
                                  </p>
                                  <div className="inline-flex items-center space-x-3 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] transition-all">
                                    <FontAwesomeIcon icon={faPlay} />
                                    <span>View Details</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full glass-dark border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full glass-dark border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
              </button>

              <div className="flex justify-center space-x-2 mt-8">
                {trendingMovies.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'w-8 bg-gradient-to-r from-cyan-500 to-purple-500' : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Genre-based Recommendations */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-16">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-8 w-48 bg-gray-700 rounded-lg mb-6 animate-pulse"></div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, j) => (
                      <div key={j} className="glass-card rounded-xl overflow-hidden animate-pulse">
                        <div className="aspect-[2/3] bg-gradient-to-br from-gray-800 to-gray-900"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {genres.map((genre) => (
                <div key={genre.id}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-3xl font-display font-bold text-white">
                      {genre.name}
                    </h3>
                    <Link 
                      to={`/movies?genre=${genre.id}`}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                    >
                      View All →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {genreMovies[genre.name]?.map((movie) => (
                      <Link 
                        key={movie.id} 
                        to={`/movie/tmdb${movie.id}`}
                        className="group"
                      >
                        <div className="relative rounded-xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
                          
                          <div className="relative glass-card rounded-xl overflow-hidden">
                            <div className="aspect-[2/3] overflow-hidden relative">
                              <img
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder-movie.svg'}
                                alt={movie.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60"></div>
                              
                              <div className="absolute top-3 right-3 glass-dark rounded-lg px-2.5 py-1.5 flex items-center space-x-1.5 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                                <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                                <span className="text-xs font-bold text-white">{movie.vote_average?.toFixed(1)}</span>
                              </div>

                              <div className="absolute inset-0 glass-glow opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                                <div className="relative px-5 py-2.5 rounded-lg font-semibold text-white overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-90"></div>
                                  <div className="relative flex items-center space-x-2">
                                    <FontAwesomeIcon icon={faPlay} className="text-sm" />
                                    <span className="text-sm">View</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-3 relative">
                              <h4 className="font-display font-bold text-sm mb-1 text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                                {movie.title}
                              </h4>
                              <p className="text-gray-400 text-xs font-medium">
                                {movie.release_date?.split('-')[0]}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
