import { useQuery } from '@tanstack/react-query'
import { Network } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { getErrorMessage } from '../api/http.ts'
import { listClubMembers, memberQueryKeys } from '../api/members.ts'
import { listClubTeams, teamQueryKeys } from '../api/teams.ts'
import type { ClubOutletContext } from '../api/types.ts'
import { CreateTeamForm } from '../components/teams/CreateTeamForm.tsx'
import { TeamCard } from '../components/teams/TeamCard.tsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatePanel.tsx'

export function TeamsPage() {
  const { club } = useOutletContext<ClubOutletContext>()
  const isAdmin = club.role === 'ADMIN'
  const teamsQuery = useQuery({
    queryKey: teamQueryKeys.list(club.clubId),
    queryFn: () => listClubTeams(club.clubId),
  })
  const membersQuery = useQuery({
    queryKey: memberQueryKeys.list(club.clubId),
    queryFn: () => listClubMembers(club.clubId),
    enabled: isAdmin,
  })
  const teams = teamsQuery.data?.teams ?? []
  const activeMembers = (membersQuery.data?.members ?? []).filter(
    (member) => member.status === 'ACTIVE',
  )

  return (
    <section className="directory-page">
      <div className="section-page-heading">
        <div>
          <p className="eyebrow">Club structure</p>
          <h1>Teams</h1>
          <p>Explore the working groups in {club.clubName} and the people leading each one.</p>
        </div>
        {teamsQuery.isSuccess ? (
          <p className="page-count">
            {teams.length} {teams.length === 1 ? 'team' : 'teams'}
          </p>
        ) : null}
      </div>

      {isAdmin ? <CreateTeamForm clubId={club.clubId} /> : null}

      {teamsQuery.isPending ? <LoadingState label="Loading club teams…" /> : null}
      {teamsQuery.isError ? (
        <ErrorState
          title="Teams couldn’t be loaded"
          description={getErrorMessage(teamsQuery.error)}
          onRetry={() => void teamsQuery.refetch()}
        />
      ) : null}
      {teamsQuery.isSuccess && teams.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No teams yet"
          description={
            isAdmin
              ? 'Create the first team to organize members and assign shared leadership.'
              : 'An administrator has not created any teams for this club yet.'
          }
        />
      ) : null}

      {teams.length > 0 ? (
        <div className="team-grid">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              clubId={club.clubId}
              team={team}
              isAdmin={isAdmin}
              activeMembers={activeMembers}
              membersPending={membersQuery.isPending}
              membersError={membersQuery.isError ? getErrorMessage(membersQuery.error) : null}
              onRetryMembers={() => void membersQuery.refetch()}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
