'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing token
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await res.json()
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    router.push('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
