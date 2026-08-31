import { ArrowUpRight, CalendarClock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ClubEvent } from '../../api/types.ts'
import { formatEventDateRange } from '../../utils/formatDate.ts'
import { EventStatusBadge, EventVisibilityBadge } from './EventBadges.tsx'

interface EventCardProps {
  clubId: string
  event: ClubEvent
}

export function EventCard({ clubId, event }: EventCardProps) {
  return (
    <article className="event-card">
      <div className="event-card__badges">
        <EventStatusBadge status={event.status} />
        <EventVisibilityBadge visibility={event.visibility} />
      </div>

      <div className="event-card__body">
        <h2>
          <Link to={`/clubs/${clubId}/events/${event.id}`}>{event.title}</Link>
        </h2>
        <p>{event.description || 'No event description has been added.'}</p>
      </div>

      <dl className="event-card__details">
        <div>
          <CalendarClock size={17} aria-hidden="true" />
          <dt>Schedule</dt>
          <dd>{formatEventDateRange(event.startAt, event.endAt)}</dd>
        </div>
        <div>
          <MapPin size={17} aria-hidden="true" />
          <dt>Venue</dt>
          <dd>{event.venue || 'Venue to be confirmed'}</dd>
        </div>
      </dl>

      <Link className="event-card__action" to={`/clubs/${clubId}/events/${event.id}`}>
        View event
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </article>
  )
}
