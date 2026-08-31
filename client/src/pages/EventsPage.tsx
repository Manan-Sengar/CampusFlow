import { useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { eventQueryKeys, listClubEvents } from '../api/events.ts'
import { getErrorMessage } from '../api/http.ts'
import type { ClubOutletContext } from '../api/types.ts'
import { CreateEventForm } from '../components/events/CreateEventForm.tsx'
import { EventCard } from '../components/events/EventCard.tsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/StatePanel.tsx'

export function EventsPage() {
  const { club } = useOutletContext<ClubOutletContext>()
  const creatorRole = club.role === 'ADMIN' || club.role === 'LEAD' ? club.role : null
  const eventsQuery = useQuery({
    queryKey: eventQueryKeys.list(club.clubId),
    queryFn: () => listClubEvents(club.clubId),
  })
  const events = eventsQuery.data?.events ?? []

  return (
    <section className="directory-page">
      <div className="section-page-heading">
        <div>
          <p className="eyebrow">Plan and participate</p>
          <h1>Events</h1>
          <p>Follow upcoming activity, approval progress, staffing, and attendance.</p>
        </div>
        {eventsQuery.isSuccess ? (
          <p className="page-count">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </p>
        ) : null}
      </div>

      {creatorRole ? <CreateEventForm clubId={club.clubId} role={creatorRole} /> : null}

      {eventsQuery.isPending ? <LoadingState label="Loading club events…" /> : null}
      {eventsQuery.isError ? (
        <ErrorState
          title="Events couldn’t be loaded"
          description={getErrorMessage(eventsQuery.error)}
          onRetry={() => void eventsQuery.refetch()}
        />
      ) : null}
      {eventsQuery.isSuccess && events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          description={
            creatorRole
              ? 'Create the first event to begin planning with the club.'
              : 'Club events will appear here when an administrator or lead creates one.'
          }
        />
      ) : null}

      {events.length > 0 ? (
        <div className="event-grid">
          {events.map((event) => (
            <EventCard key={event.id} clubId={club.clubId} event={event} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
