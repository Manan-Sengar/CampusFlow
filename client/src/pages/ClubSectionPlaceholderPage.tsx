import { CalendarDays, Network, UserPlus, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import type { ClubOutletContext } from '../api/types.ts'

type ClubSection = 'members' | 'teams' | 'events' | 'recruitment'

const sectionContent: Record<
  ClubSection,
  { title: string; eyebrow: string; description: string; icon: LucideIcon }
> = {
  members: {
    title: 'Member management is coming next',
    eyebrow: 'Members',
    description: 'The next frontend milestone will bring the club roster and role-aware member tools here.',
    icon: UsersRound,
  },
  teams: {
    title: 'Team management is coming next',
    eyebrow: 'Teams',
    description: 'Configurable teams, primary assignments, and team leads will live in this workspace.',
    icon: Network,
  },
  events: {
    title: 'Event management is coming soon',
    eyebrow: 'Events',
    description: 'Event planning, approval, assignments, and attendance will be added in a later milestone.',
    icon: CalendarDays,
  },
  recruitment: {
    title: 'Recruitment is coming soon',
    eyebrow: 'Recruitment',
    description: 'Recruitment drives, applications, and review workflows will be added in a later milestone.',
    icon: UserPlus,
  },
}

export function ClubSectionPlaceholderPage({ section }: { section: ClubSection }) {
  const { club } = useOutletContext<ClubOutletContext>()
  const content = sectionContent[section]
  const Icon = content.icon

  return (
    <section className="feature-placeholder">
      <span className="feature-placeholder__icon" aria-hidden="true">
        <Icon size={27} />
      </span>
      <p className="eyebrow">{content.eyebrow}</p>
      <h2>{content.title}</h2>
      <p>
        {content.description} You’re viewing the planned section for {club.clubName}.
      </p>
    </section>
  )
}
