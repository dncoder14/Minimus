import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, user }) => {
  const token = localStorage.getItem('token')
  if (!user && !token) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default ProtectedRoute
