import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ClipboardCheck, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createEventAssignment,
  eventQueryKeys,
  respondToEventAssignment,
} from '../../api/events.ts'
import { getErrorMessage } from '../../api/http.ts'
import type {
  ClubEvent,
  ClubMember,
  ClubTeam,
  CreateEventAssignmentInput,
  EventAssignment,
  EventAssignmentStatus,
} from '../../api/types.ts'
import {
  AssignmentStatusBadge,
  AssignmentTypeBadge,
} from './EventBadges.tsx'

interface AssignmentFormValues {
  membershipId: string
  type: CreateEventAssignmentInput['type']
  workingTeamId: string
  responsibility: string
}

interface EventAssignmentsPanelProps {
  clubId: string
  event: ClubEvent
  viewerMembershipId: string
  canManage: boolean
  assignments: EventAssignment[]
  assignmentsPending: boolean
  assignmentsError: string | null
  onRetryAssignments: () => void
  activeMembers: ClubMember[]
  activeTeams: ClubTeam[]
  membersPending: boolean
  membersError: string | null
  onRetryMembers: () => void
  teamsPending: boolean
  teamsError: string | null
  onRetryTeams: () => void
}

export function EventAssignmentsPanel({
  clubId,
  event,
  viewerMembershipId,
  canManage,
  assignments,
  assignmentsPending,
  assignmentsError,
  onRetryAssignments,
  activeMembers,
  activeTeams,
  membersPending,
  membersError,
  onRetryMembers,
  teamsPending,
  teamsError,
  onRetryTeams,
}: EventAssignmentsPanelProps) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssignmentFormValues>({
    defaultValues: {
      membershipId: '',
      type: 'VOLUNTEER',
      workingTeamId: '',
      responsibility: '',
    },
  })
  const assignmentMutation = useMutation({
    mutationFn: (input: CreateEventAssignmentInput) =>
      createEventAssignment(clubId, event.id, input),
    onSuccess: async () => {
      setSuccessMessage('Member assigned. Their response is now pending.')
      reset()
      await queryClient.invalidateQueries({
        queryKey: eventQueryKeys.assignments(clubId, event.id),
      })
    },
    onError: () => setSuccessMessage(null),
  })
  const responseMutation = useMutation({
    mutationFn: ({ assignmentId, status }: { assignmentId: string; status: Exclude<EventAssignmentStatus, 'PENDING'> }) =>
      respondToEventAssignment(clubId, event.id, assignmentId, status),
    onSuccess: async (result) => {
      setSuccessMessage(
        result.changed
          ? `Assignment ${result.assignment.status.toLowerCase()}.`
          : `Assignment is already ${result.assignment.status.toLowerCase()}.`,
      )
      await queryClient.invalidateQueries({
        queryKey: eventQueryKeys.assignments(clubId, event.id),
      })
    },
    onError: () => setSuccessMessage(null),
  })
  const assignedMembershipIds = new Set(assignments.map((assignment) => assignment.membershipId))
  const candidates = activeMembers.filter(
    (member) => !assignedMembershipIds.has(member.membershipId),
  )
  const mutationError = assignmentMutation.error ?? responseMutation.error

  function submitAssignment(values: AssignmentFormValues) {
    assignmentMutation.mutate({
      membershipId: values.membershipId,
      type: values.type,
      ...(values.workingTeamId ? { workingTeamId: values.workingTeamId } : {}),
      ...(values.responsibility ? { responsibility: values.responsibility } : {}),
    })
  }

  return (
    <section className="event-section" aria-labelledby="event-staffing-title">
      <div className="event-section__heading">
        <div>
          <p className="eyebrow">Staffing</p>
          <h2 id="event-staffing-title">Assignments</h2>
          <p>Coordinators and volunteers can confirm how they’ll participate.</p>
        </div>
        {!assignmentsPending && !assignmentsError ? (
          <span className="section-count">{assignments.length}</span>
        ) : null}
      </div>

      {canManage && event.status === 'APPROVED' ? (
        <form className="assignment-form" onSubmit={handleSubmit(submitAssignment)}>
          <div className="form-field assignment-form__member">
            <label htmlFor="assignment-member">Active member</label>
            <select
              id="assignment-member"
              aria-invalid={Boolean(errors.membershipId)}
              disabled={membersPending || Boolean(membersError) || candidates.length === 0}
              {...register('membershipId', { required: 'Choose a member.' })}
            >
              <option value="">
                {membersPending
                  ? 'Loading members…'
                  : candidates.length === 0
                    ? 'No unassigned active members'
                    : 'Choose a member'}
              </option>
              {candidates.map((member) => (
                <option key={member.membershipId} value={member.membershipId}>
                  {member.name} · {member.role.toLowerCase()}
                </option>
              ))}
            </select>
            {errors.membershipId ? (
              <p className="field-error">{errors.membershipId.message}</p>
            ) : null}
          </div>

          <div className="form-field">
            <label htmlFor="assignment-type">Assignment</label>
            <select id="assignment-type" {...register('type')}>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="COORDINATOR">Coordinator</option>
            </select>
          </div>

          <div className="form-field">
            <div className="form-field__label-row">
              <label htmlFor="assignment-team">Working team</label>
              <span>Optional</span>
            </div>
            <select id="assignment-team" disabled={teamsPending || Boolean(teamsError)} {...register('workingTeamId')}>
              <option value="">No working team</option>
              {activeTeams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field assignment-form__responsibility">
            <div className="form-field__label-row">
              <label htmlFor="assignment-responsibility">Responsibility</label>
              <span>Optional</span>
            </div>
            <input
              id="assignment-responsibility"
              placeholder="Registration desk, stage setup…"
              aria-invalid={Boolean(errors.responsibility)}
              {...register('responsibility', {
                maxLength: { value: 500, message: 'Responsibility must be 500 characters or fewer.' },
              })}
            />
            {errors.responsibility ? (
              <p className="field-error">{errors.responsibility.message}</p>
            ) : null}
          </div>

          <button className="button button--primary" type="submit" disabled={assignmentMutation.isPending || !candidates.length}>
            <Plus size={17} aria-hidden="true" />
            {assignmentMutation.isPending ? 'Assigning…' : 'Assign member'}
          </button>
        </form>
      ) : null}

      {canManage && event.status !== 'APPROVED' ? (
        <p className="section-note">Staffing opens when the event reaches Approved status.</p>
      ) : null}
      {membersError && canManage ? (
        <div className="inline-error" role="alert">
          <p>{membersError}</p>
          <button type="button" onClick={onRetryMembers}>Retry members</button>
        </div>
      ) : null}
      {teamsError && canManage ? (
        <div className="inline-error" role="alert">
          <p>{teamsError} You can still assign someone without a working team.</p>
          <button type="button" onClick={onRetryTeams}>Retry teams</button>
        </div>
      ) : null}

      <div className="action-message" aria-live="polite">
        {successMessage ? <p className="action-message--success">{successMessage}</p> : null}
        {mutationError ? <p className="action-message--error">{getErrorMessage(mutationError)}</p> : null}
      </div>

      {assignmentsPending ? <p className="event-section__state">Loading assignments…</p> : null}
      {assignmentsError ? (
        <div className="inline-error" role="alert">
          <p>{assignmentsError}</p>
          <button type="button" onClick={onRetryAssignments}>Try again</button>
        </div>
      ) : null}
      {!assignmentsPending && !assignmentsError && assignments.length === 0 ? (
        <div className="section-empty">
          <ClipboardCheck size={21} aria-hidden="true" />
          <p>No one has been assigned to this event yet.</p>
        </div>
      ) : null}
      {assignments.length > 0 ? (
        <div className="assignment-list">
          {assignments.map((assignment) => {
            const canRespond =
              event.status === 'APPROVED' &&
              assignment.membershipId === viewerMembershipId &&
              assignment.status === 'PENDING'
            const respondingToThis =
              responseMutation.isPending &&
              responseMutation.variables?.assignmentId === assignment.assignmentId

            return (
              <article className="assignment-card" key={assignment.assignmentId}>
                <div className="assignment-card__identity">
                  <strong>{assignment.name}</strong>
                  <span>{assignment.email}</span>
                </div>
                <div className="assignment-card__badges">
                  <AssignmentTypeBadge type={assignment.type} />
                  <AssignmentStatusBadge status={assignment.status} />
                </div>
                <dl className="assignment-card__details">
                  <div>
                    <dt>Working team</dt>
                    <dd>{assignment.workingTeamName || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt>Responsibility</dt>
                    <dd>{assignment.responsibility || 'Not specified'}</dd>
                  </div>
                </dl>
                {canRespond ? (
                  <div className="assignment-card__response" aria-label="Respond to your assignment">
                    <button
                      className="button button--primary button--compact"
                      type="button"
                      disabled={respondingToThis}
                      onClick={() => responseMutation.mutate({ assignmentId: assignment.assignmentId, status: 'ACCEPTED' })}
                    >
                      <Check size={15} aria-hidden="true" />
                      <span>Accept</span>
                    </button>
                    <button
                      className="button button--ghost button--compact"
                      type="button"
                      disabled={respondingToThis}
                      onClick={() => responseMutation.mutate({ assignmentId: assignment.assignmentId, status: 'DECLINED' })}
                    >
                      <X size={15} aria-hidden="true" />
                      <span>Decline</span>
                    </button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
