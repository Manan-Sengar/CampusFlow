import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  Layers3,
  UserRoundSearch,
} from 'lucide-react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { ApiError, getErrorMessage } from '../api/http.ts'
import {
  getRecruitmentDrive,
  recruitmentQueryKeys,
} from '../api/recruitment.ts'
import type { ClubOutletContext } from '../api/types.ts'
import { ApplicationReviewPanel } from '../components/recruitment/ApplicationReviewPanel.tsx'
import { DriveStatusActions } from '../components/recruitment/DriveStatusActions.tsx'
import { RecruitmentDriveStatusBadge } from '../components/recruitment/RecruitmentBadges.tsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatePanel.tsx'
import { formatEventDateRange } from '../utils/formatDate.ts'
import { getDriveWindowLabel } from '../utils/recruitment.ts'

export function RecruitmentDrivePage() {
  const { club } = useOutletContext<ClubOutletContext>()
  const { driveId = '' } = useParams()
  const isAdmin = club.role === 'ADMIN'
  const contextQuery = useQuery({
    queryKey: recruitmentQueryKeys.context(club.clubId, driveId),
    queryFn: () => getRecruitmentDrive(club.clubId, driveId),
    enabled: Boolean(driveId),
  })

  if (contextQuery.isPending) {
    return <LoadingState label="Loading recruitment drive…" />
  }

  if (contextQuery.isError) {
    const isUnavailable =
      contextQuery.error instanceof ApiError &&
      (contextQuery.error.status === 404 ||
        contextQuery.error.code === 'INVALID_RECRUITMENT_DRIVE_ID')

    if (isUnavailable) {
      return (
        <EmptyState
          icon={UserRoundSearch}
          title="Recruitment drive unavailable"
          description="This drive doesn’t exist or is not visible to your current club role."
        >
          <Link className="button button--primary" to={`/clubs/${club.clubId}/recruitment`}>
            <ArrowLeft size={17} aria-hidden="true" />
            Back to recruitment
          </Link>
        </EmptyState>
      )
    }

    return (
      <ErrorState
        title="Recruitment drive couldn’t be loaded"
        description={getErrorMessage(contextQuery.error)}
        onRetry={() => void contextQuery.refetch()}
      />
    )
  }

  const { drive, teams } = contextQuery.data
  const hasApplicantView = drive.status === 'OPEN' || drive.status === 'CLOSED'

  return (
    <div className="recruitment-detail-page">
      <Link className="workspace-back-link" to={`/clubs/${club.clubId}/recruitment`}>
        <ArrowLeft size={16} aria-hidden="true" />
        All recruitment drives
      </Link>

      <article className="recruitment-detail-hero">
        <div className="recruitment-detail-hero__badges">
          <RecruitmentDriveStatusBadge status={drive.status} />
          <span className="recruitment-window-label">{getDriveWindowLabel(drive)}</span>
        </div>
        <h1>{drive.title}</h1>
        <p>{drive.description || 'No recruitment description has been added.'}</p>

        <dl className="recruitment-detail-meta">
          <div>
            <CalendarClock size={19} aria-hidden="true" />
            <dt>Application window</dt>
            <dd>{formatEventDateRange(drive.opensAt, drive.closesAt)}</dd>
          </div>
          <div>
            <Layers3 size={19} aria-hidden="true" />
            <dt>Available teams</dt>
            <dd>{teams.length} active {teams.length === 1 ? 'team' : 'teams'}</dd>
          </div>
        </dl>

        {hasApplicantView ? (
          <Link className="button button--ghost" to={`/apply/${club.clubId}/${drive.id}`}>
            <ExternalLink size={16} aria-hidden="true" />
            Open applicant page
          </Link>
        ) : null}
      </article>

      {isAdmin ? (
        <section className="event-section" aria-labelledby="drive-status-title">
          <div className="event-section__heading">
            <div>
              <p className="eyebrow">Drive workflow</p>
              <h2 id="drive-status-title">Status controls</h2>
              <p>Open the drive when applications begin, or close it when recruitment ends.</p>
            </div>
          </div>
          <DriveStatusActions clubId={club.clubId} drive={drive} />
        </section>
      ) : null}

      <section className="event-section" aria-labelledby="drive-teams-title">
        <div className="event-section__heading">
          <div>
            <p className="eyebrow">Applicant choices</p>
            <h2 id="drive-teams-title">Active teams</h2>
            <p>Applicants can rank these teams in their preferred order.</p>
          </div>
          <span className="section-count">{teams.length}</span>
        </div>
        {teams.length > 0 ? (
          <div className="recruitment-team-list">
            {teams.map((team) => (
              <article key={team.id}>
                <h3>{team.name}</h3>
                <p>{team.description || 'No team description has been added.'}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="section-empty">
            <Layers3 size={18} aria-hidden="true" />
            <p>No active teams are available for preferences.</p>
          </div>
        )}
      </section>

      {isAdmin ? <ApplicationReviewPanel clubId={club.clubId} driveId={drive.id} /> : null}
    </div>
  )
}
