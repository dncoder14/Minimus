import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

export const cx = (...parts) => parts.filter(Boolean).join(' ')

export const Rating = ({ value, className }) =>
  value ? (
    <span className={cx('inline-flex items-center gap-1 font-medium text-ink', className)}>
      <FontAwesomeIcon icon={faStar} className="text-[0.8em] text-amber" />
      {Number(value).toFixed(1)}
    </span>
  ) : null

// Rounded filter chip. `active` uses the amber accent.
export const Chip = ({ active, children, className, ...props }) => (
  <button
    type="button"
    className={cx(
      'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
      active
        ? 'border-amber bg-amber text-obsidian'
        : 'border-line bg-surface text-muted hover:border-muted/50 hover:text-ink',
      className
    )}
    {...props}
  >
    {children}
  </button>
)

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    {children}
  </div>
)

export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
    </div>
    {action}
  </div>
)

// Pages hold 18 titles (and the dashboard 12), so columns are 2, 3 and 6: all divide both counts
// and the last row is always full.
export const GRID = 'grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-6'

export const PosterSkeleton = ({ count = 12 }) => (
  <div className={GRID}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-[2/3] rounded-card bg-surface" />
        <div className="mt-3 h-3.5 w-3/4 rounded bg-surface" />
        <div className="mt-2 h-3 w-1/3 rounded bg-surface" />
      </div>
    ))}
  </div>
)

export const EmptyState = ({ icon, title, children }) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center">
    {icon && <FontAwesomeIcon icon={icon} className="mb-4 text-3xl text-muted/60" />}
    <p className="font-medium">{title}</p>
    {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
  </div>
)

export const ErrorState = ({ message = "We couldn't load this right now.", onRetry }) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center">
    <FontAwesomeIcon icon={faTriangleExclamation} className="mb-4 text-3xl text-ember" />
    <p className="font-medium">{message}</p>
    <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary mt-5">
        Try again
      </button>
    )}
  </div>
)

export const Spinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-amber" />
  </div>
)
