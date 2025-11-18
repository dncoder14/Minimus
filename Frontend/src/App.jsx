import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Movies from './pages/Movies'
import Series from './pages/Series'
import Search from './pages/Search'
import MovieDetail from './pages/MovieDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        // Verify token is still valid by making API call
        import('./services/api').then(({ authAPI }) => {
          authAPI.getProfile()
            .then(response => {
              setUser(response.data.user)
            })
            .catch(() => {
              // Token invalid, clear storage
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            })
            .finally(() => setLoading(false))
        })
        return
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-electric-blue text-xl font-serif">Loading...</div>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId="637148170835-9gffvr77r5o2a4vhqs7e7kn46g19k6fe.apps.googleusercontent.com">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1f2937', color: '#fff', border: '1px solid rgba(14, 165, 233, 0.3)' }, success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
      <Router>
        <div className="min-h-screen text-cinematic-text relative" style={{ background: 'linear-gradient(180deg, #0A1B2F 0%, #05080E 100%)' }}>
          <Navbar user={user} setUser={setUser} />
          <main className="relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/signup" element={<Signup setUser={setUser} />} />
              <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
              <Route path="/movies" element={<ProtectedRoute user={user}><Movies /></ProtectedRoute>} />
              <Route path="/series" element={<ProtectedRoute user={user}><Series /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute user={user}><Search /></ProtectedRoute>} />
              <Route path="/movie/:id" element={<ProtectedRoute user={user}><MovieDetail /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute user={user}><Profile user={user} /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App