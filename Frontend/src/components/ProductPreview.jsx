import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faEye, faHeart, faStar, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { Chip, Rating, cx } from './ui'

// Illustrative content: reviewers, review text, likes and the user's own rating are made up
const REVIEWS = [
  { name: 'Maya R.', rating: 5, likes: 24, text: 'Gorgeous photography and a score that stays with you. Easily my favourite this year.' },
  { name: 'Jon T.', rating: 4, likes: 9, text: 'A slow start, but the final act pays everything off.' },
  { name: 'Priya S.', rating: 4, likes: 6, text: 'Great performances all round. I would happily watch it again.' },
]

const FILTERS = ['Trending', 'Action', 'Drama', 'Sci-Fi']

// Fades the preview in once, the first time it scrolls into view
const useRevealOnScroll = () => {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -80px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, shown]
}

const Stars = ({ value, className }) => (
  <span className={cx('inline-flex gap-0.5', className)}>
    {[1, 2, 3, 4, 5].map((n) => (
      <FontAwesomeIcon key={n} icon={faStar} className={n <= value ? 'text-amber' : 'text-muted/30'} />
    ))}
  </span>
)

// Poster tile; falls back to a quiet placeholder when the poster feed is unavailable
const Poster = ({ item }) =>
  item?.poster ? (
    <img src={item.poster} alt="" loading="lazy" decoding="async" className="aspect-[2/3] w-full object-cover" />
  ) : (
    <div className="aspect-[2/3] w-full bg-elevated" />
  )

const PanelLabel = ({ children }) => (
  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">{children}</p>
)

// Small round badge laid over a poster to show library state
const Badge = ({ icon }) => (
  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[11px] text-amber">
    <FontAwesomeIcon icon={icon} />
  </span>
)

// A static, non-interactive illustration of the signed-in app. Titles, years and ratings come from
// the live TMDB trending feed; everything personal (lists, the user's rating, reviews) is sample
// content and is labelled as such. The panel is hidden from assistive tech and inert so the
// decorative chips never take focus.
const ProductPreview = ({ items }) => {
  const [ref, shown] = useRevealOnScroll()
  const slots = Array.from({ length: 7 }, (_, i) => items[i])
  const discover = slots.slice(0, 5)
  // Title 2 carries the watchlist badge above, so it leads the list
  const watchlist = [slots[1], slots[5], slots[6]]
  const featured = slots[0]

  return (
    <section aria-labelledby="preview-heading" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber">Inside Minimus</p>
        <h2 id="preview-heading" className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you watch, in one place.
        </h2>
        <p className="mt-4 text-pretty text-base text-muted sm:text-lg">
          Browse what is trending, save it for later, rate it when the credits roll and read what others thought.
        </p>
      </div>

      <div
        ref={ref}
        aria-hidden
        inert
        className={cx(
          'card mt-12 overflow-hidden shadow-pop transition duration-500 ease-out motion-reduce:transition-none',
          shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100'
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6 border-b border-line p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div>
              <PanelLabel>Discover</PanelLabel>
              <div className="scrollbar-hide -mx-5 mb-4 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                {FILTERS.map((f, i) => (
                  <Chip key={f} active={i === 0} tabIndex={-1} className="py-1 text-xs">
                    {f}
                  </Chip>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
                {discover.map((item, i) => (
                  <div key={i} className={cx(i > 2 && 'hidden sm:block')}>
                    <div className="relative overflow-hidden rounded-card border border-line shadow-card">
                      <Poster item={item} />
                      {i === 0 && <Badge icon={faEye} />}
                      {i === 1 && <Badge icon={faBookmark} />}
                    </div>
                    {item ? (
                      <>
                        <p className="mt-2 truncate text-[13px] font-medium sm:text-sm">{item.title}</p>
                        <Rating value={item.rating} className="mt-0.5 text-[13px] text-muted" />
                      </>
                    ) : (
                      <div className="mt-2 h-3 w-3/4 rounded bg-elevated" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <PanelLabel>Your watchlist</PanelLabel>
              <ul className="divide-y divide-line rounded-card border border-line bg-obsidian/40">
                {watchlist.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-10 shrink-0 overflow-hidden rounded-md">
                      <Poster item={item} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {item ? (
                        <>
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          <p className="text-[13px] text-muted">
                            {item.type === 'series' ? 'Series' : 'Movie'}
                            {item.year && ` · ${item.year}`}
                          </p>
                        </>
                      ) : (
                        <div className="h-3 w-1/2 rounded bg-elevated" />
                      )}
                    </div>
                    <Rating value={item?.rating} className="text-[13px] text-muted" />
                    <FontAwesomeIcon icon={faBookmark} className="text-sm text-amber" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <div>
              <PanelLabel>Rate and review</PanelLabel>
              <div className="flex gap-4">
                <div className="w-20 shrink-0 self-start overflow-hidden rounded-card border border-line">
                  <Poster item={featured} />
                </div>
                <div className="min-w-0">
                  {featured ? (
                    <>
                      <h3 className="truncate font-semibold">{featured.title}</h3>
                      <p className="mt-0.5 text-[13px] text-muted">{featured.year}</p>
                    </>
                  ) : (
                    <div className="h-4 w-32 rounded bg-elevated" />
                  )}
                  <Stars value={4} className="mt-3 text-base" />
                  <div className="mt-3 flex gap-2">
                    {[
                      { icon: faBookmark, on: false },
                      { icon: faEye, on: true },
                      { icon: faHeart, on: false },
                    ].map(({ icon, on }, i) => (
                      <span
                        key={i}
                        className={cx(
                          'flex h-8 w-8 items-center justify-center rounded-full border text-sm',
                          on ? 'border-amber/40 bg-amber/10 text-amber' : 'border-line bg-elevated text-muted'
                        )}
                      >
                        <FontAwesomeIcon icon={icon} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <PanelLabel>Community reviews</PanelLabel>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1">
                {REVIEWS.map((r, i) => (
                  <li key={r.name} className={cx('rounded-card border border-line bg-obsidian/40 p-4', i === 2 && 'hidden lg:block')}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold">
                        {r.name[0]}
                      </span>
                      <span className="text-sm font-medium">{r.name}</span>
                      <Stars value={r.rating} className="ml-auto text-xs" />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{r.text}</p>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-muted">
                      <FontAwesomeIcon icon={faThumbsUp} /> {r.likes}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        {items.length > 0
          ? 'Illustrative preview. Titles and ratings are live from TMDB; lists, reviews and reviewers are sample content.'
          : 'Illustrative preview with sample content.'}
      </p>
    </section>
  )
}

export default ProductPreview
