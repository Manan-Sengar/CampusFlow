import type {
  AttendanceStatus,
  EventAssignmentStatus,
  EventAssignmentType,
  EventStatus,
  EventVisibility,
} from '../../api/types.ts'

const eventStatusLabels: Record<EventStatus, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending approval',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const assignmentStatusLabels: Record<EventAssignmentStatus, string> = {
  PENDING: 'Awaiting response',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={`badge event-status event-status--${status.toLowerCase()}`}>
      <span className="badge__dot" aria-hidden="true" />
      {eventStatusLabels[status]}
    </span>
  )
}

export function EventVisibilityBadge({ visibility }: { visibility: EventVisibility }) {
  return (
    <span className={`badge event-visibility event-visibility--${visibility.toLowerCase()}`}>
      {visibility === 'PUBLIC' ? 'Public' : 'Club only'}
    </span>
  )
}

export function AssignmentStatusBadge({ status }: { status: EventAssignmentStatus }) {
  return (
    <span className={`badge assignment-status assignment-status--${status.toLowerCase()}`}>
      {assignmentStatusLabels[status]}
    </span>
  )
}

export function AssignmentTypeBadge({ type }: { type: EventAssignmentType }) {
  return (
    <span className="badge assignment-type">
      {type === 'COORDINATOR' ? 'Coordinator' : 'Volunteer'}
    </span>
  )
}

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span className={`badge attendance-status attendance-status--${status.toLowerCase()}`}>
      <span className="badge__dot" aria-hidden="true" />
      {status === 'PRESENT' ? 'Present' : 'Absent'}
    </span>
  )
}
