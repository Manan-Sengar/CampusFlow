import { ArrowUpRight, CalendarClock, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { RecruitmentDrive } from '../../api/types.ts'
import { formatEventDateRange } from '../../utils/formatDate.ts'
import { getDriveWindowLabel } from '../../utils/recruitment.ts'
import { DriveStatusActions } from './DriveStatusActions.tsx'
import { RecruitmentDriveStatusBadge } from './RecruitmentBadges.tsx'

interface RecruitmentDriveCardProps {
  clubId: string
  drive: RecruitmentDrive
  isAdmin: boolean
}

export function RecruitmentDriveCard({ clubId, drive, isAdmin }: RecruitmentDriveCardProps) {
  const applicantViewAvailable = drive.status === 'OPEN' || drive.status === 'CLOSED'

  return (
    <article className="recruitment-card">
      <div className="recruitment-card__topline">
        <RecruitmentDriveStatusBadge status={drive.status} />
        <span className="recruitment-window-label">{getDriveWindowLabel(drive)}</span>
      </div>

      <div className="recruitment-card__body">
        <h2>
          <Link to={`/clubs/${clubId}/recruitment/${drive.id}`}>{drive.title}</Link>
        </h2>
        <p>{drive.description || 'No recruitment description has been added.'}</p>
      </div>

      <div className="recruitment-card__schedule">
        <CalendarClock size={18} aria-hidden="true" />
        <div>
          <span>Application window</span>
          <strong>{formatEventDateRange(drive.opensAt, drive.closesAt)}</strong>
        </div>
      </div>

      {isAdmin ? <DriveStatusActions clubId={clubId} drive={drive} compact /> : null}

      <div className="recruitment-card__footer">
        <Link className="recruitment-card__action" to={`/clubs/${clubId}/recruitment/${drive.id}`}>
          Manage drive
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
        {applicantViewAvailable ? (
          <Link className="recruitment-card__secondary" to={`/apply/${clubId}/${drive.id}`}>
            Applicant view
            <ExternalLink size={14} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </article>
  )
}
