import Browse from './Browse'
import { fromTmdbMovie } from '../lib/media'

const Movies = () => (
  <Browse kind="movie" title="Movies" subtitle="Browse by genre, year and rating" mapItem={fromTmdbMovie} />
)

export default Movies
