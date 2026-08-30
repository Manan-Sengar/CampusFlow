import { Navigate } from 'react-router-dom'
import { SessionError, SessionLoader } from '../components/ui/SessionState.tsx'
import { useCurrentUser } from './useCurrentUser.ts'

export function HomeRedirect() {
  const { data: user, isPending, isError, refetch } = useCurrentUser()

  if (isPending) {
    return <SessionLoader />
  }

  if (isError) {
    return <SessionError onRetry={() => void refetch()} />
  }

  return <Navigate to={user ? '/clubs' : '/login'} replace />
}
