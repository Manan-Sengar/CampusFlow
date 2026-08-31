import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileLock2,
  Layers3,
  UserRoundSearch,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, getErrorMessage } from '../api/http.ts'
import {
  getMyApplication,
  getRecruitmentDrive,
  recruitmentQueryKeys,
} from '../api/recruitment.ts'
import { ApplicationForm } from '../components/recruitment/ApplicationForm.tsx'
import { MyApplicationSummary } from '../components/recruitment/MyApplicationSummary.tsx'
import { RecruitmentDriveStatusBadge } from '../components/recruitment/RecruitmentBadges.tsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatePanel.tsx'
import { formatEventDateRange } from '../utils/formatDate.ts'
import { getDriveWindowLabel, isDriveAcceptingApplications } from '../utils/recruitment.ts'

export function ApplyPage() {
  const { clubId = '', driveId = '' } = useParams()
  const [isEditing, setIsEditing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const contextQuery = useQuery({
    queryKey: recruitmentQueryKeys.context(clubId, driveId),
    queryFn: () => getRecruitmentDrive(clubId, driveId),
    enabled: Boolean(clubId && driveId),
  })
  const applicationQuery = useQuery({
    queryKey: recruitmentQueryKeys.myApplication(clubId, driveId),
    queryFn: () => getMyApplication(clubId, driveId),
    enabled: Boolean(clubId && driveId) && contextQuery.isSuccess,
  })

  if (contextQuery.isPending) {
    return <LoadingState label="Opening application…" />
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
          title="Application unavailable"
          description="This recruitment drive does not exist or is not currently visible to your account."
        >
          <Link className="button button--primary" to="/clubs">
            <ArrowLeft size={17} aria-hidden="true" />
            Back to My Clubs
          </Link>
        </EmptyState>
      )
    }

    return (
      <ErrorState
        title="The application couldn’t be opened"
        description={getErrorMessage(contextQuery.error)}
        onRetry={() => void contextQuery.refetch()}
      />
    )
  }

  const { club, drive, teams } = contextQuery.data
  const canApplyOrEdit = isDriveAcceptingApplications(drive)

  return (
    <div className="applicant-page">
      <Link className="workspace-back-link" to="/clubs">
        <ArrowLeft size={16} aria-hidden="true" />
        My Clubs
      </Link>

      <header className="applicant-hero">
        <p className="eyebrow">{club.name} recruitment</p>
        {club.description ? <p className="applicant-hero__club-copy">{club.description}</p> : null}
        <div className="applicant-hero__title-row">
          <div>
            <h1>{drive.title}</h1>
            <p>{drive.description || `Apply to join ${club.name}.`}</p>
          </div>
          <RecruitmentDriveStatusBadge status={drive.status} />
        </div>
        <dl>
          <div>
            <CalendarClock size={18} aria-hidden="true" />
            <dt>Application window</dt>
            <dd>{formatEventDateRange(drive.opensAt, drive.closesAt)}</dd>
          </div>
          <div>
            <Layers3 size={18} aria-hidden="true" />
            <dt>Team preferences</dt>
            <dd>{teams.length} active {teams.length === 1 ? 'team' : 'teams'} available</dd>
          </div>
        </dl>
      </header>

      {feedback ? (
        <p className="applicant-feedback" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          {feedback}
        </p>
      ) : null}

      {applicationQuery.isPending ? <LoadingState label="Checking your application…" /> : null}
      {applicationQuery.isError ? (
        <ErrorState
          title="Your application couldn’t be loaded"
          description={getErrorMessage(applicationQuery.error)}
          onRetry={() => void applicationQuery.refetch()}
        />
      ) : null}

      {applicationQuery.isSuccess && applicationQuery.data ? (
        <>
          {isEditing && canApplyOrEdit ? (
            <section className="application-workspace" aria-labelledby="edit-application-title">
              <div className="application-workspace__heading">
                <div>
                  <p className="eyebrow">Application window is open</p>
                  <h2 id="edit-application-title">Edit your application</h2>
                  <p>Update your answers or reorder team preferences before the window closes.</p>
                </div>
                <button className="button button--ghost" type="button" onClick={() => setIsEditing(false)}>
                  Cancel editing
                </button>
              </div>
              <ApplicationForm
                clubId={clubId}
                driveId={driveId}
                teams={teams}
                existing={applicationQuery.data}
                onSaved={() => {
                  setIsEditing(false)
                  setFeedback('Your application changes were saved.')
                }}
              />
            </section>
          ) : (
            <MyApplicationSummary
              application={applicationQuery.data}
              canEdit={canApplyOrEdit}
              onEdit={() => {
                setFeedback(null)
                setIsEditing(true)
              }}
            />
          )}
        </>
      ) : null}

      {applicationQuery.isSuccess && !applicationQuery.data ? (
        canApplyOrEdit ? (
          <section className="application-workspace" aria-labelledby="new-application-title">
            <div className="application-workspace__heading">
              <div>
                <p className="eyebrow">{getDriveWindowLabel(drive)}</p>
                <h2 id="new-application-title">Your application</h2>
                <p>Tell the club about yourself and rank at least one active team.</p>
              </div>
            </div>
            <ApplicationForm
              clubId={clubId}
              driveId={driveId}
              teams={teams}
              onSaved={() => setFeedback('Your application was submitted successfully.')}
            />
          </section>
        ) : (
          <EmptyState
            icon={FileLock2}
            title="Applications are not open"
            description="This drive is not accepting new applications at the current date and time."
          />
        )
      ) : null}
    </div>
  )
}
