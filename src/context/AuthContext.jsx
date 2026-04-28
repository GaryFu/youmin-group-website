import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { post as apiPost, put as apiPut, get as apiGet, setAuthToken, clearAuthToken } from '../lib/api'

const AUTH_KEY = 'youmin_admin_auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (!stored) {
      setLoading(false)
      return
    }

    try {
      const { token } = JSON.parse(stored)
      if (token) {
        setAuthToken(token)
        apiGet('/auth/me')
          .then((data) => setUser(data.user))
          .catch(() => {
            localStorage.removeItem(AUTH_KEY)
            clearAuthToken()
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    } catch {
      localStorage.removeItem(AUTH_KEY)
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (login, password) => {
    try {
      const data = await apiPost('/auth/login', { login, password })
      setAuthToken(data.token)
      setUser(data.user)
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token: data.token }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const logout = useCallback(() => {
    clearAuthToken()
    setUser(null)
    localStorage.removeItem(AUTH_KEY)
  }, [])

  const updateUser = useCallback(async (profileData) => {
    try {
      const data = await apiPut('/auth/profile', profileData)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
