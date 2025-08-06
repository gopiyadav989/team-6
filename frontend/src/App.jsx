import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import BusinessList from './components/BusinessList'
import BusinessDetail from './components/BusinessDetail'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      // Decode token to get user info (simple version)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ id: payload.userId, role: payload.role })
      } catch (error) {
        localStorage.removeItem('token')
        setToken(null)
      }
    }
  }, [token])

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold">ReviewApp</Link>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <span>Welcome, {user.role}</span>
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" className="text-blue-600 hover:text-blue-800">Admin</Link>
                    )}
                    <button onClick={logout} className="text-red-600 hover:text-red-800">Logout</button>
                  </>
                ) : (
                  <Link to="/login" className="text-blue-600 hover:text-blue-800">Login</Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<BusinessList user={user} token={token} />} />
          <Route path="/business/:id" element={<BusinessDetail user={user} token={token} />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route
            path="/admin"
            element={user?.role === 'ADMIN' ? <AdminDashboard token={token} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
