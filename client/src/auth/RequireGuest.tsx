import { Navigate, Outlet } from 'react-router-dom'
import { SessionError, SessionLoader } from '../components/ui/SessionState.tsx'
import { useCurrentUser } from './useCurrentUser.ts'

export function RequireGuest() {
  const { data: user, isPending, isError, refetch } = useCurrentUser()

  if (isPending) {
    return <SessionLoader />
  }

  if (isError) {
    return <SessionError onRetry={() => void refetch()} />
  }

  if (user) {
    return <Navigate to="/clubs" replace />
  }

  return <Outlet />
}
