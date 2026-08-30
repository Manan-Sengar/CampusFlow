import { ArrowUpRight, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ClubAccess } from '../../api/types.ts'
import { ClubRoleBadge, StatusBadge } from '../ui/ClubBadges.tsx'

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function ClubCard({ club }: { club: ClubAccess }) {
  return (
    <article className="club-card">
      <div className="club-card__topline">
        <span className="club-card__monogram" aria-hidden="true">
          {getInitials(club.clubName)}
        </span>
        <div className="club-card__badges">
          <ClubRoleBadge role={club.role} />
          <StatusBadge status={club.membershipStatus} />
        </div>
      </div>

      <div className="club-card__body">
        <h2>
          <Link to={`/clubs/${club.clubId}`}>{club.clubName}</Link>
        </h2>
        <p>{club.clubDescription || 'No club description has been added yet.'}</p>
      </div>

      <div className="club-card__footer">
        <span className="club-card__campus">
          <GraduationCap size={17} aria-hidden="true" />
          {club.campusName}
        </span>
        <Link className="club-card__action" to={`/clubs/${club.clubId}`}>
          Open workspace
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
