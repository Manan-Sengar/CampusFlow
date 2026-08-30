import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '../api/auth.ts'
import { ApiError } from '../api/http.ts'
import type { User } from '../api/types.ts'

export const currentUserQueryKey = ['auth', 'current-user'] as const

async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await getCurrentUser()
    return response.user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null
    }

    throw error
  }
}

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
  })
}
