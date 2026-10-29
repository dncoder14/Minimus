import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import { TextField, PasswordField, Divider, ServerNotice } from '../components/AuthFields'
import useSlowServer from '../components/useSlowServer'

const validate = (data) => {
  const errors = {}
  if (!data.name.trim()) errors.name = 'Name is required'
  if (!data.email.trim()) errors.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email is invalid'
  if (!data.password) errors.password = 'Password is required'
  else if (data.password.length < 6) errors.password = 'Password must be at least 6 characters'
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

// Keep the Google button inside the form on narrow screens (24px page padding on each side)
const googleWidth = String(Math.min(384, window.innerWidth - 48))

const Signup = ({ setUser }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const notice = useSlowServer(loading)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name] || errors.general) setErrors({ ...errors, [e.target.name]: '', general: '' })
  }

  const finish = (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    navigate('/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(formData)
    setErrors(found)
    if (Object.keys(found).length) return

    setLoading(true)
    try {
      const { authAPI } = await import('../services/api')
      const { data } = await authAPI.register(formData)
      finish(data.user, data.token)
    } catch (err) {
      setErrors({ general: !err.response ? 'Unable to reach the server. Please check your connection or try again later.' : err.response.data?.error || 'Registration failed' })
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const { authAPI } = await import('../services/api')
      const { data } = await authAPI.googleAuth(credentialResponse.credential)
      toast.success('Account created successfully!')
      finish(data.user, data.token)
    } catch {
      toast.error('Google authentication failed')
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Track what you watch and get recommendations that fit."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-amber hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.general && <div role="alert" className="rounded-control border border-ember/40 bg-ember/10 px-3.5 py-2.5 text-sm text-ember">{errors.general}</div>}
        <TextField label="Name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Your name" />
        <TextField label="Email" name="email" type="email" autoComplete="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="you@example.com" />
        <PasswordField label="Password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} error={errors.password} placeholder="At least 6 characters" />
        <PasswordField label="Confirm password" name="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Repeat your password" />
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Create account'}</button>
        <ServerNotice message={notice} />
        <Divider />
        <div className="flex justify-center">
          <GoogleLogin text="signup_with" onSuccess={handleGoogleSuccess} onError={() => setErrors({ general: 'Google sign up failed' })} theme="filled_black" size="large" width={googleWidth} />
        </div>
      </form>
    </AuthLayout>
  )
}

export default Signup
