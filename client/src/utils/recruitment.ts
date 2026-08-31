import type { RecruitmentDrive } from '../api/types.ts'

export function isDriveAcceptingApplications(drive: RecruitmentDrive) {
  const now = Date.now()

  return (
    drive.status === 'OPEN' &&
    now >= new Date(drive.opensAt).getTime() &&
    now < new Date(drive.closesAt).getTime()
  )
}

export function getDriveWindowLabel(drive: RecruitmentDrive) {
  if (drive.status === 'DRAFT') return 'Not published'
  if (drive.status === 'CANCELLED') return 'Cancelled'
  if (drive.status === 'CLOSED') return 'Applications closed'

  const now = Date.now()
  if (now < new Date(drive.opensAt).getTime()) return 'Opens soon'
  if (now >= new Date(drive.closesAt).getTime()) return 'Window ended'
  return 'Accepting applications'
}
