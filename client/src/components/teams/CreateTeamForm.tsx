import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { getErrorMessage } from '../../api/http.ts'
import { createClubTeam, teamQueryKeys } from '../../api/teams.ts'
import type { CreateTeamInput } from '../../api/types.ts'

export function CreateTeamForm({ clubId }: { clubId: string }) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTeamInput>({ defaultValues: { name: '', description: '' } })
  const createTeamMutation = useMutation({
    mutationFn: (input: CreateTeamInput) =>
      createClubTeam(clubId, {
        name: input.name,
        ...(input.description ? { description: input.description } : {}),
      }),
    onSuccess: async (result) => {
      setSuccessMessage(`${result.team.name} was created.`)
      reset()
      await queryClient.invalidateQueries({ queryKey: teamQueryKeys.list(clubId) })
    },
    onError: () => setSuccessMessage(null),
  })

  return (
    <section className="management-panel" aria-labelledby="create-team-title">
      <div className="management-panel__heading">
        <span className="management-panel__icon" aria-hidden="true">
          <Plus size={20} />
        </span>
        <div>
          <h2 id="create-team-title">Create a team</h2>
          <p>Add a focused group for members and shared leadership.</p>
        </div>
      </div>

      <form
        className="compact-form compact-form--team"
        onSubmit={handleSubmit((input) => createTeamMutation.mutate(input))}
      >
        <div className="form-field">
          <label htmlFor="team-name">Team name</label>
          <input
            id="team-name"
            placeholder="Design team"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'team-name-error' : undefined}
            {...register('name', {
              required: 'Enter a team name.',
              minLength: { value: 2, message: 'Team name must be at least 2 characters.' },
              maxLength: { value: 100, message: 'Team name must be 100 characters or fewer.' },
            })}
          />
          {errors.name ? (
            <p className="field-error" id="team-name-error">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="form-field form-field--wide">
          <div className="form-field__label-row">
            <label htmlFor="team-description">Description</label>
            <span>Optional</span>
          </div>
          <textarea
            id="team-description"
            rows={2}
            placeholder="What this team works on"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'team-description-error' : undefined}
            {...register('description', {
              maxLength: { value: 500, message: 'Description must be 500 characters or fewer.' },
            })}
          />
          {errors.description ? (
            <p className="field-error" id="team-description-error">{errors.description.message}</p>
          ) : null}
        </div>

        <button className="button button--primary" type="submit" disabled={createTeamMutation.isPending}>
          <Plus size={17} aria-hidden="true" />
          {createTeamMutation.isPending ? 'Creating…' : 'Create team'}
        </button>
      </form>

      <div className="action-message" aria-live="polite">
        {successMessage ? <p className="action-message--success">{successMessage}</p> : null}
        {createTeamMutation.isError ? (
          <p className="action-message--error">{getErrorMessage(createTeamMutation.error)}</p>
        ) : null}
      </div>
    </section>
  )
}
