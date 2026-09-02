import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Inbox, LoaderCircle, RefreshCcw, UserRoundCheck } from 'lucide-react'
import { useState } from 'react'
import {
  listDriveApplications,
  recruitmentQueryKeys,
  updateApplicationStatus,
} from '../../api/recruitment.ts'
import { getErrorMessage } from '../../api/http.ts'
import type {
  ApplicationStatus,
  DriveApplication,
  ReviewableApplicationStatus,
} from '../../api/types.ts'
import { formatDateTime } from '../../utils/formatDate.ts'
import { ApplicationStatusBadge } from './RecruitmentBadges.tsx'

const reviewStatuses: { value: ReviewableApplicationStatus; label: string }[] = [
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'REJECTED', label: 'Rejected' },
]

function ApplicationReviewCard({
  application,
  isUpdating,
  onStatusChange,
}: {
  application: DriveApplication
  isUpdating: boolean
  onStatusChange: (status: ReviewableApplicationStatus) => void
}) {
  const canReview = application.status !== 'WITHDRAWN'

  return (
    <article className="application-review-card">
      <div className="application-review-card__header">
        <div className="application-review-card__identity">
          <span className="application-review-card__avatar" aria-hidden="true">
            {application.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h3>{application.name}</h3>
            <a href={`mailto:${application.email}`}>{application.email}</a>
          </div>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <dl className="application-review-card__meta">
        <div>
          <dt>Submitted</dt>
          <dd>{formatDateTime(application.submittedAt)}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{formatDateTime(application.updatedAt)}</dd>
        </div>
      </dl>

      <div className="application-review-card__answers">
        <section>
          <h4>Motivation</h4>
          <p>{application.motivation || 'No motivation statement provided.'}</p>
        </section>
        <section>
          <h4>Experience</h4>
          <p>{application.experience || 'No experience statement provided.'}</p>
        </section>
      </div>

      <section className="application-review-card__preferences">
        <h4>Team preferences</h4>
        <ol>
          {[...application.preferences]
            .sort((a, b) => a.rank - b.rank)
            .map((preference) => (
              <li key={preference.id}>
                <span>{preference.rank}</span>
                {preference.teamName}
              </li>
            ))}
        </ol>
      </section>

      <div className="application-review-card__action">
        <label htmlFor={`review-status-${application.id}`}>Update review status</label>
        <select
          id={`review-status-${application.id}`}
          value=""
          disabled={!canReview || isUpdating}
          onChange={(event) => {
            if (event.target.value) {
              onStatusChange(event.target.value as ReviewableApplicationStatus)
            }
          }}
        >
          <option value="">{canReview ? 'Choose a status' : 'Withdrawn applications are locked'}</option>
          {reviewStatuses
            .filter((status) => status.value !== (application.status as ApplicationStatus))
            .map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
        </select>
        {isUpdating ? <LoaderCircle className="spin" size={17} aria-label="Updating status" /> : null}
      </div>
    </article>
  )
}

export function ApplicationReviewPanel({ clubId, driveId }: { clubId: string; driveId: string }) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const applicationsQuery = useQuery({
    queryKey: recruitmentQueryKeys.applications(clubId, driveId),
    queryFn: () => listDriveApplications(clubId, driveId),
  })
  const statusMutation = useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string
      status: ReviewableApplicationStatus
    }) => updateApplicationStatus(clubId, driveId, applicationId, status),
    onMutate: () => setSuccessMessage(null),
    onSuccess: async (result) => {
      setSuccessMessage(
        result.changed
          ? `Application moved to ${result.application.status.toLowerCase().replace('_', ' ')}.`
          : 'The application already has that status.',
      )
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: recruitmentQueryKeys.applications(clubId, driveId),
        }),
        queryClient.invalidateQueries({
          queryKey: recruitmentQueryKeys.myApplication(clubId, driveId),
        }),
      ])
    },
    onError: () => setSuccessMessage(null),
  })
  const applications = applicationsQuery.data?.applications ?? []

  return (
    <section className="event-section application-review-panel" aria-labelledby="review-applications-title">
      <div className="event-section__heading">
        <div>
          <p className="eyebrow">Administrator review</p>
          <h2 id="review-applications-title">Applications</h2>
          <p>Review statements and ranked team preferences, then move applicants through the selection workflow.</p>
        </div>
        {applicationsQuery.isSuccess ? <span className="section-count">{applications.length}</span> : null}
      </div>

      {applicationsQuery.isPending ? (
        <p className="event-section__state"><LoaderCircle className="spin" size={16} /> Loading applications…</p>
      ) : null}
      {applicationsQuery.isError ? (
        <div className="inline-error" role="alert">
          <p>{getErrorMessage(applicationsQuery.error)}</p>
          <button type="button" onClick={() => void applicationsQuery.refetch()}>
            <RefreshCcw size={15} aria-hidden="true" /> Retry
          </button>
        </div>
      ) : null}
      {applicationsQuery.isSuccess && applications.length === 0 ? (
        <div className="section-empty">
          <Inbox size={18} aria-hidden="true" />
          <p>No applications have been submitted to this drive yet.</p>
        </div>
      ) : null}

      {applications.length > 0 ? (
        <div className="application-review-list">
          {applications.map((application) => (
            <ApplicationReviewCard
              key={application.id}
              application={application}
              isUpdating={
                statusMutation.isPending &&
                statusMutation.variables?.applicationId === application.id
              }
              onStatusChange={(status) =>
                statusMutation.mutate({ applicationId: application.id, status })
              }
            />
          ))}
        </div>
      ) : null}

      <div className="action-message" aria-live="polite">
        {successMessage ? (
          <p className="action-message--success">
            <UserRoundCheck size={16} aria-hidden="true" /> {successMessage}
          </p>
        ) : null}
        {statusMutation.isError ? (
          <p className="action-message--error">{getErrorMessage(statusMutation.error)}</p>
        ) : null}
      </div>

      <p className="section-note">
        Selecting an applicant records the review outcome only. It does not automatically add them as a club member.
      </p>
    </section>
  )
}
