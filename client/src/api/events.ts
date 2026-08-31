import { apiRequest } from './http.ts'
import type {
  ApproveEventResponse,
  AttendanceStatus,
  CreateEventAssignmentInput,
  CreateEventAssignmentResponse,
  CreateEventInput,
  CreateEventResponse,
  EventAssignmentStatus,
  GetClubEventResponse,
  ListClubEventsResponse,
  ListEventAssignmentsResponse,
  ListEventAttendanceResponse,
  MarkAttendanceResponse,
  RespondToEventAssignmentResponse,
} from './types.ts'

function eventsPath(clubId: string, eventId?: string) {
  const base = `/clubs/${encodeURIComponent(clubId)}/events`
  return eventId ? `${base}/${encodeURIComponent(eventId)}` : base
}

export const eventQueryKeys = {
  all: (clubId: string) => ['clubs', clubId, 'events'] as const,
  list: (clubId: string) => [...eventQueryKeys.all(clubId), 'list'] as const,
  details: (clubId: string) => [...eventQueryKeys.all(clubId), 'detail'] as const,
  detail: (clubId: string, eventId: string) =>
    [...eventQueryKeys.details(clubId), eventId] as const,
  assignments: (clubId: string, eventId: string) =>
    [...eventQueryKeys.all(clubId), 'assignments', eventId] as const,
  attendance: (clubId: string, eventId: string) =>
    [...eventQueryKeys.all(clubId), 'attendance', eventId] as const,
}

export function listClubEvents(clubId: string) {
  return apiRequest<ListClubEventsResponse>(eventsPath(clubId))
}

export function getClubEvent(clubId: string, eventId: string) {
  return apiRequest<GetClubEventResponse>(eventsPath(clubId, eventId))
}

export function createClubEvent(clubId: string, input: CreateEventInput) {
  return apiRequest<CreateEventResponse>(eventsPath(clubId), {
    method: 'POST',
    body: input,
  })
}

export function approveClubEvent(clubId: string, eventId: string) {
  return apiRequest<ApproveEventResponse>(`${eventsPath(clubId, eventId)}/approve`, {
    method: 'POST',
  })
}

export function listEventAssignments(clubId: string, eventId: string) {
  return apiRequest<ListEventAssignmentsResponse>(
    `${eventsPath(clubId, eventId)}/assignments`,
  )
}

export function createEventAssignment(
  clubId: string,
  eventId: string,
  input: CreateEventAssignmentInput,
) {
  return apiRequest<CreateEventAssignmentResponse>(
    `${eventsPath(clubId, eventId)}/assignments`,
    { method: 'POST', body: input },
  )
}

export function respondToEventAssignment(
  clubId: string,
  eventId: string,
  assignmentId: string,
  status: Exclude<EventAssignmentStatus, 'PENDING'>,
) {
  return apiRequest<RespondToEventAssignmentResponse>(
    `${eventsPath(clubId, eventId)}/assignments/${encodeURIComponent(assignmentId)}/response`,
    { method: 'PATCH', body: { status } },
  )
}

export function listEventAttendance(clubId: string, eventId: string) {
  return apiRequest<ListEventAttendanceResponse>(
    `${eventsPath(clubId, eventId)}/attendance`,
  )
}

export function markEventAttendance(
  clubId: string,
  eventId: string,
  membershipId: string,
  status: AttendanceStatus,
) {
  return apiRequest<MarkAttendanceResponse>(
    `${eventsPath(clubId, eventId)}/attendance/${encodeURIComponent(membershipId)}`,
    { method: 'PUT', body: { status } },
  )
}
