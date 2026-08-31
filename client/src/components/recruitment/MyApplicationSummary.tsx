import { ClipboardCheck, Pencil } from 'lucide-react'
import type { ApplicationBundleResponse } from '../../api/types.ts'
import { formatDateTime } from '../../utils/formatDate.ts'
import { ApplicationStatusBadge } from './RecruitmentBadges.tsx'

interface MyApplicationSummaryProps {
  application: ApplicationBundleResponse
  canEdit: boolean
  onEdit: () => void
}

export function MyApplicationSummary({
  application: bundle,
  canEdit,
  onEdit,
}: MyApplicationSummaryProps) {
  const { application } = bundle

  return (
    <section className="my-application-card" aria-labelledby="my-application-title">
      <div className="my-application-card__header">
        <div>
          <span className="my-application-card__icon" aria-hidden="true">
            <ClipboardCheck size={21} />
          </span>
          <div>
            <p className="eyebrow">Your application</p>
            <h2 id="my-application-title">Application details</h2>
          </div>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      <dl className="my-application-card__meta">
        <div>
          <dt>Submitted</dt>
          <dd>{formatDateTime(application.submittedAt)}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{formatDateTime(application.updatedAt)}</dd>
        </div>
      </dl>

      <div className="my-application-card__answers">
        <section>
          <h3>Motivation</h3>
          <p>{application.motivation || 'No motivation statement provided.'}</p>
        </section>
        <section>
          <h3>Experience</h3>
          <p>{application.experience || 'No experience statement provided.'}</p>
        </section>
      </div>

      <section className="my-application-card__preferences">
        <h3>Ranked team preferences</h3>
        <ol>
          {[...bundle.preferences]
            .sort((a, b) => a.rank - b.rank)
            .map((preference) => (
              <li key={preference.id}>
                <span>{preference.rank}</span>
                <div>
                  <strong>{preference.teamName}</strong>
                </div>
              </li>
            ))}
        </ol>
      </section>

      {canEdit ? (
        <button className="button button--ghost" type="button" onClick={onEdit}>
          <Pencil size={16} aria-hidden="true" />
          Edit application
        </button>
      ) : (
        <p className="section-note">This application is read-only because the application window is closed.</p>
      )}

      {application.status === 'SELECTED' ? (
        <p className="section-note">
          Selection records the review outcome. Club membership and onboarding are handled separately.
        </p>
      ) : null}
    </section>
  )
}
