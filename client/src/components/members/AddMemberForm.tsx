import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { addClubMember, memberQueryKeys } from '../../api/members.ts'
import { getErrorMessage } from '../../api/http.ts'
import type { AddMemberInput } from '../../api/types.ts'

export function AddMemberForm({ clubId }: { clubId: string }) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberInput>({
    defaultValues: { email: '', role: 'MEMBER' },
  })
  const addMemberMutation = useMutation({
    mutationFn: (input: AddMemberInput) => addClubMember(clubId, input),
    onSuccess: async (result) => {
      setSuccessMessage(
        result.reactivated
          ? `${result.user.name}'s club membership was reactivated.`
          : `${result.user.name} was added to the club.`,
      )
      reset({ email: '', role: 'MEMBER' })
      await queryClient.invalidateQueries({ queryKey: memberQueryKeys.list(clubId) })
    },
    onError: () => setSuccessMessage(null),
  })

  return (
    <section className="management-panel" aria-labelledby="add-member-title">
      <div className="management-panel__heading">
        <span className="management-panel__icon" aria-hidden="true">
          <UserPlus size={20} />
        </span>
        <div>
          <h2 id="add-member-title">Add an existing user</h2>
          <p>Invite a registered CampusFlow user by their account email.</p>
        </div>
      </div>

      <form
        className="compact-form compact-form--member"
        onSubmit={handleSubmit((input) => addMemberMutation.mutate(input))}
      >
        <div className="form-field">
          <label htmlFor="member-email">CampusFlow email</label>
          <input
            id="member-email"
            type="email"
            autoComplete="email"
            placeholder="member@campus.edu"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'member-email-error' : undefined}
            {...register('email', {
              required: 'Enter the user’s email address.',
              maxLength: { value: 255, message: 'Email must be 255 characters or fewer.' },
            })}
          />
          {errors.email ? (
            <p className="field-error" id="member-email-error">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="member-initial-role">Initial role</label>
          <select id="member-initial-role" {...register('role')}>
            <option value="MEMBER">Member</option>
            <option value="LEAD">Lead</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button className="button button--primary" type="submit" disabled={addMemberMutation.isPending}>
          <UserPlus size={17} aria-hidden="true" />
          {addMemberMutation.isPending ? 'Adding…' : 'Add member'}
        </button>
      </form>

      <div className="action-message" aria-live="polite">
        {successMessage ? <p className="action-message--success">{successMessage}</p> : null}
        {addMemberMutation.isError ? (
          <p className="action-message--error">{getErrorMessage(addMemberMutation.error)}</p>
        ) : null}
      </div>
    </section>
  )
}
