import { CalendarDays, LayoutDashboard, Network, UserPlus, UsersRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { label: 'Overview', path: '', icon: LayoutDashboard, end: true },
  { label: 'Members', path: 'members', icon: UsersRound },
  { label: 'Teams', path: 'teams', icon: Network },
  { label: 'Events', path: 'events', icon: CalendarDays },
  { label: 'Recruitment', path: 'recruitment', icon: UserPlus },
]

export function ClubNav({ clubId }: { clubId: string }) {
  return (
    <nav className="club-nav" aria-label="Club workspace">
      <div className="club-nav__track">
        {items.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={label}
            className={({ isActive }) => `club-nav__link${isActive ? ' is-active' : ''}`}
            end={end}
            to={path ? `/clubs/${clubId}/${path}` : `/clubs/${clubId}`}
          >
            <Icon size={17} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
