import { Building2, CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state-panel state-panel--loading" aria-busy="true" aria-label={label}>
      <LoaderCircle className="spin" size={25} aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description: string
  onRetry: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="state-panel" role="alert">
      <span className="state-panel__icon state-panel__icon--danger" aria-hidden="true">
        <CircleAlert size={25} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="button button--ghost" type="button" onClick={onRetry}>
        <RefreshCw size={17} aria-hidden="true" />
        Try again
      </button>
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  icon?: LucideIcon
  children?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  icon: Icon = Building2,
  children,
}: EmptyStateProps) {
  return (
    <div className="state-panel">
      <span className="state-panel__icon" aria-hidden="true">
        <Icon size={26} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  )
}
