import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse,
  faFilm,
  faTv,
  faUserGroup,
  faBookmark,
  faHeart,
  faEye,
  faStar,
  faMagnifyingGlass,
  faChevronDown,
  faRightFromBracket,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import SearchBox from './SearchBox'
import { cx } from './ui'

const MAIN_NAV = [
  { to: '/dashboard', label: 'Home', icon: faHouse },
  { to: '/movies', label: 'Movies', icon: faFilm },
  { to: '/series', label: 'Series', icon: faTv },
  { to: '/community', label: 'Community', icon: faUserGroup },
]

const LIBRARY_NAV = [
  { tab: 'watchlist', label: 'Watchlist', icon: faBookmark },
  { tab: 'favorites', label: 'Favorites', icon: faHeart },
  { tab: 'watched', label: 'Watched', icon: faEye },
  { tab: 'reviews', label: 'My reviews', icon: faStar },
]

const Logo = ({ className }) => (
  <Link to="/dashboard" className={cx('flex items-center gap-3', className)}>
    <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
    <span className="text-lg font-bold tracking-tight">Minimus</span>
  </Link>
)

const navItem = ({ isActive }) =>
  cx(
    'flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors',
    isActive ? 'bg-elevated text-amber' : 'text-muted hover:bg-surface hover:text-ink'
  )

const AppShell = ({ user, setUser }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)
  const menuRef = useRef(null)
  const activeTab = new URLSearchParams(location.search).get('tab')

  useEffect(() => {
    setMenuOpen(false)
    setMobileSearch(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const initial = (user?.name || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-obsidian px-4 py-6 lg:flex">
        <Logo className="px-2" />

        <nav className="mt-10 space-y-1" aria-label="Main">
          {MAIN_NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={navItem}>
              <FontAwesomeIcon icon={icon} className="w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <p className="mb-2 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-muted/70">Library</p>
        <nav className="space-y-1" aria-label="Library">
          {LIBRARY_NAV.map(({ tab, label, icon }) => {
            const active = location.pathname === '/profile' && (activeTab || 'watchlist') === tab
            return (
              <Link key={tab} to={`/profile?tab=${tab}`} className={navItem({ isActive: active })}>
                <FontAwesomeIcon icon={icon} className="w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 border-b border-line bg-obsidian/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Logo className="lg:hidden" />

            <SearchBox className="hidden max-w-xl flex-1 sm:block" />

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setMobileSearch((v) => !v)}
                className="flex h-10 w-10 items-center justify-center rounded-control text-muted hover:bg-surface hover:text-ink sm:hidden"
                aria-label="Search"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-control p-1.5 pr-2 transition-colors hover:bg-surface"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber text-sm font-bold text-obsidian">
                    {initial}
                  </span>
                  <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:block">{user?.name}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="hidden text-xs text-muted sm:block" />
                </button>

                {menuOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-52 rounded-card border border-line bg-elevated p-1.5 shadow-pop animate-fade-in">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-medium">{user?.name}</p>
                      <p className="truncate text-xs text-muted">{user?.email}</p>
                    </div>
                    <div className="my-1 border-t border-line" />
                    <Link role="menuitem" to="/profile" className="flex items-center gap-3 rounded-control px-3 py-2 text-sm hover:bg-surface">
                      <FontAwesomeIcon icon={faUser} className="w-4 text-muted" /> Profile and settings
                    </Link>
                    <button role="menuitem" onClick={logout} className="flex w-full items-center gap-3 rounded-control px-3 py-2 text-left text-sm hover:bg-surface">
                      <FontAwesomeIcon icon={faRightFromBracket} className="w-4 text-muted" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {mobileSearch && (
            <div className="border-t border-line px-4 py-3 sm:hidden">
              <SearchBox autoFocus onNavigate={() => setMobileSearch(false)} />
            </div>
          )}
        </header>

        <main className="mx-auto max-w-[1600px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-obsidian/95 backdrop-blur-md lg:hidden" aria-label="Main">
        {[...MAIN_NAV, { to: '/profile', label: 'Library', icon: faBookmark }].map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cx('flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium', isActive ? 'text-amber' : 'text-muted')
            }
          >
            <FontAwesomeIcon icon={icon} className="text-base" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AppShell
