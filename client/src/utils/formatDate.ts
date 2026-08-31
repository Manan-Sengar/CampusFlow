const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
})

export function formatShortDate(value: string) {
  return dateFormatter.format(new Date(value))
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value))
}

export function formatEventDateRange(startAt: string, endAt: string) {
  const start = new Date(startAt)
  const end = new Date(endAt)
  const sameDay = start.toDateString() === end.toDateString()

  if (sameDay) {
    return `${dateFormatter.format(start)}, ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`
  }

  return `${dateTimeFormatter.format(start)} – ${dateTimeFormatter.format(end)}`
}
