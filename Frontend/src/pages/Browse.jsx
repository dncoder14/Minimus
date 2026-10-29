import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { tmdb, catalogAPI } from '../services/api'
import PosterCard from '../components/PosterCard'
import { Chip, PageHeader, PosterSkeleton, GRID, EmptyState, ErrorState } from '../components/ui'

const SORTS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'top_rated', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
]

// Titles per page. 18 divides evenly into the 2, 3 and 6 column grids, so rows are always full.
const PER_PAGE = 18

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

// Shared discovery page for movies and series: genre chips, sort, year and paging.
// `kind` is "movie" or "tv". The backend returns ready-to-render poster items.
const Browse = ({ kind, title, subtitle }) => {
  const [params, setParams] = useSearchParams()
  const genre = params.get('genre') || ''
  const year = params.get('year') || ''
  const sort = SORTS.some((s) => s.value === params.get('sort')) ? params.get('sort') : 'popular'
  const page = Math.max(1, parseInt(params.get('page') || '1', 10))

  const [genres, setGenres] = useState([])
  const [items, setItems] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const update = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
    if (!('page' in changes)) next.delete('page') // changing a filter returns to page 1
    setParams(next, { replace: true })
  }

  useEffect(() => {
    tmdb.get(`/genre/${kind}/list`).then((data) => setGenres(data.genres || [])).catch(() => {})
  }, [kind])

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await catalogAPI.discover(kind, { genre: genre || undefined, year: year || undefined, sort, page, limit: PER_PAGE })
      setItems(data.results)
      setTotalPages(data.totalPages)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [kind, genre, year, sort, page])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="animate-fade-in">
      <PageHeader title={title} subtitle={subtitle}>
        <div className="flex gap-2">
          <select aria-label="Year" value={year} onChange={(e) => update({ year: e.target.value })} className="field w-auto py-2">
            <option value="">All years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select aria-label="Sort" value={sort} onChange={(e) => update({ sort: e.target.value })} className="field w-auto py-2">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      <div className="scrollbar-hide -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={!genre} onClick={() => update({ genre: '' })}>
          All
        </Chip>
        {genres.map((g) => (
          <Chip key={g.id} active={String(g.id) === genre} onClick={() => update({ genre: String(g.id) })}>
            {g.name}
          </Chip>
        ))}
      </div>

      {loading ? (
        <PosterSkeleton count={18} />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="Nothing matches those filters">Try a different genre or year.</EmptyState>
      ) : (
        <div className={GRID}>
          {items.map((item) => (
            <PosterCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button className="btn-ghost" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
            <FontAwesomeIcon icon={faChevronLeft} /> Previous
          </button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <button className="btn-ghost" disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) })}>
            Next <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  )
}

export default Browse
