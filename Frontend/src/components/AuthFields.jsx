import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

export const TextField = ({ label, error, ...props }) => (
  <div>
    <label htmlFor={props.name} className="mb-1.5 block text-sm font-medium">{label}</label>
    <input id={props.name} className={`field ${error ? 'border-ember' : ''}`} aria-invalid={!!error} {...props} />
    {error && <p className="mt-1 text-xs text-ember">{error}</p>}
  </div>
)

export const PasswordField = ({ label, error, ...props }) => {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label htmlFor={props.name} className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input id={props.name} type={show ? 'text' : 'password'} className={`field pr-11 ${error ? 'border-ember' : ''}`} aria-invalid={!!error} {...props} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-ember">{error}</p>}
    </div>
  )
}

export const Divider = () => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line" /></div>
    <div className="relative flex justify-center text-xs"><span className="bg-obsidian px-3 text-muted">or continue with</span></div>
  </div>
)

export const ServerNotice = ({ message }) =>
  message === 'slow' ? (
    <p className="text-center text-sm text-muted">Free hosting takes a moment to start up. Please wait...</p>
  ) : message === 'timeout' ? (
    <p className="text-center text-sm text-ember">Server seems unavailable. Please try again after some time.</p>
  ) : null
