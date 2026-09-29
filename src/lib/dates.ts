/*
  Date helpers.
  Due dates are stored as "YYYY-MM-DD" in the user's local time zone, which is
  exactly what an <input type="date"> produces.
*/

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function isValidDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = parseDateKey(value)
  return toDateKey(date) === value
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, days: number): string {
  const date = parseDateKey(key)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

export type DueTone = 'overdue' | 'today' | 'soon' | 'later'

/** A friendly label for a due date, e.g. "Today", "Tomorrow", "Overdue · Sep 27", "Fri, Oct 3". */
export function describeDueDate(dueDate: string, today: string): { label: string; tone: DueTone } {
  const date = parseDateKey(dueDate)
  const sameYear = dueDate.slice(0, 4) === today.slice(0, 4)
  const formatted = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })

  if (dueDate < today) return { label: `Overdue · ${formatted}`, tone: 'overdue' }
  if (dueDate === today) return { label: 'Today', tone: 'today' }
  if (dueDate === addDays(today, 1)) return { label: 'Tomorrow', tone: 'soon' }
  return { label: formatted, tone: 'later' }
}

/** Short date for a timestamp, e.g. "Sep 29" or "Sep 29, 2025". */
export function formatShortDate(iso: string): string {
  const date = new Date(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  })
}

/** "Just now", "5 min ago", "3:04 PM" or "Sep 29". */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  if (diffMs < 60_000) return 'Just now'
  if (diffMs < 60 * 60_000) return `${Math.floor(diffMs / 60_000)} min ago`
  if (toDateKey(date) === todayKey()) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  return formatShortDate(iso)
}
