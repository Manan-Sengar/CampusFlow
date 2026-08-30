import { apiRequest } from './http.ts'
import type {
  AssignTeamLeadResponse,
  CreateTeamInput,
  CreateTeamResponse,
  ListClubTeamsResponse,
  ListTeamLeadsResponse,
  RemoveTeamLeadResponse,
} from './types.ts'

function teamsPath(clubId: string, teamId?: string) {
  const base = `/clubs/${encodeURIComponent(clubId)}/teams`
  return teamId ? `${base}/${encodeURIComponent(teamId)}` : base
}

export const teamQueryKeys = {
  all: (clubId: string) => ['clubs', clubId, 'teams'] as const,
  list: (clubId: string) => [...teamQueryKeys.all(clubId), 'list'] as const,
  allLeads: (clubId: string) => [...teamQueryKeys.all(clubId), 'leads'] as const,
  leads: (clubId: string, teamId: string) =>
    [...teamQueryKeys.allLeads(clubId), teamId] as const,
}

export function listClubTeams(clubId: string) {
  return apiRequest<ListClubTeamsResponse>(teamsPath(clubId))
}

export function createClubTeam(clubId: string, input: CreateTeamInput) {
  return apiRequest<CreateTeamResponse>(teamsPath(clubId), {
    method: 'POST',
    body: input,
  })
}

export function listTeamLeads(clubId: string, teamId: string) {
  return apiRequest<ListTeamLeadsResponse>(`${teamsPath(clubId, teamId)}/leads`)
}

export function assignTeamLead(clubId: string, teamId: string, membershipId: string) {
  return apiRequest<AssignTeamLeadResponse>(
    `${teamsPath(clubId, teamId)}/leads/${encodeURIComponent(membershipId)}`,
    { method: 'POST' },
  )
}

export function removeTeamLead(clubId: string, teamId: string, membershipId: string) {
  return apiRequest<RemoveTeamLeadResponse>(
    `${teamsPath(clubId, teamId)}/leads/${encodeURIComponent(membershipId)}`,
    { method: 'DELETE' },
  )
}
