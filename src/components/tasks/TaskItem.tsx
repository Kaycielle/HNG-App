import type { DragEvent } from 'react'
import { describeDueDate, formatShortDate } from '../../lib/dates'
import type { Task, TaskInput } from '../../types'
import { Icon } from '../ui/Icon'
import { TaskForm } from './TaskForm'

const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' } as const

export type DragProps = {
  draggable: boolean
  onDragStart: (event: DragEvent<HTMLLIElement>) => void
  onDragOver: (event: DragEvent<HTMLLIElement>) => void
  onDrop: (event: DragEvent<HTMLLIElement>) => void
  onDragEnd: () => void
}

type TaskItemProps = {
  task: Task
  today: string
  isEditing: boolean
  onStartEdit: () => void
  onFinishEdit: (input: TaskInput | null) => void
  onToggle: (completed: boolean) => void
  onDelete: () => void
  onStartTimer?: () => void
  /** Present only when the list can be reordered. */
  reorder?: {
    canMoveUp: boolean
    canMoveDown: boolean
    onMoveUp: () => void
    onMoveDown: () => void
    drag: DragProps
    isDragging: boolean
    dropPosition: 'before' | 'after' | null
  }
}

export function TaskItem({
  task,
  today,
  isEditing,
  onStartEdit,
  onFinishEdit,
  onToggle,
  onDelete,
  onStartTimer,
  reorder,
}: TaskItemProps) {
  const checkboxId = `task-check-${task.id}`
  const classes = [
    'task-item',
    task.completed && 'is-completed',
    reorder?.isDragging && 'is-dragging',
    reorder?.dropPosition && `drop-${reorder.dropPosition}`,
  ]
    .filter(Boolean)
    .join(' ')

  if (isEditing) {
    return (
      <li className="task-item is-editing">
        <TaskForm
          initial={{
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
          }}
          submitLabel="Save"
          autoFocus
          onSubmit={(input) => onFinishEdit(input)}
          onCancel={() => onFinishEdit(null)}
        />
      </li>
    )
  }

  const due = task.dueDate ? describeDueDate(task.dueDate, today) : null

  return (
    <li className={classes} data-task-id={task.id} {...reorder?.drag}>
      {reorder && (
        <span className="drag-handle" title="Drag to reorder" aria-hidden="true">
          <Icon name="grip" size={16} />
        </span>
      )}

      <input
        id={checkboxId}
        className="task-check"
        type="checkbox"
        checked={task.completed}
        onChange={(event) => onToggle(event.target.checked)}
      />

      <div className="task-body">
        <label className="task-title" htmlFor={checkboxId}>
          {task.title}
        </label>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          {due && (
            <span className={`chip chip-due-${task.completed ? 'done' : due.tone}`}>
              <Icon name="calendar" size={13} />
              <span className="visually-hidden">Due </span>
              {due.label}
            </span>
          )}
          {task.priority && (
            <span className={`chip chip-priority-${task.priority}`}>
              <Icon name="flag" size={13} />
              {PRIORITY_LABELS[task.priority]}
              <span className="visually-hidden"> priority</span>
            </span>
          )}
          <span className="task-created">Added {formatShortDate(task.createdAt)}</span>
        </div>
      </div>

      <div className="task-actions">
        {onStartTimer && !task.completed && (
          <button type="button" className="icon-btn" aria-label={`Start timer for "${task.title}"`} title="Start timer" onClick={onStartTimer}>
            <Icon name="timer" />
          </button>
        )}
        <button
          type="button"
          className="icon-btn"
          data-edit-task={task.id}
          aria-label={`Edit "${task.title}"`}
          title="Edit"
          onClick={onStartEdit}
        >
          <Icon name="edit" />
        </button>
        <button type="button" className="icon-btn danger" aria-label={`Delete "${task.title}"`} title="Delete" onClick={onDelete}>
          <Icon name="trash" />
        </button>
        {reorder && (
          <>
            <button
              type="button"
              className="icon-btn"
              data-move-task={`${task.id}:up`}
              aria-label={`Move "${task.title}" up`}
              title="Move up"
              disabled={!reorder.canMoveUp}
              onClick={reorder.onMoveUp}
            >
              <Icon name="up" />
            </button>
            <button
              type="button"
              className="icon-btn"
              data-move-task={`${task.id}:down`}
              aria-label={`Move "${task.title}" down`}
              title="Move down"
              disabled={!reorder.canMoveDown}
              onClick={reorder.onMoveDown}
            >
              <Icon name="down" />
            </button>
          </>
        )}
      </div>
    </li>
  )
}
