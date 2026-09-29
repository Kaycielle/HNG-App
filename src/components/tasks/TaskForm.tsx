import { useId, useRef, useState, type FormEvent } from 'react'
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, validateTaskInput } from '../../data/tasks'
import { describeDueDate, isValidDateKey, todayKey } from '../../lib/dates'
import type { Priority, TaskInput } from '../../types'

type TaskFormProps = {
  /** Values to start with when editing an existing task. */
  initial?: TaskInput
  /** Pre-filled due date for new tasks (e.g. today, when adding from the dashboard). */
  defaultDueDate?: string | null
  submitLabel: string
  onSubmit: (input: TaskInput) => void
  onCancel?: () => void
  autoFocus?: boolean
}

const EMPTY: TaskInput = { title: '', description: '', dueDate: null, priority: null }

export function TaskForm({ initial, defaultDueDate = null, submitLabel, onSubmit, onCancel, autoFocus }: TaskFormProps) {
  const start = initial ?? { ...EMPTY, dueDate: defaultDueDate }
  const [title, setTitle] = useState(start.title)
  const [description, setDescription] = useState(start.description)
  const [dueDate, setDueDate] = useState(start.dueDate ?? '')
  const [priority, setPriority] = useState<Priority | ''>(start.priority ?? '')
  // Keep the form short: extra fields are hidden unless the task already uses them.
  const [showDetails, setShowDetails] = useState(Boolean(initial && (initial.description || initial.dueDate || initial.priority)))
  const [error, setError] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const isEditing = Boolean(initial)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input: TaskInput = {
      title,
      description,
      dueDate: dueDate || null,
      priority: priority || null,
    }
    const problem = validateTaskInput(input)
    if (problem) {
      setError(problem)
      titleRef.current?.focus()
      return
    }
    onSubmit(input)
    if (!isEditing) {
      // Clear the form for the next task, keeping the chosen due date and details panel.
      setTitle('')
      setDescription('')
      setPriority('')
      setError(null)
      titleRef.current?.focus()
    }
  }

  return (
    <form
      className={`task-form${isEditing ? ' is-editing' : ''}`}
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && onCancel) onCancel()
      }}
      noValidate
    >
      <div className="task-form-row">
        <label className="visually-hidden" htmlFor={`${id}-title`}>
          Task title
        </label>
        <input
          ref={titleRef}
          id={`${id}-title`}
          className="input"
          type="text"
          placeholder="What do you need to do?"
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            setTitle(event.target.value)
            if (error) setError(null)
          }}
        />
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>

      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}

      {showDetails ? (
        <div className="task-form-details">
          <div className="field field-wide">
            <label className="field-label" htmlFor={`${id}-description`}>
              Description <span className="optional">(optional)</span>
            </label>
            <textarea
              id={`${id}-description`}
              className="textarea"
              rows={2}
              maxLength={DESCRIPTION_MAX_LENGTH}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor={`${id}-due`}>
              Due date <span className="optional">(optional)</span>
            </label>
            <input
              id={`${id}-due`}
              className="input"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor={`${id}-priority`}>
              Priority <span className="optional">(optional)</span>
            </label>
            <select
              id={`${id}-priority`}
              className="select"
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority | '')}
            >
              <option value="">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      ) : null}

      <div className="task-form-footer">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-expanded={showDetails}
          onClick={() => setShowDetails((value) => !value)}
        >
          {showDetails ? 'Hide options' : 'More options'}
        </button>
        {!showDetails && dueDate && isValidDateKey(dueDate) && (
          <span className="task-form-hint">Due: {describeDueDate(dueDate, todayKey()).label}</span>
        )}
        {onCancel && (
          <button type="button" className="btn btn-sm" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
