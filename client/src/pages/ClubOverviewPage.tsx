import { Activity, BadgeCheck, GraduationCap, ShieldCheck } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import type { ClubOutletContext, ClubRole } from '../api/types.ts'
import { ClubRoleBadge, StatusBadge } from '../components/ui/ClubBadges.tsx'

const accessDescriptions: Record<ClubRole, string> = {
  ADMIN: 'You have administrative access to this club workspace.',
  LEAD: 'You have lead access to coordinate club work and events.',
  MEMBER: 'You have member access to this club workspace.',
}

export function ClubOverviewPage() {
  const { club } = useOutletContext<ClubOutletContext>()

  return (
    <div className="club-overview">
      <section className="overview-card overview-card--about">
        <p className="eyebrow">Club overview</p>
        <h2>About {club.clubName}</h2>
        <p>{club.clubDescription || 'This club has not added a description yet.'}</p>
      </section>

      <section className="overview-card" aria-labelledby="workspace-details-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Workspace details</p>
            <h2 id="workspace-details-title">Your access at a glance</h2>
          </div>
          <p>{accessDescriptions[club.role]}</p>
        </div>

        <dl className="detail-grid">
          <div className="detail-item">
            <span className="detail-item__icon" aria-hidden="true">
              <GraduationCap size={19} />
            </span>
            <dt>Campus</dt>
            <dd>{club.campusName}</dd>
          </div>
          <div className="detail-item">
            <span className="detail-item__icon" aria-hidden="true">
              <ShieldCheck size={19} />
            </span>
            <dt>Your role</dt>
            <dd>
              <ClubRoleBadge role={club.role} />
            </dd>
          </div>
          <div className="detail-item">
            <span className="detail-item__icon" aria-hidden="true">
              <BadgeCheck size={19} />
            </span>
            <dt>Membership</dt>
            <dd>
              <StatusBadge status={club.membershipStatus} />
            </dd>
          </div>
          <div className="detail-item">
            <span className="detail-item__icon" aria-hidden="true">
              <Activity size={19} />
            </span>
            <dt>Club status</dt>
            <dd>
              <StatusBadge status={club.clubStatus} />
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
