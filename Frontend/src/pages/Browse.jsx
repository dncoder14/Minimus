import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { tmdb } from '../services/api'
import PosterCard from '../components/PosterCard'
import { Chip, PageHeader, PosterSkeleton, GRID, EmptyState, ErrorState } from '../components/ui'

const SORTS = [
  { value: 'popularity.desc', label: 'Most popular' },
  { value: 'vote_average.desc', label: 'Top rated' },
  { value: 'primary_release_date.desc', label: 'Newest' },
]

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

// Shared discovery page for movies and series: genre chips, sort, year and paging.
// `kind` is "movie" or "tv"; `mapItem` converts a TMDB result into a poster item.
const Browse = ({ kind, title, subtitle, mapItem }) => {
  const [params, setParams] = useSearchParams()
  const genre = params.get('genre') || ''
  const year = params.get('year') || ''
  const sort = params.get('sort') || 'popularity.desc'
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
      const query = { page, sort_by: sort === 'primary_release_date.desc' && kind === 'tv' ? 'first_air_date.desc' : sort }
      if (kind === 'movie') query['vote_count.gte'] = 50
      if (genre) query.with_genres = genre
      if (year) query[kind === 'movie' ? 'primary_release_year' : 'first_air_date_year'] = year
      const data = await tmdb.get(`/discover/${kind}`, query)
      setItems((data.results || []).map(mapItem))
      setTotalPages(Math.min(data.total_pages || 0, 500))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [kind, genre, year, sort, page, mapItem])

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
        <PosterSkeleton count={15} />
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
