import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBookmark, faStar, faWandMagicSparkles, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import ProductPreview from '../components/ProductPreview'
import { tmdb } from '../services/api'
import { fromTmdbMulti, posterUrl } from '../lib/media'

// Primary CTA gets a small lift, a soft amber glow and a sliding arrow; all of it is off for reduced motion
const CTA_PRIMARY =
  'group px-6 py-3 text-base motion-safe:hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-10px_rgba(255,194,71,0.55)]'
const CTA_GHOST = 'px-6 py-3 text-base motion-safe:hover:-translate-y-0.5 hover:border-muted/60'

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
      .then((data) =>
        setPosters(
          (data.results || [])
            .filter((r) => r.poster_path)
            .map((r) => {
              const item = fromTmdbMulti(r)
              return item && { ...item, poster: posterUrl(r.poster_path, 'w342') }
            })
            .filter(Boolean)
            .slice(0, 18)
        )
      )
      .catch(() => setPosters([]))
  }, [])

  return (
    <div className="min-h-screen bg-obsidian">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold tracking-tight">Minimus</span>
        </Link>
        <nav aria-label="Account" className="flex items-center gap-2">
          <Link to="/login" className="btn text-ink hover:bg-surface">Log in</Link>
          <Link to="/signup" className="btn-primary">Sign up</Link>
        </nav>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          {posters.length > 0 && (
            <div
              aria-hidden
              className="hero-mask absolute inset-0 -z-10 grid grid-cols-3 gap-3 p-3 opacity-60 sm:grid-cols-6 lg:grid-cols-9"
            >
              {posters.map((item, i) => (
                <img
                  key={item.id}
                  src={item.poster}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  // Phones only show the first rows, so skip the rest rather than download them
                  className={`aspect-[2/3] w-full rounded-card object-cover ${i % 2 ? 'translate-y-6' : ''} ${i >= 9 ? 'hidden sm:block' : ''}`}
                />
              ))}
            </div>
          )}
          {/* Fade the wall into the page below so the hero has no hard edge; the centre is already darkened by the mask */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-obsidian/30 via-transparent via-45% to-obsidian to-95%" />

          <div className="mx-auto max-w-3xl px-4 pb-20 pt-16 text-center sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-28">
            <h1 className="text-balance text-[clamp(2.25rem,1.4rem+4.2vw,4.5rem)] font-extrabold leading-[1.05] tracking-tighter">
              Your movie life, <span className="text-amber">beautifully organised.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted sm:text-lg">
              Discover films and series, keep track of what you watch, and share your taste with friends.
            </p>
            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
              <Link to="/signup" className={`btn-primary ${CTA_PRIMARY}`}>
                Get started free
                <FontAwesomeIcon icon={faArrowRight} className="text-sm transition-transform duration-200 motion-safe:group-hover:translate-x-1" />
              </Link>
              <Link to="/login" className={`btn-ghost ${CTA_GHOST}`}>I already have an account</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 sm:pb-28 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon, title, text }) => (
              <div key={title} className="card p-6 transition-colors duration-200 hover:border-muted/40">
                <span className="flex h-10 w-10 items-center justify-center rounded-control bg-amber/10 text-amber">
                  <FontAwesomeIcon icon={icon} />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <ProductPreview items={posters.slice(0, 7)} />
      </main>

      <footer className="border-t border-line px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} Minimus. Movie data from TMDB and OMDb.
      </footer>
    </div>
  )
}

export default Home
