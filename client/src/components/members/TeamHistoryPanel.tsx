import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Clock3 } from 'lucide-react'
import { useState } from 'react'
import { getErrorMessage } from '../../api/http.ts'
import { getMemberTeamHistory, memberQueryKeys } from '../../api/members.ts'
import { formatShortDate } from '../../utils/formatDate.ts'

interface TeamHistoryPanelProps {
  clubId: string
  membershipId: string
}

export function TeamHistoryPanel({ clubId, membershipId }: TeamHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const historyQuery = useQuery({
    queryKey: memberQueryKeys.history(clubId, membershipId),
    queryFn: () => getMemberTeamHistory(clubId, membershipId),
    enabled: isOpen,
  })

  return (
    <div className="history-panel">
      <button
        className="history-panel__toggle"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Clock3 size={16} aria-hidden="true" />
        Team history
        {isOpen ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
      </button>

      {isOpen ? (
        <div className="history-panel__content">
          {historyQuery.isPending ? <p>Loading team history…</p> : null}
          {historyQuery.isError ? (
            <div className="inline-error" role="alert">
              <p>{getErrorMessage(historyQuery.error)}</p>
              <button type="button" onClick={() => void historyQuery.refetch()}>
                Try again
              </button>
            </div>
          ) : null}
          {historyQuery.isSuccess && historyQuery.data.history.length === 0 ? (
            <p>No primary-team assignments yet.</p>
          ) : null}
          {historyQuery.data?.history.length ? (
            <ol className="history-list">
              {historyQuery.data.history.map((entry) => (
                <li key={entry.assignmentId}>
                  <div>
                    <strong>{entry.teamName}</strong>
                    <span>
                      {formatShortDate(entry.startedAt)}
                      {entry.endedAt ? ` – ${formatShortDate(entry.endedAt)}` : ' – present'}
                    </span>
                  </div>
                  <span className={entry.endedAt ? 'history-state' : 'history-state history-state--current'}>
                    {entry.endedAt ? 'Previous' : 'Current'}
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
