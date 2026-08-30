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
