import { Link } from 'react-router-dom'

// Split layout for login and signup: form on the left, brand panel on the right (desktop only).
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-screen bg-obsidian lg:grid-cols-2">
    <div className="flex flex-col px-6 py-8 sm:px-12">
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
        <span className="text-lg font-bold tracking-tight">Minimus</span>
      </Link>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        <p className="mb-8 mt-2 text-sm text-muted">{subtitle}</p>
        {children}
        <p className="mt-8 text-center text-sm text-muted">{footer}</p>
      </div>
    </div>

    <div className="relative hidden overflow-hidden border-l border-line bg-surface lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,194,71,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.10),transparent_55%)]" />
      <div className="relative flex h-full flex-col justify-end p-14">
        <p className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">Every film you love, in one quiet place.</p>
        <p className="mt-4 max-w-md text-muted">Track what you watch, rate it, and get recommendations that actually fit your taste.</p>
      </div>
    </div>
  </div>
)

export default AuthLayout
