import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faStar, faWandMagicSparkles, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { tmdb } from '../services/api'
import { posterUrl } from '../lib/media'

const FEATURES = [
  { icon: faBookmark, title: 'Track everything', text: 'Keep a watchlist, mark what you have watched and save your favorites.' },
  { icon: faStar, title: 'Rate and review', text: 'Give titles a star rating, write a review and see what others thought.' },
  { icon: faWandMagicSparkles, title: 'Smart picks', text: 'Recommendations built from your own taste and from people like you.' },
  { icon: faUserGroup, title: 'Follow friends', text: 'See what your friends are watching, with privacy controls you decide.' },
]

const Home = () => {
  const [posters, setPosters] = useState([])

  useEffect(() => {
    tmdb
      .get('/trending/all/week')
      .then((data) => setPosters((data.results || []).filter((r) => r.poster_path).slice(0, 18).map((r) => posterUrl(r.poster_path, 'w342'))))
      .catch(() => setPosters([]))
  }, [])

  return (
    <div className="min-h-screen bg-obsidian">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold tracking-tight">Minimus</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/login" className="btn text-ink hover:bg-surface">Log in</Link>
          <Link to="/signup" className="btn-primary">Sign up</Link>
        </nav>
      </header>

      <section className="relative isolate overflow-hidden">
        {posters.length > 0 && (
          <div aria-hidden className="absolute inset-0 -z-10 grid grid-cols-3 gap-3 p-3 opacity-25 sm:grid-cols-6 lg:grid-cols-9">
            {posters.map((src, i) => (
              <img key={src} src={src} alt="" className={`aspect-[2/3] w-full rounded-card object-cover ${i % 2 ? 'translate-y-6' : ''}`} />
            ))}
          </div>
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-obsidian/60 via-obsidian/85 to-obsidian" />

        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:py-32">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Your movie life, <span className="text-amber">beautifully organised.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Discover films and series, keep track of what you watch, and share your taste with friends.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="btn-primary px-6 py-3 text-base">Get started free</Link>
            <Link to="/login" className="btn-ghost px-6 py-3 text-base">I already have an account</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon, title, text }) => (
            <div key={title} className="card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-control bg-amber/10 text-amber">
                <FontAwesomeIcon icon={icon} />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} Minimus. Movie data from TMDB and OMDb.
      </footer>
    </div>
  )
}

export default Home
