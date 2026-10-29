import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { tmdb } from '../services/api'
import { fromTmdbMulti } from '../lib/media'
import PosterCard from '../components/PosterCard'
import { Chip, PageHeader, PosterSkeleton, GRID, EmptyState, ErrorState } from '../components/ui'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
]

const Search = () => {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim()
  const [results, setResults] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!q) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(false)
    tmdb
      .get('/search/multi', { query: q, include_adult: false })
      .then((data) => !cancelled && setResults((data.results || []).map(fromTmdbMulti).filter((r) => r && r.poster)))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [q, attempt])

  const shown = filter === 'all' ? results : results.filter((r) => r.type === filter)

  return (
    <div className="animate-fade-in">
      <PageHeader title={q ? `Results for "${q}"` : 'Search'} subtitle={q && !loading ? `${shown.length} titles` : undefined} />

      {!q ? (
        <EmptyState icon={faMagnifyingGlass} title="Search for a movie or series">
          Use the search box at the top to find any title.
        </EmptyState>
      ) : (
        <>
          <div className="mb-8 flex gap-2">
            {FILTERS.map((f) => (
              <Chip key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
                {f.label}
              </Chip>
            ))}
          </div>

          {loading ? (
            <PosterSkeleton count={10} />
          ) : error ? (
            <ErrorState message="Search failed." onRetry={() => setAttempt((a) => a + 1)} />
          ) : shown.length === 0 ? (
            <EmptyState icon={faMagnifyingGlass} title="No results found">
              Check the spelling or try a different title.
            </EmptyState>
          ) : (
            <div className={GRID}>
              {shown.map((item) => (
                <PosterCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Search
