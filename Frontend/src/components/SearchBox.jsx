import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faStar, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { tmdb } from '../services/api'
import { fromTmdbMulti } from '../lib/media'
import { cx } from './ui'

const MIN_CHARS = 2
const DEBOUNCE_MS = 250
const MAX_SUGGESTIONS = 6

// Search input with as-you-type suggestions. Enter opens the full results page, or the highlighted
// suggestion if one was chosen with the arrow keys. Escape and clicking outside close the list.
const SearchBox = ({ autoFocus, className, onNavigate }) => {
  const navigate = useNavigate()
  const listId = useId()
  const wrapper = useRef(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const term = query.trim()

  useEffect(() => {
    if (term.length < MIN_CHARS) {
      setSuggestions([])
      setLoading(false)
      return
    }
    let cancelled = false // ignore responses that arrive after the user typed something else
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const data = await tmdb.get('/search/multi', { query: term, include_adult: false })
        if (cancelled) return
        setSuggestions((data.results || []).map(fromTmdbMulti).filter(Boolean).slice(0, MAX_SUGGESTIONS))
        setActive(-1)
      } catch {
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [term])

  useEffect(() => {
    const close = (e) => wrapper.current && !wrapper.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const go = (path) => {
    setOpen(false)
    setQuery('')
    onNavigate?.()
    navigate(path)
  }

  const submit = (e) => {
    e.preventDefault()
    if (active >= 0 && suggestions[active]) return go(`/movie/${suggestions[active].id}`)
    if (term) go(`/search?q=${encodeURIComponent(term)}`)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (suggestions.length === 0) return
      e.preventDefault()
      setOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      // wraps around; index === suggestions.length is the "See all results" row
      setActive((i) => (i + step + suggestions.length + 1) % (suggestions.length + 1))
    }
  }

  const showPanel = open && term.length >= MIN_CHARS
  const activeId = active >= 0 ? `${listId}-${active}` : undefined

  return (
    <div ref={wrapper} className={cx('relative', className)}>
      <form onSubmit={submit} role="search">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted" />
        <input
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search movies and series..."
          aria-label="Search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          autoComplete="off"
          className="field pl-10 pr-10"
        />
        {loading && <FontAwesomeIcon icon={faSpinner} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-sm text-muted" />}
      </form>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-card border border-line bg-elevated shadow-pop animate-fade-in">
          {suggestions.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted">{loading ? 'Searching...' : `No matches for "${term}"`}</p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Suggestions">
              {suggestions.map((item, i) => (
                <li key={item.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(`/movie/${item.id}`)}
                    className={cx('flex w-full items-center gap-3 px-3 py-2 text-left transition-colors', i === active ? 'bg-surface' : 'hover:bg-surface')}
                  >
                    <span className="h-14 w-10 shrink-0 overflow-hidden rounded-md border border-line bg-surface">
                      {item.poster && <img src={item.poster} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                        <span>{item.type === 'series' ? 'Series' : 'Movie'}</span>
                        {item.year && <span>{item.year}</span>}
                        {item.rating && (
                          <span className="inline-flex items-center gap-1 text-ink">
                            <FontAwesomeIcon icon={faStar} className="text-[0.8em] text-amber" />
                            {item.rating.toFixed(1)}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
              <li role="option" aria-selected={active === suggestions.length}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(suggestions.length)}
                  onClick={() => go(`/search?q=${encodeURIComponent(term)}`)}
                  className={cx('w-full border-t border-line px-4 py-3 text-left text-sm font-medium text-amber transition-colors', active === suggestions.length ? 'bg-surface' : 'hover:bg-surface')}
                >
                  See all results for "{term}"
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBox
