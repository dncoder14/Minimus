import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { watchlistAPI, favoritesAPI, watchedAPI } from '../services/api'

const LibraryContext = createContext(null)

const KINDS = {
  watchlist: { api: watchlistAPI, key: 'watchlist', added: 'Added to watchlist', removed: 'Removed from watchlist' },
  favorites: { api: favoritesAPI, key: 'favorites', added: 'Added to favorites', removed: 'Removed from favorites' },
  watched: { api: watchedAPI, key: 'watched', added: 'Marked as watched', removed: 'Removed from watched' },
}

// Holds the ids in the user's watchlist, favorites and watched lists so every poster card can show
// and toggle its state without each page wiring its own requests.
export const LibraryProvider = ({ user, children }) => {
  const [ids, setIds] = useState({ watchlist: new Set(), favorites: new Set(), watched: new Set() })

  useEffect(() => {
    if (!user) {
      setIds({ watchlist: new Set(), favorites: new Set(), watched: new Set() })
      return
    }
    Promise.all(Object.values(KINDS).map(({ api, key }) => api.get(100).then((res) => [key, res.data[key]])))
      .then((entries) =>
        setIds(Object.fromEntries(entries.map(([key, items]) => [key, new Set(items.map((i) => i.imdbId))])))
      )
      .catch(() => {})
  }, [user])

  const has = useCallback((kind, id) => ids[kind].has(id), [ids])

  const toggle = useCallback(
    async (kind, id) => {
      const { api, added, removed } = KINDS[kind]
      const active = ids[kind].has(id)
      const update = (on) =>
        setIds((prev) => {
          const next = new Set(prev[kind])
          if (on) next.add(id)
          else next.delete(id)
          return { ...prev, [kind]: next }
        })

      update(!active) // optimistic
      try {
        if (active) await api.remove(id)
        else await api.add(id)
        toast.success(active ? removed : added)
      } catch (error) {
        update(active)
        toast.error(error.response?.data?.error || 'Something went wrong')
      }
    },
    [ids]
  )

  const value = useMemo(() => ({ has, toggle }), [has, toggle])
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export const useLibrary = () => {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider')
  return ctx
}
