import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { tmdb } from '../services/api'
import { posterUrl } from '../lib/media'

// Split layout for login and signup: form on the left, brand panel on the right (desktop only).
const AuthLayout = ({ title, subtitle, children, footer }) => {
  const [posters, setPosters] = useState([])

  useEffect(() => {
    tmdb
      .get('/trending/all/week')
      .then((data) => setPosters((data.results || []).filter((r) => r.poster_path).slice(0, 18).map((r) => posterUrl(r.poster_path, 'w342'))))
      .catch(() => setPosters([]))
  }, [])

  return (
  <div className="grid min-h-screen bg-obsidian lg:grid-cols-2">
    <div className="flex flex-col px-6 py-8 sm:px-12">
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
        <span className="text-lg font-bold tracking-tight">Minimus</span>
      </Link>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mb-8 mt-2 text-sm text-muted">{subtitle}</p>
        {children}
        <p className="mt-8 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>

    <div className="relative hidden overflow-hidden border-l border-line bg-surface lg:block">
      {/* Tilted poster wall; falls back to a soft glow if posters cannot load */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,194,71,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.10),transparent_55%)]" />
      {posters.length > 0 && (
        <div aria-hidden className="absolute inset-0 grid grid-cols-3 gap-5 px-8">
          {[0, 1, 2].map((col) => {
            const column = posters.filter((_, i) => i % 3 === col)
            return (
              <div key={col} className="overflow-hidden">
                {/* Posters are listed twice; the track slowly drifts by half its height, then loops.
                    Columns move in opposite directions at different speeds. Disabled for reduced motion. */}
                <div
                  className={`flex flex-col motion-reduce:animate-none ${col === 1 ? 'animate-drift-down' : 'animate-drift-up'}`}
                  style={{ animationDelay: `${-col * 23}s`, animationDuration: `${[80, 95, 70][col]}s` }}
                >
                  {[0, 1].map((copy) => (
                    <div key={copy} className="flex flex-col gap-5 pb-5">
                      {column.map((src) => (
                        <img key={`${copy}-${src}`} src={src} alt="" className="aspect-[2/3] w-full rounded-card border border-line object-cover shadow-card" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {/* Dark fade only behind the tagline at the bottom, so the posters above stay bright */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian from-[8%] via-obsidian/80 via-[26%] to-transparent to-[55%]" />
      {/* Soft edge where the form side meets the posters */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-obsidian/60 to-transparent" />

      <div className="relative flex h-full flex-col justify-end p-14">
        <p className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">Every film you love, in one quiet place.</p>
        <p className="mt-4 max-w-md text-muted">Track what you watch, rate it, and get recommendations that actually fit your taste.</p>
      </div>
    </div>
  </div>
  )
}

export default AuthLayout
