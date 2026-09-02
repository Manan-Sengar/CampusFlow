import { LoaderCircle, RefreshCw } from 'lucide-react'
import { Brand } from './Brand.tsx'

export function SessionLoader() {
  return (
    <main className="session-state" aria-busy="true" aria-label="Loading your session">
      <Brand linked={false} />
      <LoaderCircle className="spin session-state__spinner" size={24} aria-hidden="true" />
      <p>Opening your workspace…</p>
    </main>
  )
}

interface SessionErrorProps {
  onRetry: () => void
}

export function SessionError({ onRetry }: SessionErrorProps) {
  return (
    <main className="session-state">
      <Brand linked={false} />
      <div className="session-state__message" role="alert">
        <h1>We couldn’t reach CampusFlow</h1>
        <p>Check your connection, then try again.</p>
      </div>
      <button className="button button--primary" type="button" onClick={onRetry}>
        <RefreshCw size={17} aria-hidden="true" />
        Try again
      </button>
    </main>
  )
}
