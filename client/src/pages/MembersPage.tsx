import { useQuery } from '@tanstack/react-query'
import { UsersRound } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { getErrorMessage } from '../api/http.ts'
import { listClubMembers, memberQueryKeys } from '../api/members.ts'
import { listClubTeams, teamQueryKeys } from '../api/teams.ts'
import type { ClubOutletContext } from '../api/types.ts'
import { AddMemberForm } from '../components/members/AddMemberForm.tsx'
import { MemberCard } from '../components/members/MemberCard.tsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatePanel.tsx'

export function MembersPage() {
  const { club } = useOutletContext<ClubOutletContext>()
  const isAdmin = club.role === 'ADMIN'
  const membersQuery = useQuery({
    queryKey: memberQueryKeys.list(club.clubId),
    queryFn: () => listClubMembers(club.clubId),
  })
  const teamsQuery = useQuery({
    queryKey: teamQueryKeys.list(club.clubId),
    queryFn: () => listClubTeams(club.clubId),
    enabled: isAdmin,
  })
  const members = membersQuery.data?.members ?? []
  const teams = teamsQuery.data?.teams ?? []

  return (
    <section className="directory-page">
      <div className="section-page-heading">
        <div>
          <p className="eyebrow">Club directory</p>
          <h1>Members</h1>
          <p>See everyone connected to {club.clubName} and their current club access.</p>
        </div>
        {membersQuery.isSuccess ? (
          <p className="page-count">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        ) : null}
      </div>

      {isAdmin ? <AddMemberForm clubId={club.clubId} /> : null}

      {membersQuery.isPending ? <LoadingState label="Loading club members…" /> : null}
      {membersQuery.isError ? (
        <ErrorState
          title="Members couldn’t be loaded"
          description={getErrorMessage(membersQuery.error)}
          onRetry={() => void membersQuery.refetch()}
        />
      ) : null}
      {membersQuery.isSuccess && members.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No club members yet"
          description="Members will appear here after an administrator adds their CampusFlow account."
        />
      ) : null}

      {members.length > 0 ? (
        <div className="member-list">
          {members.map((member) => (
            <MemberCard
              key={member.membershipId}
              clubId={club.clubId}
              viewerMembershipId={club.membershipId}
              member={member}
              isAdmin={isAdmin}
              teams={teams}
              teamsPending={teamsQuery.isPending}
              teamsError={teamsQuery.isError ? getErrorMessage(teamsQuery.error) : null}
              onRetryTeams={() => void teamsQuery.refetch()}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
