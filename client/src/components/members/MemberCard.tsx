import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { clubQueryKeys } from '../../api/clubs.ts'
import { getErrorMessage } from '../../api/http.ts'
import {
  assignMemberPrimaryTeam,
  memberQueryKeys,
  updateMemberRole,
  updateMemberStatus,
} from '../../api/members.ts'
import { teamQueryKeys } from '../../api/teams.ts'
import type {
  ClubMember,
  ClubRole,
  ClubTeam,
  MembershipStatus,
} from '../../api/types.ts'
import { formatShortDate } from '../../utils/formatDate.ts'
import { ClubRoleBadge, StatusBadge } from '../ui/ClubBadges.tsx'
import { TeamAssignmentControl } from './TeamAssignmentControl.tsx'
import { TeamHistoryPanel } from './TeamHistoryPanel.tsx'

interface MemberCardProps {
  clubId: string
  viewerMembershipId: string
  member: ClubMember
  isAdmin: boolean
  teams: ClubTeam[]
  teamsPending: boolean
  teamsError: string | null
  onRetryTeams: () => void
}

export function MemberCard({
  clubId,
  viewerMembershipId,
  member,
  isAdmin,
  teams,
  teamsPending,
  teamsError,
  onRetryTeams,
}: MemberCardProps) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<unknown>(null)
  const refreshMembership = async (includeLeadQueries = false) => {
    const invalidations = [
      queryClient.invalidateQueries({ queryKey: memberQueryKeys.list(clubId) }),
    ]

    if (includeLeadQueries) {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.allLeads(clubId) }),
      )
    }

    if (member.membershipId === viewerMembershipId) {
      invalidations.push(
        queryClient.invalidateQueries({ queryKey: clubQueryKeys.detail(clubId) }),
        queryClient.invalidateQueries({ queryKey: clubQueryKeys.list() }),
      )
    }

    await Promise.all(invalidations)
  }
  const roleMutation = useMutation({
    mutationFn: (role: ClubRole) => updateMemberRole(clubId, member.membershipId, role),
    onMutate: () => {
      setSuccessMessage(null)
      setActionError(null)
    },
    onSuccess: async (result) => {
      setSuccessMessage(`Role changed to ${result.membership.role.toLowerCase()}.`)
      await refreshMembership(true)
    },
    onError: (error) => setActionError(error),
  })
  const statusMutation = useMutation({
    mutationFn: (status: MembershipStatus) =>
      updateMemberStatus(clubId, member.membershipId, status),
    onMutate: () => {
      setSuccessMessage(null)
      setActionError(null)
    },
    onSuccess: async (result) => {
      setSuccessMessage(`Membership changed to ${result.membership.status.toLowerCase()}.`)
      await refreshMembership()
    },
    onError: (error) => setActionError(error),
  })
  const teamMutation = useMutation({
    mutationFn: (teamId: string) =>
      assignMemberPrimaryTeam(clubId, member.membershipId, teamId),
    onMutate: () => {
      setSuccessMessage(null)
      setActionError(null)
    },
    onSuccess: async (result) => {
      setSuccessMessage(
        result.changed
          ? `${result.team.name} is now the primary team.`
          : `${result.team.name} is already the primary team.`,
      )
      await queryClient.invalidateQueries({
        queryKey: memberQueryKeys.history(clubId, member.membershipId),
      })
    },
    onError: (error) => setActionError(error),
  })
  const activeTeams = teams.filter((team) => team.status === 'ACTIVE')
  const controlsPending =
    roleMutation.isPending || statusMutation.isPending || teamMutation.isPending

  function requestStatusChange(status: MembershipStatus) {
    if (status === member.status) return

    if (
      status === 'REMOVED' &&
      !window.confirm(
        `Remove ${member.name} from this club? Their membership can be reactivated later by adding the same CampusFlow account again.`,
      )
    ) {
      return
    }

    statusMutation.mutate(status)
  }

  return (
    <article className="member-card">
      <div className="member-card__summary">
        <span className="member-card__avatar" aria-hidden="true">
          <UserRound size={21} />
        </span>
        <div className="member-card__identity">
          <h2>{member.name}</h2>
          <a href={`mailto:${member.email}`}>
            <Mail size={14} aria-hidden="true" />
            {member.email}
          </a>
          <span>Joined {formatShortDate(member.joinedAt)}</span>
        </div>
        <div className="member-card__badges">
          <ClubRoleBadge role={member.role} />
          <StatusBadge status={member.status} />
        </div>
      </div>

      {isAdmin ? (
        <div className="member-card__admin">
          <div className="member-controls">
            <div className="member-control">
              <label htmlFor={`role-${member.membershipId}`}>Role</label>
              <select
                id={`role-${member.membershipId}`}
                value={member.role}
                disabled={controlsPending}
                onChange={(event) => roleMutation.mutate(event.target.value as ClubRole)}
              >
                <option value="MEMBER">Member</option>
                <option value="LEAD">Lead</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="member-control">
              <label htmlFor={`status-${member.membershipId}`}>Status</label>
              <select
                id={`status-${member.membershipId}`}
                value={member.status}
                disabled={controlsPending}
                onChange={(event) => requestStatusChange(event.target.value as MembershipStatus)}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ALUMNI">Alumni</option>
                <option value="REMOVED">Removed</option>
              </select>
            </div>

            <TeamAssignmentControl
              controlId={`primary-team-${member.membershipId}`}
              teams={activeTeams}
              disabled={
                member.status !== 'ACTIVE' ||
                teamsPending ||
                Boolean(teamsError) ||
                roleMutation.isPending ||
                statusMutation.isPending
              }
              isPending={teamMutation.isPending}
              onAssign={(teamId) => teamMutation.mutateAsync(teamId)}
            />
          </div>

          {teamsPending ? <p className="member-card__hint">Loading available teams…</p> : null}
          {!teamsPending && !teamsError && activeTeams.length === 0 ? (
            <p className="member-card__hint">Create an active team before assigning a primary team.</p>
          ) : null}
          {member.status !== 'ACTIVE' ? (
            <p className="member-card__hint">Only active members can receive a primary-team assignment.</p>
          ) : null}
          {teamsError ? (
            <div className="inline-error" role="alert">
              <p>{teamsError}</p>
              <button type="button" onClick={onRetryTeams}>Try again</button>
            </div>
          ) : null}

          <div className="action-message" aria-live="polite">
            {successMessage ? <p className="action-message--success">{successMessage}</p> : null}
            {actionError ? (
              <p className="action-message--error">
                {getErrorMessage(actionError)} No change was made.
              </p>
            ) : null}
          </div>

          <TeamHistoryPanel clubId={clubId} membershipId={member.membershipId} />
        </div>
      ) : null}
    </article>
  )
}
