import type { ApplicationStatus, RecruitmentDriveStatus } from '../../api/types.ts'

const driveLabels: Record<RecruitmentDriveStatus, string> = {
  DRAFT: 'Draft',
  OPEN: 'Open',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
}

const applicationLabels: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  SHORTLISTED: 'Shortlisted',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
}

export function RecruitmentDriveStatusBadge({ status }: { status: RecruitmentDriveStatus }) {
  return (
    <span className={`badge recruitment-badge recruitment-badge--${status.toLowerCase()}`}>
      <span className="badge__dot" aria-hidden="true" />
      {driveLabels[status]}
    </span>
  )
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`badge application-badge application-badge--${status.toLowerCase()}`}>
      <span className="badge__dot" aria-hidden="true" />
      {applicationLabels[status]}
    </span>
  )
}
