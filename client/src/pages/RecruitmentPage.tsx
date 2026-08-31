import { useQuery } from '@tanstack/react-query'
import { UserRoundSearch } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { getErrorMessage } from '../api/http.ts'
import {
  listRecruitmentDrives,
  recruitmentQueryKeys,
} from '../api/recruitment.ts'
import type { ClubOutletContext } from '../api/types.ts'
import { CreateRecruitmentDriveForm } from '../components/recruitment/CreateRecruitmentDriveForm.tsx'
import { RecruitmentDriveCard } from '../components/recruitment/RecruitmentDriveCard.tsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatePanel.tsx'

export function RecruitmentPage() {
  const { club } = useOutletContext<ClubOutletContext>()
  const isAdmin = club.role === 'ADMIN'
  const drivesQuery = useQuery({
    queryKey: recruitmentQueryKeys.list(club.clubId),
    queryFn: () => listRecruitmentDrives(club.clubId),
  })
  const drives = drivesQuery.data?.drives ?? []

  return (
    <section className="directory-page">
      <div className="section-page-heading">
        <div>
          <p className="eyebrow">Build the next cohort</p>
          <h1>Recruitment</h1>
          <p>Publish application windows, collect ranked team preferences, and review applicants.</p>
        </div>
        {drivesQuery.isSuccess ? (
          <p className="page-count">
            {drives.length} {drives.length === 1 ? 'drive' : 'drives'}
          </p>
        ) : null}
      </div>

      {isAdmin ? <CreateRecruitmentDriveForm clubId={club.clubId} /> : null}

      {drivesQuery.isPending ? <LoadingState label="Loading recruitment drives…" /> : null}
      {drivesQuery.isError ? (
        <ErrorState
          title="Recruitment drives couldn’t be loaded"
          description={getErrorMessage(drivesQuery.error)}
          onRetry={() => void drivesQuery.refetch()}
        />
      ) : null}
      {drivesQuery.isSuccess && drives.length === 0 ? (
        <EmptyState
          icon={UserRoundSearch}
          title="No recruitment drives yet"
          description={
            isAdmin
              ? 'Create the first draft to prepare an application window.'
              : 'Recruitment drives that are available to your role will appear here.'
          }
        />
      ) : null}

      {drives.length > 0 ? (
        <div className="recruitment-grid">
          {drives.map((drive) => (
            <RecruitmentDriveCard
              key={drive.id}
              clubId={club.clubId}
              drive={drive}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
