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
