import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faBookmark, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { faBookmark as faBookmarkOutline } from '@fortawesome/free-regular-svg-icons'
import { useLibrary } from '../context/LibraryContext'
import { Rating, cx } from './ui'

const INTERVAL_MS = 7000

// Large featured banner. Auto-advances, pauses on hover, and supports dots and arrows.
const HeroCarousel = ({ items }) => {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const { has, toggle } = useLibrary()

  useEffect(() => {
    if (paused || items.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [paused, items.length])

  if (items.length === 0) return null
  const item = items[index % items.length]
  const saved = has('watchlist', item.id)
  const step = (dir) => setIndex((i) => (i + dir + items.length) % items.length)

  return (
    <section
      className="group relative isolate overflow-hidden rounded-card border border-line bg-surface shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured titles"
    >
      <div className="relative aspect-[4/5] sm:aspect-[16/8] lg:aspect-[21/8]">
        {items.map((slide, i) => (
          <img
            key={slide.id}
            src={slide.backdrop || slide.poster}
            alt=""
            className={cx(
              'absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-700',
              i === index ? 'opacity-100' : 'opacity-0'
            )}
          />
        ))}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-obsidian/85 via-obsidian/30 to-transparent" />

        <div className="flex h-full flex-col justify-end p-5 sm:p-8 lg:p-10">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-black/60 px-2.5 py-1 backdrop-blur">{item.type === 'series' ? 'Series' : 'Movie'}</span>
            {item.year && <span className="rounded-full bg-black/60 px-2.5 py-1 backdrop-blur">{item.year}</span>}
            <Rating value={item.rating} className="rounded-full bg-black/60 px-2.5 py-1 backdrop-blur" />
          </div>
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{item.title}</h2>
          <p className="mt-3 line-clamp-2 max-w-xl text-sm text-ink/80 sm:text-base">{item.overview}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link to={`/movie/${item.id}`} className="btn-primary">
              <FontAwesomeIcon icon={faCircleInfo} /> View details
            </Link>
            <button onClick={() => toggle('watchlist', item.id)} className="btn-ghost bg-black/50 backdrop-blur" aria-pressed={saved}>
              <FontAwesomeIcon icon={saved ? faBookmark : faBookmarkOutline} className={saved ? 'text-amber' : ''} />
              {saved ? 'In watchlist' : 'Watchlist'}
            </button>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <>
          <div className="absolute bottom-5 right-5 hidden items-center gap-1.5 sm:flex sm:bottom-8 sm:right-8">
            {items.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setIndex(i)}
                aria-label={`Show ${slide.title}`}
                className={cx('h-1.5 rounded-full transition-all', i === index ? 'w-6 bg-amber' : 'w-1.5 bg-white/40 hover:bg-white/70')}
              />
            ))}
          </div>
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              onClick={() => step(dir)}
              aria-label={dir < 0 ? 'Previous' : 'Next'}
              className={cx(
                'absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-sm opacity-0 backdrop-blur transition-opacity hover:bg-black/80 group-hover:opacity-100 lg:flex',
                dir < 0 ? 'left-4' : 'right-4'
              )}
            >
              <FontAwesomeIcon icon={dir < 0 ? faChevronLeft : faChevronRight} />
            </button>
          ))}
        </>
      )}
    </section>
  )
}

export default HeroCarousel
