import { CheckCircle2 } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Brand } from '../components/ui/Brand.tsx'

const highlights = [
  'One account across every club',
  'Clear roles and responsibilities',
  'Events and recruitment in one flow',
]

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <section className="auth-story" aria-label="About CampusFlow">
        <Brand inverse />

        <div className="auth-story__content">
          <p className="eyebrow eyebrow--light">Built for student organizations</p>
          <h1>Good club work should feel organized from day one.</h1>
          <p className="auth-story__intro">
            CampusFlow gives campus teams one focused place to coordinate people,
            events, and opportunities.
          </p>

          <ul className="auth-highlights">
            {highlights.map((highlight) => (
              <li key={highlight}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-story__footer">A simpler operating system for campus life.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__mobile-brand">
          <Brand />
        </div>
        <Outlet />
      </section>
    </main>
  )
}
