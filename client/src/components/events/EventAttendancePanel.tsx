import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, UserCheck } from 'lucide-react'
import { useState } from 'react'
import {
  eventQueryKeys,
  listEventAttendance,
  markEventAttendance,
} from '../../api/events.ts'
import { getErrorMessage } from '../../api/http.ts'
import type {
  AttendanceStatus,
  ClubEvent,
  ClubMember,
  EventAssignment,
} from '../../api/types.ts'
import { formatDateTime } from '../../utils/formatDate.ts'
import { AssignmentTypeBadge, AttendanceStatusBadge } from './EventBadges.tsx'

interface EventAttendancePanelProps {
  clubId: string
  event: ClubEvent
  activeMembers: ClubMember[]
  membersPending: boolean
  membersError: string | null
  onRetryMembers: () => void
  assignments: EventAssignment[]
}

interface AttendanceRow {
  membershipId: string
  name: string
  email: string
  assignmentType: EventAssignment['type'] | null
  status: AttendanceStatus | null
  markedAt: string | null
}

export function EventAttendancePanel({
  clubId,
  event,
  activeMembers,
  membersPending,
  membersError,
  onRetryMembers,
  assignments,
}: EventAttendancePanelProps) {
  const queryClient = useQueryClient()
  const [membershipId, setMembershipId] = useState('')
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const attendanceQuery = useQuery({
    queryKey: eventQueryKeys.attendance(clubId, event.id),
    queryFn: () => listEventAttendance(clubId, event.id),
  })
  const attendanceMutation = useMutation({
    mutationFn: (input: { membershipId: string; status: AttendanceStatus }) =>
      markEventAttendance(clubId, event.id, input.membershipId, input.status),
    onSuccess: async (result) => {
      setSuccessMessage(
        !result.changed
          ? `Attendance is already marked ${result.attendance.status.toLowerCase()}.`
          : result.created
            ? 'Attendance marked.'
            : 'Attendance updated.',
      )
      await queryClient.invalidateQueries({
        queryKey: eventQueryKeys.attendance(clubId, event.id),
      })
    },
    onError: () => setSuccessMessage(null),
  })
  const attendance = attendanceQuery.data?.attendance ?? []
  const attendanceByMembership = new Map(
    attendance.map((record) => [record.membershipId, record] as const),
  )
  const rowsByMembership = new Map<string, AttendanceRow>()

  for (const assignment of assignments) {
    const record = attendanceByMembership.get(assignment.membershipId)
    rowsByMembership.set(assignment.membershipId, {
      membershipId: assignment.membershipId,
      name: assignment.name,
      email: assignment.email,
      assignmentType: assignment.type,
      status: record?.status ?? null,
      markedAt: record?.markedAt ?? null,
    })
  }

  for (const record of attendance) {
    if (!rowsByMembership.has(record.membershipId)) {
      rowsByMembership.set(record.membershipId, {
        membershipId: record.membershipId,
        name: record.name,
        email: record.email,
        assignmentType: null,
        status: record.status,
        markedAt: record.markedAt,
      })
    }
  }

  const rows = Array.from(rowsByMembership.values())
  const activeMembershipIds = new Set(activeMembers.map((member) => member.membershipId))

  function mark(membership: string, attendanceStatus: AttendanceStatus) {
    attendanceMutation.mutate({ membershipId: membership, status: attendanceStatus })
  }

  return (
    <section className="event-section" aria-labelledby="event-attendance-title">
      <div className="event-section__heading">
        <div>
          <p className="eyebrow">Event day</p>
          <h2 id="event-attendance-title">Attendance</h2>
          <p>Record attendance manually for any active club member.</p>
        </div>
        {attendanceQuery.isSuccess ? (
          <span className="section-count">{attendance.length}</span>
        ) : null}
      </div>

      {event.status === 'APPROVED' ? (
        <div className="attendance-control">
          <div className="form-field attendance-control__member">
            <label htmlFor="attendance-member">Active member</label>
            <select
              id="attendance-member"
              value={membershipId}
              disabled={membersPending || Boolean(membersError) || activeMembers.length === 0}
              onChange={(event) => setMembershipId(event.target.value)}
            >
              <option value="">
                {membersPending
                  ? 'Loading members…'
                  : activeMembers.length === 0
                    ? 'No active members'
                    : 'Choose a member'}
              </option>
              {activeMembers.map((member) => (
                <option key={member.membershipId} value={member.membershipId}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="attendance-status">Status</label>
            <select
              id="attendance-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as AttendanceStatus)}
            >
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
          <button
            className="button button--primary"
            type="button"
            disabled={!membershipId || attendanceMutation.isPending}
            onClick={() => mark(membershipId, status)}
          >
            <UserCheck size={17} aria-hidden="true" />
            {attendanceMutation.isPending ? 'Saving…' : 'Mark attendance'}
          </button>
        </div>
      ) : (
        <p className="section-note">Attendance can only be marked while the event is Approved.</p>
      )}

      {membersError ? (
        <div className="inline-error" role="alert">
          <p>{membersError}</p>
          <button type="button" onClick={onRetryMembers}>Retry members</button>
        </div>
      ) : null}

      <div className="action-message" aria-live="polite">
        {successMessage ? <p className="action-message--success">{successMessage}</p> : null}
        {attendanceMutation.isError ? (
          <p className="action-message--error">{getErrorMessage(attendanceMutation.error)}</p>
        ) : null}
      </div>

      {attendanceQuery.isPending ? <p className="event-section__state">Loading attendance…</p> : null}
      {attendanceQuery.isError ? (
        <div className="inline-error" role="alert">
          <p>{getErrorMessage(attendanceQuery.error)}</p>
          <button type="button" onClick={() => void attendanceQuery.refetch()}>Try again</button>
        </div>
      ) : null}
      {attendanceQuery.isSuccess && rows.length === 0 ? (
        <div className="section-empty">
          <CheckCircle2 size={21} aria-hidden="true" />
          <p>No assigned or recorded members yet.</p>
        </div>
      ) : null}
      {rows.length > 0 ? (
        <div className="attendance-list">
          {rows.map((row) => {
            const active = activeMembershipIds.has(row.membershipId)
            const updatingThis =
              attendanceMutation.isPending &&
              attendanceMutation.variables?.membershipId === row.membershipId

            return (
              <article className="attendance-row" key={row.membershipId}>
                <div className="attendance-row__identity">
                  <strong>{row.name}</strong>
                  <span>{row.email}</span>
                </div>
                <div className="attendance-row__context">
                  {row.assignmentType ? <AssignmentTypeBadge type={row.assignmentType} /> : null}
                  {row.status ? (
                    <AttendanceStatusBadge status={row.status} />
                  ) : (
                    <span className="not-marked">Not marked</span>
                  )}
                  {row.markedAt ? <span>Updated {formatDateTime(row.markedAt)}</span> : null}
                </div>
                {event.status === 'APPROVED' && active ? (
                  <div className="attendance-row__actions" aria-label={`Mark attendance for ${row.name}`}>
                    <button
                      className={row.status === 'PRESENT' ? 'status-choice is-selected' : 'status-choice'}
                      type="button"
                      disabled={updatingThis}
                      onClick={() => mark(row.membershipId, 'PRESENT')}
                    >
                      Present
                    </button>
                    <button
                      className={row.status === 'ABSENT' ? 'status-choice status-choice--absent is-selected' : 'status-choice status-choice--absent'}
                      type="button"
                      disabled={updatingThis}
                      onClick={() => mark(row.membershipId, 'ABSENT')}
                    >
                      Absent
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
