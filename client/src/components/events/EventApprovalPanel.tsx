import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { approveClubEvent, eventQueryKeys } from '../../api/events.ts'
import { getErrorMessage } from '../../api/http.ts'
import type { ClubEvent, ClubRole } from '../../api/types.ts'

interface EventApprovalPanelProps {
  clubId: string
  event: ClubEvent
  role: ClubRole
}

export function EventApprovalPanel({ clubId, event, role }: EventApprovalPanelProps) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const approveMutation = useMutation({
    mutationFn: () => approveClubEvent(clubId, event.id),
    onSuccess: async (result) => {
      setSuccessMessage(
        result.changed ? 'Event approved. Staffing is now available.' : 'This event is already approved.',
      )
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(clubId, event.id) }),
        queryClient.invalidateQueries({ queryKey: eventQueryKeys.list(clubId) }),
      ])
    },
    onError: () => setSuccessMessage(null),
  })

  if (event.status !== 'PENDING_APPROVAL') return null

  return (
    <section className="workflow-panel" aria-labelledby="event-approval-title">
      <span className="workflow-panel__icon" aria-hidden="true">
        <Clock3 size={22} />
      </span>
      <div className="workflow-panel__content">
        <p className="eyebrow">Approval workflow</p>
        <h2 id="event-approval-title">Awaiting administrator approval</h2>
        <p>
          Staffing and assignment responses become available after this event is approved.
        </p>
        <div className="action-message" aria-live="polite">
          {successMessage ? <p className="action-message--success">{successMessage}</p> : null}
          {approveMutation.isError ? (
            <p className="action-message--error">{getErrorMessage(approveMutation.error)}</p>
          ) : null}
        </div>
      </div>
      {role === 'ADMIN' ? (
        <button
          className="button button--primary"
          type="button"
          disabled={approveMutation.isPending}
          onClick={() => approveMutation.mutate()}
        >
          <BadgeCheck size={17} aria-hidden="true" />
          {approveMutation.isPending ? 'Approving…' : 'Approve event'}
        </button>
      ) : null}
    </section>
  )
}
