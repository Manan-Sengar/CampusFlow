import { apiRequest } from './http.ts'
import type { AuthResponse, LoginInput, RegisterInput } from './types.ts'

export function login(input: LoginInput) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: input,
  })
}

export function register(input: RegisterInput) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: input,
  })
}

export function getCurrentUser() {
  return apiRequest<AuthResponse>('/auth/me')
}

export function logout() {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
  })
}
