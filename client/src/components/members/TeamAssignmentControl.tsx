import { Save } from 'lucide-react'
import { useState } from 'react'
import type { ClubTeam } from '../../api/types.ts'

interface TeamAssignmentControlProps {
  controlId: string
  teams: ClubTeam[]
  disabled: boolean
  isPending: boolean
  onAssign: (teamId: string) => Promise<unknown>
}

export function TeamAssignmentControl({
  controlId,
  teams,
  disabled,
  isPending,
  onAssign,
}: TeamAssignmentControlProps) {
  const [teamId, setTeamId] = useState('')

  async function handleAssignment() {
    try {
      await onAssign(teamId)
      setTeamId('')
    } catch {
      // The mutation renders its normalized API error next to this control.
    }
  }

  return (
    <div className="member-control member-control--team">
      <label htmlFor={controlId}>Primary team</label>
      <div className="select-action">
        <select
          id={controlId}
          value={teamId}
          disabled={disabled || isPending || teams.length === 0}
          onChange={(event) => setTeamId(event.target.value)}
        >
          <option value="">Choose a team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <button
          className="button button--ghost button--compact"
          type="button"
          aria-label={isPending ? 'Saving primary team assignment' : 'Assign primary team'}
          disabled={disabled || isPending || !teamId}
          onClick={() => void handleAssignment()}
        >
          <Save size={15} aria-hidden="true" />
          <span>{isPending ? 'Saving…' : 'Assign'}</span>
        </button>
      </div>
    </div>
  )
}
