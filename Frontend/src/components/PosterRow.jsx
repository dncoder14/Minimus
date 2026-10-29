import { useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import PosterCard from './PosterCard'
import { SectionHeader } from './ui'

// Horizontally scrolling row of posters with arrow buttons on desktop and swipe on touch.
const PosterRow = ({ title, subtitle, items, loading, action }) => {
  const scroller = useRef(null)
  const scrollBy = (direction) => {
    const el = scroller.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  const arrows = (
    <div className="hidden gap-2 md:flex">
      {action}
      {[-1, 1].map((dir) => (
        <button
          key={dir}
          onClick={() => scrollBy(dir)}
          aria-label={dir < 0 ? 'Scroll left' : 'Scroll right'}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-sm text-muted transition-colors hover:bg-elevated hover:text-ink"
        >
          <FontAwesomeIcon icon={dir < 0 ? faChevronLeft : faChevronRight} />
        </button>
      ))}
    </div>
  )

  return (
    <section className="animate-fade-in">
      <SectionHeader title={title} subtitle={subtitle} action={arrows} />
      <div
        ref={scroller}
        className="scrollbar-hide -mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-36 shrink-0 animate-pulse sm:w-44 lg:w-48">
                <div className="aspect-[2/3] rounded-card bg-surface" />
                <div className="mt-3 h-3.5 w-3/4 rounded bg-surface" />
              </div>
            ))
          : items.map((item) => (
              <div key={item.id} className="w-36 shrink-0 snap-start sm:w-44 lg:w-48">
                <PosterCard item={item} />
              </div>
            ))}
      </div>
    </section>
  )
}

export default PosterRow
