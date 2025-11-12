'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  address?: string
  referralCode?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await axios.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      } catch (error: any) {
        console.error('Auth check failed:', error.response?.status, error.response?.data)
        // Only clear auth if it's actually unauthorized (401)
        // Don't clear on network errors or server errors (500)
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        } else {
          // For other errors, try to use cached user data
          const cachedUser = localStorage.getItem('user')
          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser))
            } catch (e) {
              console.error('Failed to parse cached user')
            }
          }
        }
      }
    }
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password })
    localStorage.setItem('token', response.data.token)
    setUser(response.data.user)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    router.push('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await axios.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      } catch (error) {
        console.error('Failed to refresh user', error)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Fallback to avoid runtime crash when provider is not mounted
    // This ensures pages can still render and handle auth via localStorage checks
    return {
      user: null,
      loading: false,
      login: async () => {},
      logout: () => {},
      refreshUser: async () => {},
    } as AuthContextType
  }
  return context
}
