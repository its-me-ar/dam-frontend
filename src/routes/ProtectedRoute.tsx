import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export function RoleGuard({ allowed, redirectTo = '/' }: { allowed: Role[]; redirectTo?: string }) {
  const { role } = useAuth()
  if (!role || !allowed.includes(role)) {
    return <Navigate to={redirectTo} replace />
  }
  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}


