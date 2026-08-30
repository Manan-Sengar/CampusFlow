import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../api/auth.ts'
import { getErrorMessage } from '../api/http.ts'
import { currentUserQueryKey, useCurrentUser } from '../auth/useCurrentUser.ts'
import { Brand } from '../components/ui/Brand.tsx'

export function AppShell() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user } = useCurrentUser()

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
      queryClient.setQueryData(currentUserQueryKey, null)
      navigate('/login', { replace: true })
    },
  })

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__inner">
          <Brand compact />

          <div className="account-menu">
            <div className="account-menu__identity">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button
              className="button button--ghost button--compact"
              type="button"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut size={16} aria-hidden="true" />
              <span>{logoutMutation.isPending ? 'Signing out…' : 'Log out'}</span>
            </button>
          </div>
        </div>

        {logoutMutation.isError ? (
          <p className="app-header__error" role="alert">
            {getErrorMessage(logoutMutation.error)}
          </p>
        ) : null}
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
