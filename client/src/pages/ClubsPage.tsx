import { useQuery } from '@tanstack/react-query'
import { clubQueryKeys, listMyClubs } from '../api/clubs.ts'
import { ClubCard } from '../components/clubs/ClubCard.tsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatePanel.tsx'

export function ClubsPage() {
  const clubsQuery = useQuery({
    queryKey: clubQueryKeys.list(),
    queryFn: listMyClubs,
  })

  const clubs = clubsQuery.data?.clubs ?? []

  return (
    <section className="clubs-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your workspace</p>
          <h1>My clubs</h1>
          <p>Choose a club to open its workspace and see where you belong.</p>
        </div>
        {clubsQuery.isSuccess && clubs.length > 0 ? (
          <p className="page-count">
            {clubs.length} {clubs.length === 1 ? 'club' : 'clubs'}
          </p>
        ) : null}
      </div>

      {clubsQuery.isPending ? <LoadingState label="Loading your clubs…" /> : null}

      {clubsQuery.isError ? (
        <ErrorState
          title="Your clubs couldn’t be loaded"
          description="Check your connection and try loading the workspace again."
          onRetry={() => void clubsQuery.refetch()}
        />
      ) : null}

      {clubsQuery.isSuccess && clubs.length === 0 ? (
        <EmptyState
          title="No club memberships yet"
          description="When a club administrator adds you, that club will appear here automatically."
        />
      ) : null}

      {clubs.length > 0 ? (
        <div className="club-grid">
          {clubs.map((club) => (
            <ClubCard key={club.membershipId} club={club} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
