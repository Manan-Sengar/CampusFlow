import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Megaphone } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createRecruitmentDrive,
  recruitmentQueryKeys,
} from '../../api/recruitment.ts'
import { getErrorMessage } from '../../api/http.ts'
import type { CreateRecruitmentDriveInput } from '../../api/types.ts'

interface DriveFormValues {
  title: string
  description: string
  opensAt: string
  closesAt: string
}

function toDateTimeInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

function createDefaultValues(): DriveFormValues {
  const opensAt = new Date()
  opensAt.setSeconds(0, 0)
  const closesAt = new Date(opensAt)
  closesAt.setDate(closesAt.getDate() + 7)

  return {
    title: '',
    description: '',
    opensAt: toDateTimeInputValue(opensAt),
    closesAt: toDateTimeInputValue(closesAt),
  }
}

export function CreateRecruitmentDriveForm({ clubId }: { clubId: string }) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<DriveFormValues>({ defaultValues: createDefaultValues() })
  const createMutation = useMutation({
    mutationFn: (input: CreateRecruitmentDriveInput) =>
      createRecruitmentDrive(clubId, input),
    onSuccess: async (result) => {
      setSuccessMessage(`${result.drive.title} was saved as a draft.`)
      reset(createDefaultValues())
      await queryClient.invalidateQueries({ queryKey: recruitmentQueryKeys.list(clubId) })
    },
    onError: () => setSuccessMessage(null),
  })

  function submit(values: DriveFormValues) {
    createMutation.mutate({
      title: values.title,
      opensAt: new Date(values.opensAt).toISOString(),
      closesAt: new Date(values.closesAt).toISOString(),
      ...(values.description ? { description: values.description } : {}),
    })
  }

  return (
    <section className="management-panel recruitment-create-panel" aria-labelledby="create-drive-title">
      <div className="management-panel__heading">
        <span className="management-panel__icon" aria-hidden="true">
          <Megaphone size={20} />
        </span>
        <div>
          <h2 id="create-drive-title">Create a recruitment drive</h2>
          <p>Set the application window now, then open the draft when you are ready.</p>
        </div>
      </div>

      <form className="recruitment-create-form" onSubmit={handleSubmit(submit)}>
        <div className="form-field recruitment-form-field--title">
          <label htmlFor="drive-title">Drive title</label>
          <input
            id="drive-title"
            placeholder="Autumn 2026 intake"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'drive-title-error' : undefined}
            {...register('title', {
              required: 'Enter a drive title.',
              minLength: { value: 3, message: 'Title must be at least 3 characters.' },
              maxLength: { value: 150, message: 'Title must be 150 characters or fewer.' },
            })}
          />
          {errors.title ? (
            <p className="field-error" id="drive-title-error">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="drive-opens">Applications open</label>
          <input
            id="drive-opens"
            type="datetime-local"
            aria-invalid={Boolean(errors.opensAt)}
            aria-describedby={errors.opensAt ? 'drive-opens-error' : undefined}
            {...register('opensAt', { required: 'Choose an opening date and time.' })}
          />
          {errors.opensAt ? (
            <p className="field-error" id="drive-opens-error">{errors.opensAt.message}</p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="drive-closes">Applications close</label>
          <input
            id="drive-closes"
            type="datetime-local"
            aria-invalid={Boolean(errors.closesAt)}
            aria-describedby={errors.closesAt ? 'drive-closes-error' : undefined}
            {...register('closesAt', {
              required: 'Choose a closing date and time.',
              validate: (value) =>
                new Date(value) > new Date(getValues('opensAt')) ||
                'Closing time must be after the opening time.',
            })}
          />
          {errors.closesAt ? (
            <p className="field-error" id="drive-closes-error">{errors.closesAt.message}</p>
          ) : null}
        </div>

        <div className="form-field recruitment-form-field--wide">
          <div className="form-field__label-row">
            <label htmlFor="drive-description">Description</label>
            <span>Optional</span>
          </div>
          <textarea
            id="drive-description"
            rows={3}
            placeholder="What applicants should know about this intake"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'drive-description-error' : undefined}
            {...register('description', {
              maxLength: {
                value: 2000,
                message: 'Description must be 2,000 characters or fewer.',
              },
            })}
          />
          {errors.description ? (
            <p className="field-error" id="drive-description-error">{errors.description.message}</p>
          ) : null}
        </div>

        <button
          className="button button--primary recruitment-create-form__submit"
          type="submit"
          disabled={createMutation.isPending}
        >
          <Megaphone size={17} aria-hidden="true" />
          {createMutation.isPending ? 'Creating…' : 'Create draft'}
        </button>
      </form>

      <div className="action-message" aria-live="polite">
        {successMessage ? <p className="action-message--success">{successMessage}</p> : null}
        {createMutation.isError ? (
          <p className="action-message--error">{getErrorMessage(createMutation.error)}</p>
        ) : null}
      </div>
    </section>
  )
}
