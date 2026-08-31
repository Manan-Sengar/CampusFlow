import { UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import type { ClubOutletContext } from '../api/types.ts'

type ClubSection = 'recruitment'

const sectionContent: Record<
  ClubSection,
  { title: string; eyebrow: string; description: string; icon: LucideIcon }
> = {
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
