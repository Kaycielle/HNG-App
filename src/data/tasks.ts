/*
  Task "repository": the only place that knows how tasks are created, validated and stored.
  To move to a real database later, this is the file to change. The rest of the app
  just calls these functions.
*/

import { isValidDateKey } from '../lib/dates'
import { createId } from '../lib/id'
import { asIsoDate, asString, isRecord, loadList, saveList, storageKey } from '../lib/storage'
import type { Priority, Task, TaskInput } from '../types'

const STORE_NAME = 'tasks'
const LABEL = 'tasks'

export const TASKS_STORAGE_KEY = storageKey(STORE_NAME)
export const TITLE_MAX_LENGTH = 200
export const DESCRIPTION_MAX_LENGTH = 2000

const PRIORITIES: Priority[] = ['low', 'medium', 'high']

export function loadTasks() {
  return loadList(STORE_NAME, sanitizeTask, LABEL)
}

export function saveTasks(tasks: Task[]) {
  return saveList(STORE_NAME, tasks, LABEL)
}

/** Check a task typed in by the user. Returns an error message, or null if it's valid. */
export function validateTaskInput(input: TaskInput): string | null {
  const title = input.title.trim()
  if (!title) return 'Please enter a task title.'
  if (title.length > TITLE_MAX_LENGTH) return `Keep the title under ${TITLE_MAX_LENGTH} characters.`
  if (input.description.length > DESCRIPTION_MAX_LENGTH) {
    return `Keep the description under ${DESCRIPTION_MAX_LENGTH} characters.`
  }
  if (input.dueDate !== null && !isValidDateKey(input.dueDate)) return 'Please pick a valid due date.'
  return null
}

export function createTask(input: TaskInput): Task {
  const now = new Date().toISOString()
  return {
    id: createId(),
    title: input.title.trim(),
    description: input.description.trim(),
    completed: false,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    dueDate: input.dueDate,
    priority: input.priority,
  }
}

/** Turn whatever was in storage into a valid Task, or null if it's unusable. */
function sanitizeTask(raw: unknown): Task | null {
  if (!isRecord(raw)) return null
  const id = asString(raw.id)
  const title = asString(raw.title).trim()
  if (!id || !title) return null

  const now = new Date().toISOString()
  const createdAt = asIsoDate(raw.createdAt, now)
  const completed = raw.completed === true
  return {
    id,
    title,
    description: asString(raw.description),
    completed,
    createdAt,
    updatedAt: asIsoDate(raw.updatedAt, createdAt),
    completedAt: completed ? asIsoDate(raw.completedAt, createdAt) : null,
    dueDate: isValidDateKey(raw.dueDate) ? raw.dueDate : null,
    priority: PRIORITIES.includes(raw.priority as Priority) ? (raw.priority as Priority) : null,
  }
}

// ---------- Filters ----------

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed'

export const TASK_FILTERS: { id: TaskFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
]

/**
 * - Today: due today (done or not), plus unfinished overdue tasks so nothing slips through.
 * - Upcoming: unfinished tasks due after today.
 */
export function matchesFilter(task: Task, filter: TaskFilter, today: string): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'today':
      return task.dueDate !== null && (task.dueDate === today || (task.dueDate < today && !task.completed))
    case 'upcoming':
      return task.dueDate !== null && task.dueDate > today && !task.completed
    case 'completed':
      return task.completed
  }
}
