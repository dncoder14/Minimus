import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import { Spinner } from './components/ui'
import { LibraryProvider } from './context/LibraryContext'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Movies from './pages/Movies'
import Series from './pages/Series'
import Search from './pages/Search'
import MovieDetail from './pages/MovieDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Community from './pages/Community'

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || '637148170835-9gffvr77r5o2a4vhqs7e7kn46g19k6fe.apps.googleusercontent.com'

const toastOptions = {
  duration: 3000,
  style: {
    background: '#1D1D26',
    color: '#F4F4F5',
    border: '1px solid #292932',
    borderRadius: '10px',
    fontSize: '14px',
  },
  success: { iconTheme: { primary: '#FFC247', secondary: '#0B0B0F' } },
  error: { iconTheme: { primary: '#F97316', secondary: '#0B0B0F' } },
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore the session and confirm the token is still valid
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    import('./services/api').then(({ authAPI }) => {
      authAPI
        .getProfile()
        .then((response) => setUser(response.data.user))
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        })
        .finally(() => setLoading(false))
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian">
        <Spinner />
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Toaster position="top-right" toastOptions={toastOptions} />
      <Router>
        <LibraryProvider user={user}>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup setUser={setUser} />} />

            <Route
              element={
                <ProtectedRoute user={user}>
                  <AppShell user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/series" element={<Series />} />
              <Route path="/search" element={<Search />} />
              <Route path="/movie/:id" element={<MovieDetail user={user} />} />
              <Route path="/profile" element={<Profile user={user} />} />
              <Route path="/community" element={<Community />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LibraryProvider>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
