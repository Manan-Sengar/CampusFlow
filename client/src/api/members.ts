import { apiRequest } from './http.ts'
import type {
  AddMemberInput,
  AddMemberResponse,
  AssignPrimaryTeamResponse,
  ClubRole,
  ListClubMembersResponse,
  MembershipStatus,
  TeamHistoryResponse,
  UpdateMemberResponse,
} from './types.ts'

function memberPath(clubId: string, membershipId?: string) {
  const base = `/clubs/${encodeURIComponent(clubId)}/members`
  return membershipId ? `${base}/${encodeURIComponent(membershipId)}` : base
}

export const memberQueryKeys = {
  all: (clubId: string) => ['clubs', clubId, 'members'] as const,
  list: (clubId: string) => [...memberQueryKeys.all(clubId), 'list'] as const,
  history: (clubId: string, membershipId: string) =>
    [...memberQueryKeys.all(clubId), membershipId, 'team-history'] as const,
}

export function listClubMembers(clubId: string) {
  return apiRequest<ListClubMembersResponse>(memberPath(clubId))
}

export function addClubMember(clubId: string, input: AddMemberInput) {
  return apiRequest<AddMemberResponse>(memberPath(clubId), {
    method: 'POST',
    body: input,
  })
}

export function updateMemberRole(
  clubId: string,
  membershipId: string,
  role: ClubRole,
) {
  return apiRequest<UpdateMemberResponse>(`${memberPath(clubId, membershipId)}/role`, {
    method: 'PATCH',
    body: { role },
  })
}

export function updateMemberStatus(
  clubId: string,
  membershipId: string,
  status: MembershipStatus,
) {
  return apiRequest<UpdateMemberResponse>(`${memberPath(clubId, membershipId)}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export function assignMemberPrimaryTeam(
  clubId: string,
  membershipId: string,
  teamId: string,
) {
  return apiRequest<AssignPrimaryTeamResponse>(`${memberPath(clubId, membershipId)}/team`, {
    method: 'PUT',
    body: { teamId },
  })
}

export function getMemberTeamHistory(clubId: string, membershipId: string) {
  return apiRequest<TeamHistoryResponse>(
    `${memberPath(clubId, membershipId)}/team-history`,
  )
}
