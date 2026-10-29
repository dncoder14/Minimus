import Browse from './Browse'
import { fromTmdbTv } from '../lib/media'

const Series = () => (
  <Browse kind="tv" title="Series" subtitle="Find your next binge" mapItem={fromTmdbTv} />
)

export default Series
