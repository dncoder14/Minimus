import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faFilm, 
  faSearch, 
  faUser, 
  faHeart, 
  faBookmark, 
  faBars, 
  faTimes,
  faSignOutAlt,
  faTv,
  faChartLine
} from '@fortawesome/free-solid-svg-icons'

const Navbar = ({ user, setUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl glass-card backdrop-blur-xl rounded-full border border-white/10 z-50 shadow-2xl">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.svg" alt="Minimus" className="h-12 w-12" />
            <span className="text-2xl font-display font-bold" style={{ color: '#A855F7' }}>
              Minimus
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/dashboard" className="px-4 py-2 rounded-full text-cinematic-text hover:bg-white/10 transition-all">
                <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                Dashboard
              </Link>
              <Link to="/movies" className="px-4 py-2 rounded-full text-cinematic-text hover:bg-white/10 transition-all">
                <FontAwesomeIcon icon={faFilm} className="mr-2" />
                Movies
              </Link>
              <Link to="/series" className="px-4 py-2 rounded-full text-cinematic-text hover:bg-white/10 transition-all">
                <FontAwesomeIcon icon={faTv} className="mr-2" />
                Series
              </Link>
            </div>
          )}

          {/* Search Bar */}
          {user && (
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-white/5 border border-white/10 rounded-full px-4 py-2 pl-10 w-48 text-white placeholder-gray-400 focus:outline-none focus:border-electric-blue transition-all"
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </form>
          )}

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link to="/profile" className="px-4 py-2 rounded-full text-cinematic-text hover:bg-white/10 transition-all">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full text-cinematic-text hover:bg-red-500/20 hover:text-red-400 transition-all"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-6 py-2 rounded-full text-white hover:bg-white/10 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="text-xl" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-4">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, series..."
                    className="bg-cinematic-card border border-cinematic-border rounded-lg px-4 py-2 pl-10 w-full text-white placeholder-cinematic-muted focus:outline-none focus:border-electric-blue transition-colors"
                  />
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </form>
              
              <Link to="/dashboard" className="flex items-center space-x-2 py-2 text-cinematic-text hover:text-electric-blue transition-colors">
                <FontAwesomeIcon icon={faChartLine} />
                <span>Dashboard</span>
              </Link>
              <Link to="/movies" className="flex items-center space-x-2 py-2 text-cinematic-text hover:text-electric-blue transition-colors">
                <FontAwesomeIcon icon={faFilm} />
                <span>Movies</span>
              </Link>
              <Link to="/series" className="flex items-center space-x-2 py-2 text-cinematic-text hover:text-electric-blue transition-colors">
                <FontAwesomeIcon icon={faTv} />
                <span>Series</span>
              </Link>
              
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center space-x-2 py-2 text-cinematic-text hover:text-electric-blue transition-colors">
                    <FontAwesomeIcon icon={faUser} />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 py-2 text-cinematic-text hover:text-electric-blue transition-colors text-left"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="py-2 text-cinematic-text hover:text-electric-blue transition-colors">
                    Login
                  </Link>
                  <Link to="/signup" className="py-2 text-cinematic-text hover:text-electric-blue transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar