import { ApiError, apiRequest } from './http.ts'
import type {
  ApplicationBundleResponse,
  CreateRecruitmentDriveInput,
  CreateRecruitmentDriveResponse,
  GetRecruitmentDriveResponse,
  ListDriveApplicationsResponse,
  ListRecruitmentDrivesResponse,
  RecruitmentDriveStatusTarget,
  ReviewableApplicationStatus,
  SubmitApplicationInput,
  UpdateApplicationInput,
  UpdateApplicationStatusResponse,
  UpdateRecruitmentDriveStatusResponse,
} from './types.ts'

function recruitmentPath(clubId: string, driveId?: string) {
  const base = `/clubs/${encodeURIComponent(clubId)}/recruitment-drives`
  return driveId ? `${base}/${encodeURIComponent(driveId)}` : base
}

export const recruitmentQueryKeys = {
  all: (clubId: string) => ['clubs', clubId, 'recruitment-drives'] as const,
  list: (clubId: string) => [...recruitmentQueryKeys.all(clubId), 'list'] as const,
  context: (clubId: string, driveId: string) =>
    ['recruitment-context', clubId, driveId] as const,
  myApplication: (clubId: string, driveId: string) =>
    ['recruitment-my-application', clubId, driveId] as const,
  applications: (clubId: string, driveId: string) =>
    [...recruitmentQueryKeys.all(clubId), driveId, 'applications'] as const,
}

export function listRecruitmentDrives(clubId: string) {
  return apiRequest<ListRecruitmentDrivesResponse>(recruitmentPath(clubId))
}

export function getRecruitmentDrive(clubId: string, driveId: string) {
  return apiRequest<GetRecruitmentDriveResponse>(recruitmentPath(clubId, driveId))
}

export function createRecruitmentDrive(
  clubId: string,
  input: CreateRecruitmentDriveInput,
) {
  return apiRequest<CreateRecruitmentDriveResponse>(recruitmentPath(clubId), {
    method: 'POST',
    body: input,
  })
}

export function updateRecruitmentDriveStatus(
  clubId: string,
  driveId: string,
  status: RecruitmentDriveStatusTarget,
) {
  return apiRequest<UpdateRecruitmentDriveStatusResponse>(
    `${recruitmentPath(clubId, driveId)}/status`,
    { method: 'PATCH', body: { status } },
  )
}

export function submitApplication(
  clubId: string,
  driveId: string,
  input: SubmitApplicationInput,
) {
  return apiRequest<ApplicationBundleResponse>(
    `${recruitmentPath(clubId, driveId)}/applications`,
    { method: 'POST', body: input },
  )
}

export async function getMyApplication(clubId: string, driveId: string) {
  try {
    return await apiRequest<ApplicationBundleResponse>(
      `${recruitmentPath(clubId, driveId)}/my-application`,
    )
  } catch (error) {
    if (error instanceof ApiError && error.code === 'APPLICATION_NOT_FOUND') {
      return null
    }

    throw error
  }
}

export function updateMyApplication(
  clubId: string,
  driveId: string,
  input: UpdateApplicationInput,
) {
  return apiRequest<ApplicationBundleResponse>(
    `${recruitmentPath(clubId, driveId)}/my-application`,
    { method: 'PATCH', body: input },
  )
}

export function listDriveApplications(clubId: string, driveId: string) {
  return apiRequest<ListDriveApplicationsResponse>(
    `${recruitmentPath(clubId, driveId)}/applications`,
  )
}

export function updateApplicationStatus(
  clubId: string,
  driveId: string,
  applicationId: string,
  status: ReviewableApplicationStatus,
) {
  return apiRequest<UpdateApplicationStatusResponse>(
    `${recruitmentPath(clubId, driveId)}/applications/${encodeURIComponent(applicationId)}/status`,
    { method: 'PATCH', body: { status } },
  )
}
