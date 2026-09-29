import { useId, useState, type FormEvent } from 'react'
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, validateTaskInput, type TaskInputError } from '../../data/tasks'
import { currentTimeKey, describeDueDate, isValidDateKey, todayKey } from '../../lib/dates'
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

const EMPTY: TaskInput = { title: '', description: '', dueDate: null, dueTime: null, priority: null }

export function TaskForm({ initial, defaultDueDate = null, submitLabel, onSubmit, onCancel, autoFocus }: TaskFormProps) {
  const start = initial ?? { ...EMPTY, dueDate: defaultDueDate }
  const [title, setTitle] = useState(start.title)
  const [description, setDescription] = useState(start.description)
  const [dueDate, setDueDate] = useState(start.dueDate ?? '')
  const [dueTime, setDueTime] = useState(start.dueTime ?? '')
  const [priority, setPriority] = useState<Priority | ''>(start.priority ?? '')
  // Keep the form short: extra fields are hidden unless the task already uses them.
  const [showDetails, setShowDetails] = useState(Boolean(initial && (initial.description || initial.dueDate || initial.dueTime || initial.priority)))
  const [error, setError] = useState<TaskInputError | null>(null)
  const id = useId()
  const isEditing = Boolean(initial)
  const fieldIds = {
    title: `${id}-title`,
    description: `${id}-description`,
    dueDate: `${id}-due`,
    dueTime: `${id}-time`,
  }
  const errorId = `${id}-error`

  /** Put the cursor in a field once React has drawn it (the details panel may have just opened). */
  function focusField(field: TaskInputError['field']) {
    requestAnimationFrame(() => document.getElementById(fieldIds[field])?.focus())
  }

  /** Accessibility attributes that mark a field as the one with the problem. */
  function invalidProps(field: TaskInputError['field']) {
    return error?.field === field ? { 'aria-invalid': true, 'aria-describedby': errorId } : {}
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input: TaskInput = {
      title,
      description,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      priority: priority || null,
    }
    const problem = validateTaskInput(input)
    if (problem) {
      setError(problem)
      if (problem.field !== 'title') setShowDetails(true)
      focusField(problem.field)
      return
    }
    onSubmit(input)
    if (!isEditing) {
      // Clear the form for the next task, keeping the chosen due date and details panel.
      setTitle('')
      setDescription('')
      setDueTime('')
      setPriority('')
      setError(null)
      focusField('title')
    }
  }

  const errorMessage = (field: TaskInputError['field']) =>
    error?.field === field ? (
      <p id={errorId} className="field-error" role="alert">
        {error.message}
      </p>
    ) : null

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
          id={fieldIds.title}
          className="input"
          type="text"
          placeholder="What do you need to do?"
          value={title}
          maxLength={TITLE_MAX_LENGTH}
          autoFocus={autoFocus}
          {...invalidProps('title')}
          onChange={(event) => {
            setTitle(event.target.value)
            if (error?.field === 'title') setError(null)
          }}
        />
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>

      {errorMessage('title')}

      {showDetails ? (
        <div className="task-form-details">
          <div className="field field-wide">
            <label className="field-label" htmlFor={fieldIds.description}>
              Description <span className="optional">(optional)</span>
            </label>
            <textarea
              id={fieldIds.description}
              className="textarea"
              rows={2}
              maxLength={DESCRIPTION_MAX_LENGTH}
              value={description}
              {...invalidProps('description')}
              onChange={(event) => setDescription(event.target.value)}
            />
            {errorMessage('description')}
          </div>
          <div className="field">
            <label className="field-label" htmlFor={fieldIds.dueDate}>
              Due date <span className="optional">(optional)</span>
            </label>
            <input
              id={fieldIds.dueDate}
              className="input"
              type="date"
              value={dueDate}
              {...invalidProps('dueDate')}
              onChange={(event) => {
                setDueDate(event.target.value)
                if (error?.field === 'dueDate') setError(null)
              }}
            />
            {errorMessage('dueDate')}
          </div>
          <div className="field">
            <label className="field-label" htmlFor={fieldIds.dueTime}>
              Due time <span className="optional">(optional)</span>
            </label>
            <input
              id={fieldIds.dueTime}
              className="input"
              type="time"
              value={dueTime}
              {...invalidProps('dueTime')}
              onChange={(event) => {
                setDueTime(event.target.value)
                if (error?.field === 'dueTime') setError(null)
              }}
            />
            {errorMessage('dueTime')}
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
          <span className="task-form-hint">
            Due: {describeDueDate(dueDate, todayKey(), dueTime || null, currentTimeKey()).label}
          </span>
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
