import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CalendarClock, CalendarX2, CheckCircle2, MapPin } from 'lucide-react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import {
  eventQueryKeys,
  getClubEvent,
  listEventAssignments,
} from '../api/events.ts'
import { ApiError, getErrorMessage } from '../api/http.ts'
import { listClubMembers, memberQueryKeys } from '../api/members.ts'
import { listClubTeams, teamQueryKeys } from '../api/teams.ts'
import type { ClubOutletContext } from '../api/types.ts'
import { EventApprovalPanel } from '../components/events/EventApprovalPanel.tsx'
import { EventAssignmentsPanel } from '../components/events/EventAssignmentsPanel.tsx'
import { EventAttendancePanel } from '../components/events/EventAttendancePanel.tsx'
import { EventStatusBadge, EventVisibilityBadge } from '../components/events/EventBadges.tsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatePanel.tsx'
import { formatDateTime, formatEventDateRange } from '../utils/formatDate.ts'

export function EventDetailPage() {
  const { club } = useOutletContext<ClubOutletContext>()
  const { eventId = '' } = useParams()
  const canManage = club.role === 'ADMIN' || club.role === 'LEAD'
  const eventQuery = useQuery({
    queryKey: eventQueryKeys.detail(club.clubId, eventId),
    queryFn: () => getClubEvent(club.clubId, eventId),
    enabled: Boolean(eventId),
  })
  const assignmentsQuery = useQuery({
    queryKey: eventQueryKeys.assignments(club.clubId, eventId),
    queryFn: () => listEventAssignments(club.clubId, eventId),
    enabled: Boolean(eventId),
  })
  const membersQuery = useQuery({
    queryKey: memberQueryKeys.list(club.clubId),
    queryFn: () => listClubMembers(club.clubId),
    enabled: canManage,
  })
  const teamsQuery = useQuery({
    queryKey: teamQueryKeys.list(club.clubId),
    queryFn: () => listClubTeams(club.clubId),
    enabled: canManage,
  })

  if (eventQuery.isPending) {
    return <LoadingState label="Loading event details…" />
  }

  if (eventQuery.isError) {
    const isUnavailable =
      eventQuery.error instanceof ApiError &&
      (eventQuery.error.status === 404 || eventQuery.error.code === 'INVALID_EVENT_ID')

    if (isUnavailable) {
      return (
        <EmptyState
          icon={CalendarX2}
          title="Event unavailable"
          description="This event doesn’t exist in the current club workspace."
        >
          <Link className="button button--primary" to={`/clubs/${club.clubId}/events`}>
            <ArrowLeft size={17} aria-hidden="true" />
            Back to events
          </Link>
        </EmptyState>
      )
    }

    return (
      <ErrorState
        title="Event details couldn’t be loaded"
        description={getErrorMessage(eventQuery.error)}
        onRetry={() => void eventQuery.refetch()}
      />
    )
  }

  const event = eventQuery.data.event
  const assignments = assignmentsQuery.data?.assignments ?? []
  const activeMembers = (membersQuery.data?.members ?? []).filter(
    (member) => member.status === 'ACTIVE',
  )
  const activeTeams = (teamsQuery.data?.teams ?? []).filter(
    (team) => team.status === 'ACTIVE',
  )

  return (
    <div className="event-detail-page">
      <Link className="workspace-back-link" to={`/clubs/${club.clubId}/events`}>
        <ArrowLeft size={16} aria-hidden="true" />
        All events
      </Link>

      <article className="event-detail-hero">
        <div className="event-detail-hero__badges">
          <EventStatusBadge status={event.status} />
          <EventVisibilityBadge visibility={event.visibility} />
        </div>
        <h1>{event.title}</h1>
        <p>{event.description || 'No event description has been added.'}</p>

        <dl className="event-detail-meta">
          <div>
            <CalendarClock size={19} aria-hidden="true" />
            <dt>Schedule</dt>
            <dd>{formatEventDateRange(event.startAt, event.endAt)}</dd>
          </div>
          <div>
            <MapPin size={19} aria-hidden="true" />
            <dt>Venue</dt>
            <dd>{event.venue || 'Venue to be confirmed'}</dd>
          </div>
          {event.approvedAt ? (
            <div>
              <CheckCircle2 size={19} aria-hidden="true" />
              <dt>Approved</dt>
              <dd>{formatDateTime(event.approvedAt)}</dd>
            </div>
          ) : null}
        </dl>
      </article>

      <EventApprovalPanel clubId={club.clubId} event={event} role={club.role} />

      <EventAssignmentsPanel
        clubId={club.clubId}
        event={event}
        viewerMembershipId={club.membershipId}
        canManage={canManage}
        assignments={assignments}
        assignmentsPending={assignmentsQuery.isPending}
        assignmentsError={assignmentsQuery.isError ? getErrorMessage(assignmentsQuery.error) : null}
        onRetryAssignments={() => void assignmentsQuery.refetch()}
        activeMembers={activeMembers}
        activeTeams={activeTeams}
        membersPending={membersQuery.isPending}
        membersError={membersQuery.isError ? getErrorMessage(membersQuery.error) : null}
        onRetryMembers={() => void membersQuery.refetch()}
        teamsPending={teamsQuery.isPending}
        teamsError={teamsQuery.isError ? getErrorMessage(teamsQuery.error) : null}
        onRetryTeams={() => void teamsQuery.refetch()}
      />

      {canManage ? (
        <EventAttendancePanel
          clubId={club.clubId}
          event={event}
          activeMembers={activeMembers}
          membersPending={membersQuery.isPending}
          membersError={membersQuery.isError ? getErrorMessage(membersQuery.error) : null}
          onRetryMembers={() => void membersQuery.refetch()}
          assignments={assignments}
        />
      ) : null}
    </div>
  )
}
