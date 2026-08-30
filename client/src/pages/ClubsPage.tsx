import { Building2, CheckCircle2, Sparkles } from 'lucide-react'
import { useCurrentUser } from '../auth/useCurrentUser.ts'

export function ClubsPage() {
  const { data: user } = useCurrentUser()
  const firstName = user?.name.trim().split(/\s+/)[0] || 'there'

  return (
    <section className="clubs-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>Welcome back, {firstName}.</h1>
          <p>Your CampusFlow account is connected and ready for your clubs.</p>
        </div>
        <div className="connection-badge">
          <CheckCircle2 size={17} aria-hidden="true" />
          Session active
        </div>
      </div>

      <div className="dashboard-placeholder">
        <div className="dashboard-placeholder__icon" aria-hidden="true">
          <Building2 size={28} />
        </div>
        <div className="dashboard-placeholder__content">
          <div className="dashboard-placeholder__label">
            <Sparkles size={15} aria-hidden="true" />
            Foundation complete
          </div>
          <h2>Your club dashboard is the next step.</h2>
          <p>
            Club memberships and management tools will appear here in the next
            milestone. No placeholder data has been added.
          </p>
        </div>
      </div>
    </section>
  )
}
