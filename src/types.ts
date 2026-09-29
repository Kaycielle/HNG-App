/*
  The shapes of the data this app stores.
  These are deliberately plain (strings, booleans, numbers) so the same records
  could later be stored in a database or sent to a server without changes.
*/

export type Priority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  title: string
  description: string
  completed: boolean
  /** ISO timestamp, e.g. "2026-09-29T14:03:00.000Z" */
  createdAt: string
  updatedAt: string
  completedAt: string | null
  /** Calendar date without a time, e.g. "2026-09-30". */
  dueDate: string | null
  /** Optional time of day on the due date, 24-hour "HH:MM" (e.g. "14:30"). Only set when dueDate is set. */
  dueTime: string | null
  priority: Priority | null
}

/** The fields a user fills in when creating or editing a task. */
export type TaskInput = {
  title: string
  description: string
  dueDate: string | null
  dueTime: string | null
  priority: Priority | null
}

export type Note = {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}
