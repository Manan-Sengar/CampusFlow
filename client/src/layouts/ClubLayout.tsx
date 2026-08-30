import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2, GraduationCap, ShieldX } from 'lucide-react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { clubQueryKeys, getClub } from '../api/clubs.ts'
import { ApiError } from '../api/http.ts'
import type { ClubOutletContext } from '../api/types.ts'
import { ClubNav } from '../components/clubs/ClubNav.tsx'
import { ClubRoleBadge, StatusBadge } from '../components/ui/ClubBadges.tsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatePanel.tsx'

export function ClubLayout() {
  const { clubId = '' } = useParams()
  const clubQuery = useQuery({
    queryKey: clubQueryKeys.detail(clubId),
    queryFn: () => getClub(clubId),
    enabled: Boolean(clubId),
  })

  if (clubQuery.isPending) {
    return <LoadingState label="Opening club workspace…" />
  }

  if (clubQuery.isError) {
    const isUnavailable =
      clubQuery.error instanceof ApiError &&
      (clubQuery.error.status === 404 ||
        (clubQuery.error.status === 400 && clubQuery.error.code === 'INVALID_CLUB_ID'))

    if (isUnavailable) {
      return (
        <EmptyState
          icon={ShieldX}
          title="Club workspace unavailable"
          description="This club doesn’t exist, or your account doesn’t have access to it."
        >
          <Link className="button button--primary" to="/clubs">
            <ArrowLeft size={17} aria-hidden="true" />
            Back to My Clubs
          </Link>
        </EmptyState>
      )
    }

    return (
      <ErrorState
        title="The club workspace couldn’t be loaded"
        description="Check your connection and try opening this club again."
        onRetry={() => void clubQuery.refetch()}
      />
    )
  }

  const club = clubQuery.data.club
  const outletContext: ClubOutletContext = { club }

  return (
    <section className="club-workspace">
      <Link className="workspace-back-link" to="/clubs">
        <ArrowLeft size={16} aria-hidden="true" />
        My Clubs
      </Link>

      <header className="club-workspace__header">
        <div className="club-workspace__identity">
          <span className="club-workspace__icon" aria-hidden="true">
            <Building2 size={26} />
          </span>
          <div>
            <div className="club-workspace__campus">
              <GraduationCap size={16} aria-hidden="true" />
              {club.campusName}
            </div>
            <h1>{club.clubName}</h1>
            <p>{club.clubDescription || 'No club description has been added yet.'}</p>
          </div>
        </div>

        <div className="club-workspace__badges">
          <ClubRoleBadge role={club.role} />
          <StatusBadge status={club.clubStatus} />
        </div>
      </header>

      <ClubNav clubId={club.clubId} />

      <div className="club-workspace__content">
        <Outlet context={outletContext} />
      </div>
    </section>
  )
}
