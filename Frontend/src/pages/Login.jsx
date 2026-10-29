import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { TextField, PasswordField, Divider, ServerNotice } from '../components/AuthFields'
import useSlowServer from '../components/useSlowServer'

// Keep the Google button inside the form on narrow screens (24px page padding on each side)
const googleWidth = String(Math.min(384, window.innerWidth - 48))

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const notice = useSlowServer(loading)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const finish = (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    navigate('/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { authAPI } = await import('../services/api')
      const { data } = await authAPI.login(formData)
      finish(data.user, data.token)
    } catch (err) {
      setError(!err.response ? 'Unable to reach the server. Please check your connection or try again later.' : err.response.data?.error || 'Login failed')
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const { authAPI } = await import('../services/api')
      const { data } = await authAPI.googleAuth(credentialResponse.credential)
      toast.success('Login successful!')
      finish(data.user, data.token)
    } catch {
      toast.error('Google authentication failed')
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={<>New to Minimus? <Link to="/signup" className="font-medium text-amber hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-control border border-ember/40 bg-ember/10 px-3.5 py-2.5 text-sm text-ember">{error}</div>}
        <TextField label="Email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" />
        <PasswordField label="Password" name="password" autoComplete="current-password" required value={formData.password} onChange={handleChange} placeholder="Your password" />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Sign in'}</button>
        <ServerNotice message={notice} />
        <Divider />
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google login failed')} theme="filled_black" size="large" width={googleWidth} />
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login
