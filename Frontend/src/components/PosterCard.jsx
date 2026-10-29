import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faEye, faHeart } from '@fortawesome/free-solid-svg-icons'
import {
  faBookmark as faBookmarkOutline,
  faEye as faEyeOutline,
  faHeart as faHeartOutline,
} from '@fortawesome/free-regular-svg-icons'
import { useLibrary } from '../context/LibraryContext'
import { Rating, cx } from './ui'

const ACTIONS = [
  { kind: 'watchlist', label: 'watchlist', on: faBookmark, off: faBookmarkOutline, activeClass: 'text-amber' },
  { kind: 'watched', label: 'watched', on: faEye, off: faEyeOutline, activeClass: 'text-amber' },
  { kind: 'favorites', label: 'favorites', on: faHeart, off: faHeartOutline, activeClass: 'text-ember' },
]

// The visual focus of the app: a poster with a title line and rating. Library state (watchlist,
// watched, favorites) is read from and written to LibraryContext.
const PosterCard = ({ item, className }) => {
  const { has, toggle } = useLibrary()

  return (
    <div className={cx('group relative', className)}>
      <Link to={`/movie/${item.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-card border border-line bg-surface shadow-card">
          {item.poster ? (
            <img
              src={item.poster}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-muted">
              {item.title}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {item.type === 'series' && (
            <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
              Series
            </span>
          )}
        </div>
      </Link>

      {/* State buttons: always visible on touch screens, revealed on hover on desktop */}
      <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        {ACTIONS.map(({ kind, label, on, off, activeClass }) => {
          const active = has(kind, item.id)
          return (
            <button
              key={kind}
              type="button"
              onClick={() => toggle(kind, item.id)}
              aria-pressed={active}
              aria-label={`${active ? 'Remove from' : 'Add to'} ${label}`}
              title={`${active ? 'Remove from' : 'Add to'} ${label}`}
              className={cx(
                'flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/70 text-sm backdrop-blur transition-colors hover:bg-black',
                active ? activeClass : 'text-ink'
              )}
            >
              <FontAwesomeIcon icon={active ? on : off} />
            </button>
          )
        })}
      </div>

      <div className="mt-3 px-0.5">
        <Link to={`/movie/${item.id}`} className="block truncate text-sm font-medium transition-colors hover:text-amber">
          {item.title}
        </Link>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          {item.year && <span>{item.year}</span>}
          <Rating value={item.rating} />
        </div>
      </div>
    </div>
  )
}

export default PosterCard
