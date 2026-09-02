import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClubEvent, eventQueryKeys } from '../../api/events.ts'
import { getErrorMessage } from '../../api/http.ts'
import type { ClubRole, CreateEventInput, EventVisibility } from '../../api/types.ts'

interface CreateEventFormValues {
  title: string
  description: string
  venue: string
  startAt: string
  endAt: string
  visibility: EventVisibility
}

function toDateTimeInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

function createDefaultValues(): CreateEventFormValues {
  const start = new Date()
  start.setMinutes(0, 0, 0)
  start.setHours(start.getHours() + 1)
  const end = new Date(start)
  end.setHours(end.getHours() + 2)

  return {
    title: '',
    description: '',
    venue: '',
    startAt: toDateTimeInputValue(start),
    endAt: toDateTimeInputValue(end),
    visibility: 'INTERNAL',
  }
}

interface CreateEventFormProps {
  clubId: string
  role: Extract<ClubRole, 'ADMIN' | 'LEAD'>
}

export function CreateEventForm({ clubId, role }: CreateEventFormProps) {
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<CreateEventFormValues>({ defaultValues: createDefaultValues() })
  const createMutation = useMutation({
    mutationFn: (input: CreateEventInput) => createClubEvent(clubId, input),
    onSuccess: async (result) => {
      setSuccessMessage(
        result.event.status === 'APPROVED'
          ? `${result.event.title} was created and approved.`
          : `${result.event.title} was submitted for administrator approval.`,
      )
      reset(createDefaultValues())
      await queryClient.invalidateQueries({ queryKey: eventQueryKeys.list(clubId) })
    },
    onError: () => setSuccessMessage(null),
  })

  function submit(values: CreateEventFormValues) {
    createMutation.mutate({
      title: values.title,
      startAt: new Date(values.startAt).toISOString(),
      endAt: new Date(values.endAt).toISOString(),
      visibility: values.visibility,
      ...(values.description ? { description: values.description } : {}),
      ...(values.venue ? { venue: values.venue } : {}),
    })
  }

  return (
    <section className="management-panel event-create-panel" aria-labelledby="create-event-title">
      <div className="management-panel__heading">
        <span className="management-panel__icon" aria-hidden="true">
          <CalendarPlus size={20} />
        </span>
        <div>
          <h2 id="create-event-title">Create an event</h2>
          <p>
            {role === 'ADMIN'
              ? 'Events you create are approved immediately.'
              : 'Events you create are sent to an administrator for approval.'}
          </p>
        </div>
      </div>

      <form className="event-create-form" onSubmit={handleSubmit(submit)}>
        <div className="form-field event-form-field--title">
          <label htmlFor="event-title">Event title</label>
          <input
            id="event-title"
            placeholder="Annual showcase"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'event-title-error' : undefined}
            {...register('title', {
              required: 'Enter an event title.',
              minLength: { value: 2, message: 'Title must be at least 2 characters.' },
              maxLength: { value: 150, message: 'Title must be 150 characters or fewer.' },
            })}
          />
          {errors.title ? (
            <p className="field-error" id="event-title-error">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="event-visibility">Visibility</label>
          <select id="event-visibility" {...register('visibility')}>
            <option value="INTERNAL">Club only</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="event-start">Starts</label>
          <input
            id="event-start"
            type="datetime-local"
            aria-invalid={Boolean(errors.startAt)}
            aria-describedby={errors.startAt ? 'event-start-error' : undefined}
            {...register('startAt', { required: 'Choose a start date and time.' })}
          />
          {errors.startAt ? (
            <p className="field-error" id="event-start-error">{errors.startAt.message}</p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="event-end">Ends</label>
          <input
            id="event-end"
            type="datetime-local"
            aria-invalid={Boolean(errors.endAt)}
            aria-describedby={errors.endAt ? 'event-end-error' : undefined}
            {...register('endAt', {
              required: 'Choose an end date and time.',
              validate: (value) =>
                new Date(value) > new Date(getValues('startAt')) ||
                'End time must be after the start time.',
            })}
          />
          {errors.endAt ? (
            <p className="field-error" id="event-end-error">{errors.endAt.message}</p>
          ) : null}
        </div>

        <div className="form-field event-form-field--wide">
          <div className="form-field__label-row">
            <label htmlFor="event-venue">Venue</label>
            <span>Optional</span>
          </div>
          <input
            id="event-venue"
            placeholder="Student activity centre"
            aria-invalid={Boolean(errors.venue)}
            aria-describedby={errors.venue ? 'event-venue-error' : undefined}
            {...register('venue', {
              maxLength: { value: 250, message: 'Venue must be 250 characters or fewer.' },
            })}
          />
          {errors.venue ? (
            <p className="field-error" id="event-venue-error">{errors.venue.message}</p>
          ) : null}
        </div>

        <div className="form-field event-form-field--wide">
          <div className="form-field__label-row">
            <label htmlFor="event-description">Description</label>
            <span>Optional</span>
          </div>
          <textarea
            id="event-description"
            rows={3}
            placeholder="What members should know about this event"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'event-description-error' : undefined}
            {...register('description', {
              maxLength: { value: 2000, message: 'Description must be 2,000 characters or fewer.' },
            })}
          />
          {errors.description ? (
            <p className="field-error" id="event-description-error">{errors.description.message}</p>
          ) : null}
        </div>

        <button className="button button--primary event-create-form__submit" type="submit" disabled={createMutation.isPending}>
          <CalendarPlus size={17} aria-hidden="true" />
          {createMutation.isPending ? 'Creating…' : role === 'ADMIN' ? 'Create event' : 'Submit for approval'}
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
