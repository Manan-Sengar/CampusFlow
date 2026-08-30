export type UserStatus = 'ACTIVE' | 'DEACTIVATED'

export interface User {
  id: string
  name: string
  email: string
  status: UserStatus
  createdAt: string
}

export interface AuthResponse {
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ClubRole = 'ADMIN' | 'LEAD' | 'MEMBER'

export type MembershipStatus = 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'REMOVED'

export type ClubStatus = 'ACTIVE' | 'ARCHIVED'

export interface ClubAccess {
  membershipId: string
  role: ClubRole
  membershipStatus: MembershipStatus
  clubId: string
  clubName: string
  clubSlug: string
  clubDescription: string | null
  clubStatus: ClubStatus
  campusId: string
  campusName: string
  campusSlug: string
}

export interface ListMyClubsResponse {
  clubs: ClubAccess[]
}

export interface GetClubResponse {
  club: ClubAccess
}

export interface ClubOutletContext {
  club: ClubAccess
}

export interface ClubMember {
  membershipId: string
  role: ClubRole
  status: MembershipStatus
  joinedAt: string
  userId: string
  name: string
  email: string
}

export interface ListClubMembersResponse {
  members: ClubMember[]
}

export interface ClubMembershipRecord {
  id: string
  userId: string
  clubId: string
  role: ClubRole
  status: MembershipStatus
  joinedAt: string
  updatedAt: string
}

export interface AddMemberInput {
  email: string
  role: ClubRole
}

export interface AddMemberResponse {
  membership: ClubMembershipRecord
  user: Pick<User, 'id' | 'name' | 'email' | 'status'>
  reactivated: boolean
}

export interface UpdateMemberResponse {
  membership: ClubMembershipRecord
}

export type TeamStatus = 'ACTIVE' | 'ARCHIVED'

export interface ClubTeam {
  id: string
  name: string
  description: string | null
  status: TeamStatus
  createdAt: string
}

export interface ClubTeamRecord extends ClubTeam {
  clubId: string
  updatedAt: string
}

export interface ListClubTeamsResponse {
  teams: ClubTeam[]
}

export interface CreateTeamInput {
  name: string
  description?: string
}

export interface CreateTeamResponse {
  team: ClubTeamRecord
}

export interface TeamMembershipRecord {
  id: string
  clubId: string
  clubMembershipId: string
  teamId: string
  startedAt: string
  endedAt: string | null
}

export interface AssignPrimaryTeamResponse {
  assignment: TeamMembershipRecord
  team: Pick<ClubTeam, 'id' | 'name' | 'status'>
  changed: boolean
}

export interface TeamHistoryEntry {
  assignmentId: string
  teamId: string
  teamName: string
  startedAt: string
  endedAt: string | null
}

export interface TeamHistoryResponse {
  history: TeamHistoryEntry[]
}

export interface TeamLead {
  assignmentId: string
  membershipId: string
  userId: string
  name: string
  email: string
  role: ClubRole
  startedAt: string
}

export interface ListTeamLeadsResponse {
  leads: TeamLead[]
}

export interface TeamLeadAssignmentRecord {
  id: string
  clubId: string
  teamId: string
  clubMembershipId: string
  startedAt: string
  endedAt: string | null
}

export interface AssignTeamLeadResponse {
  assignment: TeamLeadAssignmentRecord
  changed: boolean
}

export interface RemoveTeamLeadResponse {
  assignment: TeamLeadAssignmentRecord
}
