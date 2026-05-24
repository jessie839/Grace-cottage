'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  user: { username: string } | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      const userData = JSON.parse(stored)
      setUser(userData)
      setIsLoggedIn(true)
    }
    setIsLoading(false)
  }, [])

  const login = (username: string, password: string) => {
    if (username === 'graceadmin' && password === 'grace123') {
      const userData = { username }
      setUser(userData)
      setIsLoggedIn(true)
      localStorage.setItem('user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
