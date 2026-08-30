import { Calendar, Network } from 'lucide-react'
import type { ClubMember, ClubTeam } from '../../api/types.ts'
import { formatShortDate } from '../../utils/formatDate.ts'
import { StatusBadge } from '../ui/ClubBadges.tsx'
import { TeamLeadsPanel } from './TeamLeadsPanel.tsx'

interface TeamCardProps {
  clubId: string
  team: ClubTeam
  isAdmin: boolean
  activeMembers: ClubMember[]
  membersPending: boolean
  membersError: string | null
  onRetryMembers: () => void
}

export function TeamCard({
  clubId,
  team,
  isAdmin,
  activeMembers,
  membersPending,
  membersError,
  onRetryMembers,
}: TeamCardProps) {
  return (
    <article className="team-card">
      <header className="team-card__header">
        <span className="team-card__icon" aria-hidden="true">
          <Network size={22} />
        </span>
        <div className="team-card__identity">
          <h2>{team.name}</h2>
          <p>{team.description || 'No team description has been added.'}</p>
        </div>
        <StatusBadge status={team.status} />
      </header>

      <p className="team-card__created">
        <Calendar size={15} aria-hidden="true" />
        Created {formatShortDate(team.createdAt)}
      </p>

      <TeamLeadsPanel
        clubId={clubId}
        team={team}
        isAdmin={isAdmin}
        activeMembers={activeMembers}
        membersPending={membersPending}
        membersError={membersError}
        onRetryMembers={onRetryMembers}
      />
    </article>
  )
}
