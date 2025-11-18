import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faFilm, 
  faTv, 
  faStar, 
  faPlay,
  faArrowRight,
  faAward,
  faHeart,
  faUsers,
  faRocket,
  faMagic,
  faInfinity
} from '@fortawesome/free-solid-svg-icons'

const Home = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ movies: 0, series: 0, users: 0 })
  const [heroPosters, setHeroPosters] = useState([])
  const carouselRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [page1, page2, statsRes] = await Promise.all([
          fetch('https://api.themoviedb.org/3/movie/popular?api_key=3757ac660ffc9e9bc47412ea8c89e23c&page=1'),
          fetch('https://api.themoviedb.org/3/trending/all/week?api_key=3757ac660ffc9e9bc47412ea8c89e23c'),
          import('../services/api').then(({ authAPI }) => authAPI.getStats())
        ])
        const [data1, data2] = await Promise.all([page1.json(), page2.json()])
        setHeroPosters([...(data1.results?.slice(0, 10) || []), ...(data2.results?.slice(0, 10) || [])])
        
        // Animate stats counter
        const targets = { movies: 500000, series: 100000, users: statsRes.data.userCount }
        const duration = 2000
        const steps = 60
        const stepTime = duration / steps
        
        let step = 0
        const timer = setInterval(() => {
          step++
          const progress = step / steps
          setStats({
            movies: Math.floor(targets.movies * progress),
            series: Math.floor(targets.series * progress),
            users: Math.floor(targets.users * progress)
          })
          
          if (step >= steps) clearInterval(timer)
        }, stepTime)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])



  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0A1B2F 0%, #05080E 100%)' }}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Poster Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-navy/50 via-black/70 to-black z-10"></div>
          <div className="absolute inset-0 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 p-2 overflow-hidden" style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)' }}>
            {heroPosters.length > 0 ? [...heroPosters, ...heroPosters].map((movie, i) => (
              <div
                key={i}
                className="animate-float-slow"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${15 + (i % 4) * 3}s`
                }}
              >
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt=""
                    className="w-full h-auto rounded-md shadow-2xl"
                    loading="lazy"
                  />
                )}
              </div>
            )) : (
              [...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-gradient-to-br from-blue-900/20 to-blue-950/20 rounded-md animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))
            )}
          </div>
        </div>

        {/* Fixed Center Content */}
        <div className="relative z-20 text-center max-w-6xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-black mb-6 text-white drop-shadow-2xl tracking-tight">
            Minimus
          </h1>
          <div className="h-1 w-32 mx-auto rounded-full mb-8 animate-glow-pulse" style={{ background: 'linear-gradient(90deg, #0EA5E9 0%, #A855F7 50%, #0EA5E9 100%)' }}></div>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            <FontAwesomeIcon icon={faStar} className="text-xl" style={{ color: '#A855F7' }} />
            <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </div>

          <p className="text-2xl md:text-4xl text-white mb-4 font-display font-bold">
            Your Ultimate Entertainment Universe
          </p>
          <p className="text-lg md:text-xl text-silver mb-12 max-w-3xl mx-auto">
            Discover millions of movies and TV series with AI-powered recommendations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/movies"
              className="group relative px-10 py-5 rounded-lg text-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]"
              style={{ background: 'linear-gradient(90deg, #0EA5E9 0%, #A855F7 100%)' }}
            >
              <div className="flex items-center justify-center space-x-3 text-white">
                <FontAwesomeIcon icon={faPlay} />
                <span>Explore Movies</span>
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/series"
              className="group relative px-10 py-5 frosted-glass rounded-lg text-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              style={{ border: '2px solid rgba(168, 85, 247, 0.5)' }}
            >
              <div className="flex items-center justify-center space-x-3 text-white">
                <FontAwesomeIcon icon={faTv} />
                <span>Browse Series</span>
                <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="frosted-glass rounded-xl p-6 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
              <div className="text-3xl sm:text-4xl font-black mb-2" style={{ color: '#A855F7' }}>
                {stats.movies.toLocaleString()}+
              </div>
              <div className="text-gray-400 font-semibold text-sm">Movies</div>
            </div>
            <div className="frosted-glass rounded-xl p-6 hover:shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all">
              <div className="text-3xl sm:text-4xl font-black mb-2" style={{ color: '#0EA5E9' }}>
                {stats.series.toLocaleString()}+
              </div>
              <div className="text-gray-400 font-semibold text-sm">TV Series</div>
            </div>
            <div className="frosted-glass rounded-xl p-6 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
              <div className="text-3xl sm:text-4xl font-black mb-2" style={{ color: '#A855F7' }}>
                {stats.users.toLocaleString()}+
              </div>
              <div className="text-gray-400 font-semibold text-sm">Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
              <FontAwesomeIcon icon={faRocket} className="text-4xl text-cyan-400 animate-glow-pulse" />
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            </div>
            
            <div className="relative inline-block mb-6">
              <h2 className="text-5xl md:text-6xl font-display font-black text-white relative z-10">
                Why Choose Minimus?
              </h2>
              <div className="absolute -inset-4 blur-2xl -z-10" style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.2) 0%, rgba(168,85,247,0.2) 100%)' }}></div>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              Experience entertainment discovery like never before with our cutting-edge features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: faRocket, title: 'Lightning Fast Search', desc: 'Discover millions of movies and series instantly with our AI-powered search engine and advanced filtering.', color: 'cyan' },
              { icon: faHeart, title: 'Personal Collections', desc: 'Create unlimited watchlists, mark favorites, and build your personal entertainment library with ease.', color: 'purple' },
              { icon: faMagic, title: 'Smart Recommendations', desc: 'Get personalized suggestions based on your viewing history and preferences powered by machine learning.', color: 'pink' },
              { icon: faInfinity, title: 'Unlimited Access', desc: 'Browse our vast database of movies and series completely free. No limits, no restrictions.', color: 'cyan' },
              { icon: faAward, title: 'Rich Details', desc: 'Access comprehensive information including cast, crew, ratings, reviews, and detailed plot summaries.', color: 'purple' },
              { icon: faUsers, title: 'Community Driven', desc: 'Join a community of entertainment enthusiasts and discover what others are watching and loving.', color: 'pink' }
            ].map((feature, index) => (
              <div key={index} className={`group glass-glow rounded-2xl p-8 border border-${feature.color}-400/20 hover:border-${feature.color}-400/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] animate-fade-in-up stagger-${(index % 6) + 1}`}>
                <div className={`relative mb-6 inline-block`}>
                  <div className={`absolute inset-0 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                  <div className={`relative glass-dark w-16 h-16 rounded-2xl flex items-center justify-center border border-${feature.color}-400/30`}>
                    <FontAwesomeIcon icon={feature.icon} className={`text-3xl text-${feature.color}-400`} />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 text-white group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-base leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="p-16">
            <FontAwesomeIcon icon={faRocket} className="text-6xl text-cyan-400 mb-8 animate-glow-pulse" />
            
            <div className="relative inline-block mb-8">
              <h2 className="text-5xl md:text-7xl font-display font-black text-white relative z-10">
                Ready to Dive In?
              </h2>
              <div className="absolute -inset-4 blur-3xl -z-10" style={{ background: 'linear-gradient(90deg, rgba(168,85,247,0.3) 0%, rgba(14,165,233,0.3) 100%)' }}></div>
            </div>
            <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed font-light">
              Join millions of entertainment enthusiasts and discover your next favorite movie or series today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/signup"
                className="group relative px-12 py-6 rounded-xl text-2xl font-black overflow-hidden transform transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-white"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3 text-gray-900">
                  <span>Start Free Today</span>
                  <FontAwesomeIcon icon={faRocket} className="group-hover:translate-y-[-4px] transition-transform duration-300" />
                </div>
              </Link>
              
              <Link
                to="/movies"
                className="group relative px-12 py-6 rounded-xl text-2xl font-black overflow-hidden transform transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 glass-glow border-2 border-white/50"></div>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-3 text-white group-hover:text-gray-900 transition-colors duration-300">
                  <span>Browse Now</span>
                  <FontAwesomeIcon icon={faPlay} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-4xl font-display font-black text-white mb-4">
                  Minimus
                </h3>
                <p className="text-gray-400 text-base leading-relaxed mb-6 max-w-md">
                  Your ultimate entertainment companion. Discover, track, and enjoy millions of movies and TV series from around the world.
                </p>
                <div className="flex space-x-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-12 h-12 glass-dark rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-cyan-400/30">
                      <FontAwesomeIcon icon={faFilm} className="text-cyan-400 text-xl" />
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-12 h-12 glass-dark rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-purple-400/30">
                      <FontAwesomeIcon icon={faTv} className="text-purple-400 text-xl" />
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-12 h-12 glass-dark rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-pink-400/30">
                      <FontAwesomeIcon icon={faUsers} className="text-pink-400 text-xl" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-bold text-white mb-6">Discover</h4>
                <ul className="space-y-3">
                  <li><Link to="/movies" className="text-gray-400 hover:text-cyan-400 transition-colors text-base">Movies</Link></li>
                  <li><Link to="/series" className="text-gray-400 hover:text-cyan-400 transition-colors text-base">TV Series</Link></li>
                  <li><Link to="/search" className="text-gray-400 hover:text-cyan-400 transition-colors text-base">Search</Link></li>
                  <li><Link to="/trending" className="text-gray-400 hover:text-cyan-400 transition-colors text-base">Trending</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-xl font-bold text-white mb-6">Account</h4>
                <ul className="space-y-3">
                  <li><Link to="/login" className="text-gray-400 hover:text-cyan-400 transition-colors text-base">Sign In</Link></li>
                  <li><Link to="/signup" className="text-gray-400 hover:text-cyan-400 transition-colors text-base">Sign Up</Link></li>
                  <li><Link to="/profile" className="text-gray-400 hover:text-cyan-400 transition-colors text-base">My Profile</Link></li>
                  <li><Link to="/watchlist" className="text-gray-400 hover:text-cyan-400 transition-colors text-base">Watchlist</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-base">
                © 2024 Minimus. Made with <span className="text-pink-400">❤️</span> for entertainment lovers.
              </p>
              <p className="text-gray-500 text-sm mt-4 md:mt-0">
                Powered by TMDB API
              </p>
            </div>
          </div>
      </footer>
    </div>
  )
}

export default Home