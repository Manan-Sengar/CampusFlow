import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Plus, Save, Send, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import {
  recruitmentQueryKeys,
  submitApplication,
  updateMyApplication,
} from '../../api/recruitment.ts'
import { getErrorMessage } from '../../api/http.ts'
import type {
  ApplicationBundleResponse,
  RecruitmentTeam,
  SubmitApplicationInput,
} from '../../api/types.ts'

interface ApplicationFormValues {
  motivation: string
  experience: string
  preferences: { teamId: string }[]
}

interface ApplicationFormProps {
  clubId: string
  driveId: string
  teams: RecruitmentTeam[]
  existing?: ApplicationBundleResponse
  onSaved?: (action: 'submitted' | 'updated') => void
}

function valuesFromApplication(existing?: ApplicationBundleResponse): ApplicationFormValues {
  return {
    motivation: existing?.application.motivation ?? '',
    experience: existing?.application.experience ?? '',
    preferences: existing
      ? [...existing.preferences]
          .sort((a, b) => a.rank - b.rank)
          .map((preference) => ({ teamId: preference.teamId }))
      : [{ teamId: '' }],
  }
}

export function ApplicationForm({
  clubId,
  driveId,
  teams,
  existing,
  onSaved,
}: ApplicationFormProps) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const isEditing = Boolean(existing)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormValues>({ defaultValues: valuesFromApplication(existing) })
  const { fields, append, remove, move } = useFieldArray({ control, name: 'preferences' })
  const watchedPreferences = useWatch({ control, name: 'preferences' })
  const maxPreferences = Math.min(10, teams.length)
  const selectedTeamIds = useMemo(
    () => new Set(watchedPreferences.map((preference) => preference.teamId).filter(Boolean)),
    [watchedPreferences],
  )

  useEffect(() => {
    reset(valuesFromApplication(existing))
  }, [existing, reset])

  const saveMutation = useMutation({
    mutationFn: (input: SubmitApplicationInput) =>
      existing
        ? updateMyApplication(clubId, driveId, input)
        : submitApplication(clubId, driveId, input),
    onSuccess: async () => {
      setSuccessMessage(isEditing ? 'Your application was updated.' : 'Your application was submitted.')
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: recruitmentQueryKeys.myApplication(clubId, driveId),
        }),
        queryClient.invalidateQueries({
          queryKey: recruitmentQueryKeys.applications(clubId, driveId),
        }),
      ])
      onSaved?.(isEditing ? 'updated' : 'submitted')
    },
    onError: () => setSuccessMessage(null),
  })

  function submit(values: ApplicationFormValues) {
    saveMutation.mutate({
      motivation: values.motivation,
      experience: values.experience,
      preferences: values.preferences.map((preference, index) => ({
        teamId: preference.teamId,
        rank: index + 1,
      })),
    })
  }

  if (teams.length === 0) {
    return (
      <p className="section-note">
        This club has no active teams available for ranked preferences, so an application cannot be submitted yet.
      </p>
    )
  }

  return (
    <form className="application-form" onSubmit={handleSubmit(submit)}>
      <div className="application-form__copy">
        <div className="form-field">
          <div className="form-field__label-row">
            <label htmlFor="application-motivation">Motivation</label>
            <span>Optional</span>
          </div>
          <textarea
            id="application-motivation"
            rows={6}
            placeholder="Why do you want to join this club?"
            aria-invalid={Boolean(errors.motivation)}
            {...register('motivation', {
              maxLength: {
                value: 2000,
                message: 'Motivation must be 2,000 characters or fewer.',
              },
            })}
          />
          {errors.motivation ? (
            <p className="field-error">{errors.motivation.message}</p>
          ) : null}
        </div>

        <div className="form-field">
          <div className="form-field__label-row">
            <label htmlFor="application-experience">Experience</label>
            <span>Optional</span>
          </div>
          <textarea
            id="application-experience"
            rows={6}
            placeholder="Share relevant projects, responsibilities, or skills."
            aria-invalid={Boolean(errors.experience)}
            {...register('experience', {
              maxLength: {
                value: 2000,
                message: 'Experience must be 2,000 characters or fewer.',
              },
            })}
          />
          {errors.experience ? (
            <p className="field-error">{errors.experience.message}</p>
          ) : null}
        </div>
      </div>

      <section className="preference-builder" aria-labelledby="preference-builder-title">
        <div className="preference-builder__heading">
          <div>
            <h3 id="preference-builder-title">Ranked team preferences</h3>
            <p>
              Your first choice is rank 1. Preferences guide placement but do not guarantee a team.
            </p>
          </div>
          <span>{fields.length}/{maxPreferences}</span>
        </div>

        <div className="preference-list">
          {fields.map((field, index) => {
            const currentTeamId = watchedPreferences[index]?.teamId ?? ''

            return (
              <div className="preference-row" key={field.id}>
                <span className="preference-row__rank" aria-label={`Preference rank ${index + 1}`}>
                  {index + 1}
                </span>
                <div className="form-field">
                  <label className="sr-only" htmlFor={`preference-${field.id}`}>
                    Team preference {index + 1}
                  </label>
                  <select
                    id={`preference-${field.id}`}
                    aria-invalid={Boolean(errors.preferences?.[index]?.teamId)}
                    {...register(`preferences.${index}.teamId`, {
                      required: 'Choose a team.',
                    })}
                  >
                    <option value="">Choose a team</option>
                    {teams.map((team) => (
                      <option
                        key={team.id}
                        value={team.id}
                        disabled={selectedTeamIds.has(team.id) && team.id !== currentTeamId}
                      >
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {errors.preferences?.[index]?.teamId ? (
                    <p className="field-error">{errors.preferences[index]?.teamId?.message}</p>
                  ) : null}
                </div>
                <div className="preference-row__actions">
                  <button
                    className="icon-button"
                    type="button"
                    title="Move preference up"
                    aria-label={`Move preference ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    title="Move preference down"
                    aria-label={`Move preference ${index + 1} down`}
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button
                    className="icon-button icon-button--danger"
                    type="button"
                    title="Remove preference"
                    aria-label={`Remove preference ${index + 1}`}
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {fields.length < maxPreferences ? (
          <button
            className="button button--ghost"
            type="button"
            onClick={() => append({ teamId: '' })}
          >
            <Plus size={16} aria-hidden="true" />
            Add preference
          </button>
        ) : null}
      </section>

      <div className="application-form__footer">
        <button className="button button--primary" type="submit" disabled={saveMutation.isPending}>
          {isEditing ? <Save size={17} aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
          {saveMutation.isPending
            ? isEditing
              ? 'Saving…'
              : 'Submitting…'
            : isEditing
              ? 'Save changes'
              : 'Submit application'}
        </button>
        <p>Preferences are saved in the order shown above.</p>
      </div>

      <div className="action-message" aria-live="polite">
        {successMessage ? <p className="action-message--success">{successMessage}</p> : null}
        {saveMutation.isError ? (
          <p className="action-message--error">{getErrorMessage(saveMutation.error)}</p>
        ) : null}
      </div>
    </form>
  )
}
