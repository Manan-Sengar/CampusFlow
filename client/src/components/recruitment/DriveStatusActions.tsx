import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Ban, CheckCircle2, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import {
  recruitmentQueryKeys,
  updateRecruitmentDriveStatus,
} from '../../api/recruitment.ts'
import { getErrorMessage } from '../../api/http.ts'
import type { RecruitmentDrive, RecruitmentDriveStatusTarget } from '../../api/types.ts'
import { formatDateTime } from '../../utils/formatDate.ts'

interface DriveStatusActionsProps {
  clubId: string
  drive: RecruitmentDrive
  compact?: boolean
}

export function DriveStatusActions({ clubId, drive, compact = false }: DriveStatusActionsProps) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [now] = useState(() => Date.now())
  const statusMutation = useMutation({
    mutationFn: (status: RecruitmentDriveStatusTarget) =>
      updateRecruitmentDriveStatus(clubId, drive.id, status),
    onSuccess: async (result) => {
      setSuccessMessage(
        result.changed
          ? `Drive status changed to ${result.drive.status.toLowerCase()}.`
          : `Drive is already ${result.drive.status.toLowerCase()}.`,
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.list(clubId) }),
        queryClient.invalidateQueries({
          queryKey: recruitmentQueryKeys.context(clubId, drive.id),
        }),
      ])
    },
    onError: () => setSuccessMessage(null),
  })

  const opensAt = new Date(drive.opensAt).getTime()
  const closesAt = new Date(drive.closesAt).getTime()
  const canOpen = now >= opensAt && now < closesAt

  function changeStatus(status: RecruitmentDriveStatusTarget) {
    if (
      (status === 'CANCELLED' || status === 'CLOSED') &&
      !window.confirm(
        status === 'CANCELLED'
          ? 'Cancel this recruitment drive? This status cannot be reversed.'
          : 'Close this recruitment drive? Applicants will no longer be able to submit or edit.',
      )
    ) {
      return
    }

    statusMutation.mutate(status)
  }

  if (drive.status === 'CLOSED' || drive.status === 'CANCELLED') {
    return compact ? null : (
      <p className="section-note">This drive has reached a terminal status and cannot transition again.</p>
    )
  }

  return (
    <div className={compact ? 'drive-status-actions drive-status-actions--compact' : 'drive-status-actions'}>
      <div className="drive-status-actions__buttons">
        {drive.status === 'DRAFT' ? (
          <button
            className="button button--primary"
            type="button"
            disabled={statusMutation.isPending || !canOpen}
            title={
              now < opensAt
                ? `This drive can open from ${formatDateTime(drive.opensAt)}.`
                : now >= closesAt
                  ? 'The configured application window has already ended.'
                  : undefined
            }
            onClick={() => changeStatus('OPEN')}
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            Open drive
          </button>
        ) : null}

        {drive.status === 'OPEN' ? (
          <button
            className="button button--ghost"
            type="button"
            disabled={statusMutation.isPending}
            onClick={() => changeStatus('CLOSED')}
          >
            <LockKeyhole size={16} aria-hidden="true" />
            Close drive
          </button>
        ) : null}

        <button
          className="button button--danger-soft"
          type="button"
          disabled={statusMutation.isPending}
          onClick={() => changeStatus('CANCELLED')}
        >
          <Ban size={16} aria-hidden="true" />
          Cancel
        </button>
      </div>

      {drive.status === 'DRAFT' && !canOpen ? (
        <p className="drive-status-actions__hint">
          {now < opensAt
            ? `Opening becomes available ${formatDateTime(drive.opensAt)}.`
            : 'This draft cannot open because its application window has ended.'}
        </p>
      ) : null}

      <div className="action-message" aria-live="polite">
        {successMessage ? <p className="action-message--success">{successMessage}</p> : null}
        {statusMutation.isError ? (
          <p className="action-message--error">{getErrorMessage(statusMutation.error)}</p>
        ) : null}
      </div>
    </div>
  )
}
