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

export type EventVisibility = 'PUBLIC' | 'INTERNAL'

export type EventStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CANCELLED'

export interface ClubEvent {
  id: string
  clubId: string
  title: string
  description: string | null
  venue: string | null
  startAt: string
  endAt: string
  visibility: EventVisibility
  status: EventStatus
  createdByMembershipId: string
  approvedByMembershipId: string | null
  approvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ListClubEventsResponse {
  events: ClubEvent[]
}

export interface GetClubEventResponse {
  event: ClubEvent
}

export interface CreateEventInput {
  title: string
  description?: string
  venue?: string
  startAt: string
  endAt: string
  visibility: EventVisibility
}

export interface CreateEventResponse {
  event: ClubEvent
}

export interface ApproveEventResponse {
  event: ClubEvent
  changed: boolean
}

export type EventAssignmentType = 'COORDINATOR' | 'VOLUNTEER'
export type EventAssignmentStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export interface CreateEventAssignmentInput {
  membershipId: string
  type: EventAssignmentType
  workingTeamId?: string
  responsibility?: string
}

export interface EventAssignmentRecord {
  id: string
  clubId: string
  eventId: string
  clubMembershipId: string
  type: EventAssignmentType
  status: EventAssignmentStatus
  workingTeamId: string | null
  responsibility: string | null
  assignedByMembershipId: string
  createdAt: string
  updatedAt: string
}

export interface EventAssignment {
  assignmentId: string
  membershipId: string
  userId: string
  name: string
  email: string
  type: EventAssignmentType
  status: EventAssignmentStatus
  workingTeamId: string | null
  workingTeamName: string | null
  responsibility: string | null
  assignedByMembershipId: string
  createdAt: string
}

export interface CreateEventAssignmentResponse {
  assignment: EventAssignmentRecord
}

export interface ListEventAssignmentsResponse {
  assignments: EventAssignment[]
}

export interface RespondToEventAssignmentResponse {
  assignment: EventAssignmentRecord
  changed: boolean
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT'

export interface EventAttendanceRecord {
  id: string
  clubId: string
  eventId: string
  clubMembershipId: string
  status: AttendanceStatus
  markedByMembershipId: string
  markedAt: string
}

export interface EventAttendance {
  attendanceId: string
  membershipId: string
  userId: string
  name: string
  email: string
  status: AttendanceStatus
  markedByMembershipId: string
  markedAt: string
}

export interface ListEventAttendanceResponse {
  attendance: EventAttendance[]
}

export interface MarkAttendanceResponse {
  attendance: EventAttendanceRecord
  changed: boolean
  created: boolean
}

export type RecruitmentDriveStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED'

export interface RecruitmentDrive {
  id: string
  clubId: string
  title: string
  description: string | null
  status: RecruitmentDriveStatus
  opensAt: string
  closesAt: string
  createdByMembershipId: string
  createdAt: string
  updatedAt: string
}

export interface RecruitmentContextClub {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface RecruitmentTeam {
  id: string
  name: string
  description: string | null
}

export interface ListRecruitmentDrivesResponse {
  drives: RecruitmentDrive[]
}

export interface GetRecruitmentDriveResponse {
  drive: RecruitmentDrive
  club: RecruitmentContextClub
  teams: RecruitmentTeam[]
}

export interface CreateRecruitmentDriveInput {
  title: string
  description?: string
  opensAt: string
  closesAt: string
}

export interface CreateRecruitmentDriveResponse {
  drive: RecruitmentDrive
}

export type RecruitmentDriveStatusTarget = Exclude<RecruitmentDriveStatus, 'DRAFT'>

export interface UpdateRecruitmentDriveStatusResponse {
  drive: RecruitmentDrive
  changed: boolean
}

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN'

export type ReviewableApplicationStatus = Extract<
  ApplicationStatus,
  'UNDER_REVIEW' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED'
>

export interface ApplicationPreferenceInput {
  teamId: string
  rank: number
}

export interface ApplicationPreference {
  id: string
  teamId: string
  teamName: string
  rank: number
}

export interface RecruitmentApplication {
  id: string
  clubId: string
  recruitmentDriveId: string
  userId: string
  motivation: string | null
  experience: string | null
  status: ApplicationStatus
  submittedAt: string
  updatedAt: string
}

export interface SubmitApplicationInput {
  motivation?: string
  experience?: string
  preferences: ApplicationPreferenceInput[]
}

export interface UpdateApplicationInput {
  motivation?: string
  experience?: string
  preferences?: ApplicationPreferenceInput[]
}

export interface ApplicationBundleResponse {
  application: RecruitmentApplication
  preferences: ApplicationPreference[]
}

export interface DriveApplication {
  id: string
  userId: string
  name: string
  email: string
  motivation: string | null
  experience: string | null
  status: ApplicationStatus
  submittedAt: string
  updatedAt: string
  preferences: ApplicationPreference[]
}

export interface ListDriveApplicationsResponse {
  applications: DriveApplication[]
}

export interface UpdateApplicationStatusResponse {
  application: RecruitmentApplication
  changed: boolean
}
