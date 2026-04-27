import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AUTH_KEY = 'youmin_admin_auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_KEY)
    }
  }, [user])

  const login = useCallback(async (email, password) => {
    // Simple auth: check against env var or default
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@youmingroup.com'
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'youmin2024'

    if (email === adminEmail && password === adminPassword) {
      const userData = { email, role: 'admin', loginAt: Date.now() }
      setUser(userData)
      return { success: true }
    }
    return { success: false, error: '邮箱或密码错误' }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
