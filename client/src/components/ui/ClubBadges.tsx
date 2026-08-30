import type { ClubRole, ClubStatus, MembershipStatus } from '../../api/types.ts'

const roleLabels: Record<ClubRole, string> = {
  ADMIN: 'Admin',
  LEAD: 'Lead',
  MEMBER: 'Member',
}

const statusLabels: Record<ClubStatus | MembershipStatus, string> = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
  INACTIVE: 'Inactive',
  ALUMNI: 'Alumni',
  REMOVED: 'Removed',
}

export function ClubRoleBadge({ role }: { role: ClubRole }) {
  return <span className={`badge badge--role badge--${role.toLowerCase()}`}>{roleLabels[role]}</span>
}

export function StatusBadge({ status }: { status: ClubStatus | MembershipStatus }) {
  return (
    <span className={`badge badge--status badge--${status.toLowerCase()}`}>
      <span className="badge__dot" aria-hidden="true" />
      {statusLabels[status]}
    </span>
  )
}
