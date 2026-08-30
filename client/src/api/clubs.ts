import { apiRequest } from './http.ts'
import type { GetClubResponse, ListMyClubsResponse } from './types.ts'

export const clubQueryKeys = {
  all: ['clubs'] as const,
  list: () => [...clubQueryKeys.all, 'list'] as const,
  detail: (clubId: string) => [...clubQueryKeys.all, 'detail', clubId] as const,
}

export function listMyClubs() {
  return apiRequest<ListMyClubsResponse>('/clubs')
}

export function getClub(clubId: string) {
  return apiRequest<GetClubResponse>(`/clubs/${encodeURIComponent(clubId)}`)
}
