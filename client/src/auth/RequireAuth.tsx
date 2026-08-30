import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { SessionError, SessionLoader } from '../components/ui/SessionState.tsx'
import { useCurrentUser } from './useCurrentUser.ts'

export function RequireAuth() {
  const location = useLocation()
  const { data: user, isPending, isError, refetch } = useCurrentUser()

  if (isPending) {
    return <SessionLoader />
  }

  if (isError) {
    return <SessionError onRetry={() => void refetch()} />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
