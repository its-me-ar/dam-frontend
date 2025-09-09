import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { setAuthToken } from '../lib/api'

export type Role = 'ADMIN' | 'USER' | 'MANAGER'

type AuthContextValue = {
  token: string | null
  isAuthenticated: boolean
  role: Role | null
  userId: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))
  const [role, setRole] = useState<Role | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setAuthToken(token)
    if (token) {
      localStorage.setItem('auth_token', token)
      // decode role from JWT payload (assumes { role: "ADMIN" | "USER" | "MANAGER" })
      try {
        const payload = jwtDecode<{ role?: string; roles?: string[]; userId?: string; sub?: string; id?: string; email?: string }>(token)
        const r: string | undefined = payload?.role ?? payload?.roles?.[0]
        if (r === 'ADMIN' || r === 'USER' || r === 'MANAGER') {
          setRole(r)
        } else {
          setRole(null)
        }
        setUserId(payload.userId || payload.sub || payload.id || null)

      } catch {
        setRole(null)
        setUserId(null)

      }
    } else {
      localStorage.removeItem('auth_token')
      setRole(null)
      setUserId(null)
    }
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      role,
      userId,
      login: (newToken: string) => setToken(newToken),
      logout: () => setToken(null),
    }),
    [token, role, userId]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


