import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons'
import MovieCard from '../components/MovieCard'
import { watchlistAPI, favoritesAPI, moviesAPI } from '../services/api'

const Search = () => {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)
    
    try {
      const response = await moviesAPI.search(searchQuery)
      setResults(response.data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const queryParam = searchParams.get('q')
    if (queryParam) {
      setQuery(queryParam)
      handleSearch(queryParam)
    }
  }, [searchParams])

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch(query)
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6 flex items-center space-x-3">
            <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
            <span>Search Results</span>
          </h1>
        </div>

        {/* Search Results */}
        {loading && (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin mb-4" />
            <p className="text-xl text-gray-400">Searching...</p>
          </div>
        )}

        {!loading && hasSearched && (
          <>
            <div className="mb-6">
              <p className="text-gray-400">
                {results.length > 0 
                  ? `Found ${results.length} results for "${query}"`
                  : `No results found for "${query}"`
                }
              </p>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {results.map((item) => (
                  <MovieCard
                    key={item.imdbID}
                    movie={{
                      imdbId: item.imdbID,
                      title: item.Title,
                      year: item.Year,
                      poster: item.Poster,
                      imdbRating: item.imdbRating,
                      runtime: item.Runtime,
                      genre: item.Genre,
                      plot: item.Plot,
                      type: item.Type
                    }}
                    onAddToWatchlist={async () => {
                      const token = localStorage.getItem('token')
                      if (!token) {
                        alert('Please login to add to watchlist')
                        return
                      }
                      try {
                        await watchlistAPI.add(item.imdbID)
                        alert('Added to watchlist!')
                      } catch (error) {
                        console.error('Watchlist error:', error)
                        alert(error.response?.data?.error || 'Failed to add to watchlist')
                      }
                    }}
                    onAddToFavorites={async () => {
                      const token = localStorage.getItem('token')
                      if (!token) {
                        alert('Please login to add to favorites')
                        return
                      }
                      try {
                        await favoritesAPI.add(item.imdbID)
                        alert('Added to favorites!')
                      } catch (error) {
                        console.error('Favorites error:', error)
                        alert(error.response?.data?.error || 'Failed to add to favorites')
                      }
                    }}
                    isInWatchlist={false}
                    isInFavorites={false}
                  />
                ))}
              </div>
            ) : hasSearched && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold mb-2">No Results Found</h3>
                <p className="text-gray-400 mb-6">
                  Try searching with different keywords or check your spelling
                </p>
                <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                  <h4 className="font-semibold mb-3">Search Tips:</h4>
                  <ul className="text-sm text-gray-400 space-y-1 text-left">
                    <li>• Try different keywords</li>
                    <li>• Check spelling</li>
                    <li>• Use movie or actor names</li>
                    <li>• Try searching by year (e.g., "2023")</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}

        {!hasSearched && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-semibold mb-2">Discover Amazing Content</h3>
            <p className="text-gray-400 mb-6">
              Search for your favorite movies, TV series, actors, and directors
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-2">Popular Searches</h4>
                <div className="space-y-2 text-sm">
                  <button 
                    onClick={() => { setQuery('Marvel'); handleSearch('Marvel'); }}
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    Marvel Movies
                  </button>
                  <button 
                    onClick={() => { setQuery('Christopher Nolan'); handleSearch('Christopher Nolan'); }}
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    Christopher Nolan
                  </button>
                  <button 
                    onClick={() => { setQuery('Breaking Bad'); handleSearch('Breaking Bad'); }}
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    Breaking Bad
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-2">By Genre</h4>
                <div className="space-y-2 text-sm">
                  <button 
                    onClick={() => { setQuery('Action'); handleSearch('Action'); }}
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    Action Movies
                  </button>
                  <button 
                    onClick={() => { setQuery('Comedy'); handleSearch('Comedy'); }}
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    Comedy Films
                  </button>
                  <button 
                    onClick={() => { setQuery('Horror'); handleSearch('Horror'); }}
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    Horror Movies
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <h4 className="font-semibold mb-2">By Year</h4>
                <div className="space-y-2 text-sm">
                  <button 
                    onClick={() => { setQuery('2023'); handleSearch('2023'); }}
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    2023 Movies
                  </button>
                  <button 
                    onClick={() => { setQuery('2022'); handleSearch('2022'); }}
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    2022 Movies
                  </button>
                  <button 
                    onClick={() => { setQuery('90s'); handleSearch('90s'); }}
                    className="block text-blue-400 hover:text-blue-300"
                  >
                    90s Classics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search