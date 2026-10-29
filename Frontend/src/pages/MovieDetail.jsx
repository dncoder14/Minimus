import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faEye, faHeart, faStar, faPen, faThumbsUp, faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { faBookmark as faBookmarkOutline, faEye as faEyeOutline, faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons'
import { moviesAPI, reviewsAPI } from '../services/api'
import { useLibrary } from '../context/LibraryContext'
import { Chip, ErrorState, Rating, SectionHeader, Spinner, cx } from '../components/ui'

const present = (v) => v && v !== 'N/A'

const STATE_BUTTONS = [
  { kind: 'watchlist', label: 'Watchlist', on: faBookmark, off: faBookmarkOutline, active: 'text-amber' },
  { kind: 'watched', label: 'Watched', on: faEye, off: faEyeOutline, active: 'text-amber' },
  { kind: 'favorites', label: 'Favorite', on: faHeart, off: faHeartOutline, active: 'text-ember' },
]

const Stars = ({ value, onChange, size = 'text-base' }) => (
  <div className="flex items-center gap-1" role={onChange ? 'radiogroup' : undefined} aria-label="Rating">
    {[1, 2, 3, 4, 5].map((n) => {
      const star = <FontAwesomeIcon icon={faStar} className={cx(size, n <= value ? 'text-amber' : 'text-line')} />
      return onChange ? (
        <button key={n} type="button" onClick={() => onChange(n)} role="radio" aria-checked={n === value} aria-label={`${n} star${n > 1 ? 's' : ''}`} className="p-0.5 transition-transform hover:scale-110">
          {star}
        </button>
      ) : (
        <span key={n}>{star}</span>
      )
    })}
  </div>
)

const MovieDetail = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { has, toggle } = useLibrary()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [sort, setSort] = useState('recent')
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [spoiler, setSpoiler] = useState(false)
  const [revealed, setRevealed] = useState({})

  const loadMovie = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await moviesAPI.getById(id)
      setMovie(response.data.movie)
    } catch (err) {
      setError(err.response?.status === 404 ? 'We could not find that title.' : 'Failed to fetch movie details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  const loadReviews = useCallback(async () => {
    try {
      const res = await reviewsAPI.getByMovie(id, sort)
      setReviews(res.data.reviews || [])
      setAverageRating(res.data.averageRating || 0)
    } catch {
      setReviews([])
    }
  }, [id, sort])

  useEffect(() => {
    loadMovie()
  }, [loadMovie])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const mine = useMemo(() => reviews.find((r) => r.user.id === user?.id), [reviews, user])

  const openForm = () => {
    setRating(mine?.rating || 0)
    setComment(mine?.comment || '')
    setSpoiler(mine?.spoiler || false)
    setShowForm(true)
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!rating) return toast.error('Pick a star rating first')
    try {
      await reviewsAPI.create({ imdbId: id, rating, comment, spoiler })
      toast.success('Review saved')
      setShowForm(false)
      loadReviews()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review')
    }
  }

  const removeReview = async (review) => {
    try {
      await reviewsAPI.remove(review.id)
      toast.success('Review deleted')
      loadReviews()
    } catch {
      toast.error('Could not delete review')
    }
  }

  const likeReview = async (review) => {
    try {
      const res = review.likedByMe ? await reviewsAPI.unlike(review.id) : await reviewsAPI.like(review.id)
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, ...res.data } : r)))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update like')
    }
  }

  if (loading) return <Spinner />
  if (error || !movie) return <ErrorState message={error || 'Movie not found.'} onRetry={loadMovie} />

  const poster = present(movie.Poster) ? movie.Poster : null
  const facts = [
    ['Director', movie.Director],
    ['Writer', movie.Writer],
    ['Cast', movie.Actors],
    ['Language', movie.Language],
    ['Country', movie.Country],
    ['Released', movie.Released],
    ['Box office', movie.BoxOffice],
    ['Awards', movie.Awards],
    ['Production', movie.Production],
  ].filter(([, value]) => present(value))

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <FontAwesomeIcon icon={faArrowLeft} /> Back
      </button>

      <section className="relative isolate overflow-hidden rounded-card border border-line bg-surface">
        {poster && <img src={poster} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-20 blur-2xl" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-surface via-surface/70 to-surface/30" />

        <div className="flex flex-col gap-8 p-5 sm:p-8 md:flex-row">
          <div className="mx-auto w-48 shrink-0 sm:w-60 md:mx-0 md:w-72">
            <div className="aspect-[2/3] overflow-hidden rounded-card border border-line bg-elevated shadow-pop">
              {poster ? <img src={poster} alt={movie.Title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center p-4 text-center text-muted">{movie.Title}</div>}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
              {movie.Type && <span className="rounded-full border border-line px-2.5 py-1 uppercase">{movie.Type === 'series' ? 'Series' : 'Movie'}</span>}
              {present(movie.Year) && <span>{movie.Year}</span>}
              {present(movie.Rated) && movie.Rated !== 'Not Rated' && <span className="rounded border border-line px-1.5 py-0.5">{movie.Rated}</span>}
              {present(movie.Runtime) && <span>{movie.Runtime}</span>}
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{movie.Title}</h1>

            {present(movie.Genre) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {movie.Genre.split(',').map((g) => (
                  <span key={g} className="rounded-full bg-elevated px-3 py-1 text-xs font-medium text-ink/90">{g.trim()}</span>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-6">
              {present(movie.imdbRating) && (
                <div>
                  <Rating value={movie.imdbRating} className="text-2xl font-bold" />
                  <span className="ml-1 text-sm text-muted">/ 10</span>
                  {present(movie.imdbVotes) && <p className="text-xs text-muted">{movie.imdbVotes} votes</p>}
                </div>
              )}
              {averageRating > 0 && (
                <div>
                  <Stars value={Math.round(averageRating)} />
                  <p className="mt-1 text-xs text-muted">{averageRating.toFixed(1)} from Minimus users</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {STATE_BUTTONS.map(({ kind, label, on, off, active }) => {
                const isOn = has(kind, id)
                return (
                  <button key={kind} onClick={() => toggle(kind, id)} aria-pressed={isOn} className={cx('btn-ghost', isOn && 'border-amber/40')}>
                    <FontAwesomeIcon icon={isOn ? on : off} className={isOn ? active : ''} />
                    {isOn ? `${label}` : label}
                  </button>
                )
              })}
              <button onClick={openForm} className="btn-primary">
                <FontAwesomeIcon icon={faPen} /> {mine ? 'Edit your review' : 'Write a review'}
              </button>
            </div>

            {present(movie.Plot) && <p className="mt-6 max-w-3xl leading-relaxed text-ink/85">{movie.Plot}</p>}
          </div>
        </div>
      </section>

      {facts.length > 0 && (
        <section className="card mt-6 p-5 sm:p-6">
          <SectionHeader title="Details" />
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
                <dd className="mt-1 text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-10">
        <SectionHeader title="Reviews" subtitle={reviews.length ? `${reviews.length} from the community` : undefined} />

        {showForm && (
          <form onSubmit={submitReview} className="card mb-6 space-y-4 p-5 animate-fade-in">
            <div>
              <p className="mb-2 text-sm font-medium">Your rating</p>
              <Stars value={rating} onChange={setRating} size="text-2xl" />
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} maxLength={2000} placeholder="What did you think? (optional)" className="field resize-y" />
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} className="accent-amber" />
              This review contains spoilers
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Save review</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        )}

        {reviews.length > 1 && (
          <div className="mb-5 flex gap-2">
            {[['recent', 'Newest'], ['helpful', 'Most helpful'], ['rating', 'Highest rated']].map(([value, label]) => (
              <Chip key={value} active={sort === value} onClick={() => setSort(value)}>{label}</Chip>
            ))}
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted">No reviews yet. Be the first to share what you think.</div>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-sm font-semibold">{review.user.name.charAt(0).toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{review.user.name}</p>
                      <p className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Stars value={review.rating} size="text-sm" />
                </div>

                {review.comment &&
                  (review.spoiler && !revealed[review.id] ? (
                    <button onClick={() => setRevealed((p) => ({ ...p, [review.id]: true }))} className="mt-3 text-sm text-ember underline">
                      Contains spoilers, click to reveal
                    </button>
                  ) : (
                    <p className="mt-3 text-sm leading-relaxed text-ink/85">{review.comment}</p>
                  ))}

                <div className="mt-3 flex items-center gap-4 text-sm">
                  <button onClick={() => likeReview(review)} aria-pressed={review.likedByMe} className={cx('flex items-center gap-1.5 transition-colors', review.likedByMe ? 'text-amber' : 'text-muted hover:text-ink')}>
                    <FontAwesomeIcon icon={faThumbsUp} /> Helpful · {review.likeCount}
                  </button>
                  {review.user.id === user?.id && (
                    <button onClick={() => removeReview(review)} className="flex items-center gap-1.5 text-muted transition-colors hover:text-ember">
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default MovieDetail
