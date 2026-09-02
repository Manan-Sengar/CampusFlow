import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Crown, Plus, UserMinus } from 'lucide-react'
import { useState } from 'react'
import { getErrorMessage } from '../../api/http.ts'
import { memberQueryKeys } from '../../api/members.ts'
import {
  assignTeamLead,
  listTeamLeads,
  removeTeamLead,
  teamQueryKeys,
} from '../../api/teams.ts'
import type { ClubMember, ClubTeam } from '../../api/types.ts'
import { ClubRoleBadge } from '../ui/ClubBadges.tsx'

interface TeamLeadsPanelProps {
  clubId: string
  team: ClubTeam
  isAdmin: boolean
  activeMembers: ClubMember[]
  membersPending: boolean
  membersError: string | null
  onRetryMembers: () => void
}

export function TeamLeadsPanel({
  clubId,
  team,
  isAdmin,
  activeMembers,
  membersPending,
  membersError,
  onRetryMembers,
}: TeamLeadsPanelProps) {
  const queryClient = useQueryClient()
  const [membershipId, setMembershipId] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<unknown>(null)
  const leadsQuery = useQuery({
    queryKey: teamQueryKeys.leads(clubId, team.id),
    queryFn: () => listTeamLeads(clubId, team.id),
  })
  const assignMutation = useMutation({
    mutationFn: (candidateMembershipId: string) =>
      assignTeamLead(clubId, team.id, candidateMembershipId),
    onMutate: () => {
      setSuccessMessage(null)
      setMutationError(null)
    },
    onSuccess: async (result) => {
      setSuccessMessage(result.changed ? 'Team lead assigned.' : 'That member is already a team lead.')
      setMembershipId('')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.leads(clubId, team.id) }),
        queryClient.invalidateQueries({ queryKey: memberQueryKeys.list(clubId) }),
      ])
    },
    onError: (error) => setMutationError(error),
  })
  const removeMutation = useMutation({
    mutationFn: (leadMembershipId: string) =>
      removeTeamLead(clubId, team.id, leadMembershipId),
    onMutate: () => {
      setSuccessMessage(null)
      setMutationError(null)
    },
    onSuccess: async () => {
      setSuccessMessage('Team lead assignment removed.')
      await queryClient.invalidateQueries({ queryKey: teamQueryKeys.leads(clubId, team.id) })
    },
    onError: (error) => setMutationError(error),
  })
  const leads = leadsQuery.data?.leads ?? []
  const leadMembershipIds = new Set(leads.map((lead) => lead.membershipId))
  const candidates = activeMembers.filter((member) => !leadMembershipIds.has(member.membershipId))
  const mutationPending = assignMutation.isPending || removeMutation.isPending

  function requestRemoval(leadName: string, leadMembershipId: string) {
    if (window.confirm(`Remove ${leadName} as a lead of ${team.name}?`)) {
      removeMutation.mutate(leadMembershipId)
    }
  }

  return (
    <section className="team-leads" aria-labelledby={`team-leads-${team.id}`}>
      <div className="team-leads__heading">
        <div>
          <Crown size={17} aria-hidden="true" />
          <h3 id={`team-leads-${team.id}`}>Active leads</h3>
        </div>
        {leadsQuery.isSuccess ? <span>{leads.length}</span> : null}
      </div>

      {leadsQuery.isPending ? <p className="team-leads__state">Loading team leads…</p> : null}
      {leadsQuery.isError ? (
        <div className="inline-error" role="alert">
          <p>{getErrorMessage(leadsQuery.error)}</p>
          <button type="button" onClick={() => void leadsQuery.refetch()}>Try again</button>
        </div>
      ) : null}
      {leadsQuery.isSuccess && leads.length === 0 ? (
        <p className="team-leads__state">No active leads have been assigned.</p>
      ) : null}
      {leads.length > 0 ? (
        <ul className="lead-list">
          {leads.map((lead) => (
            <li key={lead.assignmentId}>
              <div>
                <strong>{lead.name}</strong>
                <span>{lead.email}</span>
              </div>
              <ClubRoleBadge role={lead.role} />
              {isAdmin ? (
                <button
                  className="icon-button icon-button--danger"
                  type="button"
                  aria-label={`Remove ${lead.name} as a team lead`}
                  title="Remove team lead"
                  disabled={mutationPending}
                  onClick={() => requestRemoval(lead.name, lead.membershipId)}
                >
                  <UserMinus size={16} aria-hidden="true" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {isAdmin ? (
        <div className="add-lead-control">
          <label htmlFor={`add-lead-${team.id}`}>Assign another lead</label>
          {team.status === 'ARCHIVED' ? (
            <p>Archived teams cannot receive new leads.</p>
          ) : membersError ? (
            <div className="inline-error" role="alert">
              <p>{membersError}</p>
              <button type="button" onClick={onRetryMembers}>Try again</button>
            </div>
          ) : (
            <div className="select-action">
              <select
                id={`add-lead-${team.id}`}
                value={membershipId}
                disabled={membersPending || mutationPending || candidates.length === 0}
                onChange={(event) => setMembershipId(event.target.value)}
              >
                <option value="">
                  {membersPending
                    ? 'Loading members…'
                    : candidates.length === 0
                      ? 'No eligible members'
                      : 'Choose an active member'}
                </option>
                {candidates.map((member) => (
                  <option key={member.membershipId} value={member.membershipId}>
                    {member.name} · {member.role.toLowerCase()}
                  </option>
                ))}
              </select>
              <button
                className="button button--ghost button--compact"
                type="button"
                aria-label={assignMutation.isPending ? 'Assigning team lead' : 'Assign team lead'}
                disabled={!membershipId || mutationPending}
                onClick={() => assignMutation.mutate(membershipId)}
              >
                <Plus size={15} aria-hidden="true" />
                <span>{assignMutation.isPending ? 'Assigning…' : 'Assign'}</span>
              </button>
            </div>
          )}
        </div>
      ) : null}

      <div className="action-message" aria-live="polite">
        {successMessage ? <p className="action-message--success">{successMessage}</p> : null}
        {mutationError ? (
          <p className="action-message--error">{getErrorMessage(mutationError)} No change was made.</p>
        ) : null}
      </div>
    </section>
  )
}
