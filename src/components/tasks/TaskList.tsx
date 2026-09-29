import { useState, type DragEvent } from 'react'
import type { TasksApi } from '../../hooks/useTasks'
import type { Task } from '../../types'
import { useToast } from '../ui/toastContext'
import { TaskItem, type DragProps } from './TaskItem'
import '../../styles/tasks.css'

type TaskListProps = {
  /** The tasks to show, already filtered, in display order. */
  tasks: Task[]
  today: string
  api: TasksApi
  /** Show drag handles and up/down buttons. */
  reorderable?: boolean
  onStartTimer?: (task: Task) => void
  label: string
}

type DropTarget = { id: string; position: 'before' | 'after' }

/** Put keyboard focus back on an element after React has re-rendered the list. */
function focusLater(selector: string, fallbackSelector?: string) {
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>(selector)
    if (el && !(el as HTMLButtonElement).disabled) el.focus()
    else if (fallbackSelector) document.querySelector<HTMLElement>(fallbackSelector)?.focus()
  })
}

export function TaskList({ tasks, today, api, reorderable = false, onStartTimer, label }: TaskListProps) {
  const showToast = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)
  const [announcement, setAnnouncement] = useState('')

  function announceMove(task: Task, newIndex: number) {
    setAnnouncement(`Moved "${task.title}" to position ${newIndex + 1} of ${tasks.length}.`)
  }

  function moveByOne(task: Task, index: number, direction: 'up' | 'down') {
    const neighbor = tasks[direction === 'up' ? index - 1 : index + 1]
    if (!neighbor) return
    api.moveTask(task.id, neighbor.id, direction === 'up' ? 'before' : 'after')
    announceMove(task, direction === 'up' ? index - 1 : index + 1)
    const other = direction === 'up' ? 'down' : 'up'
    focusLater(`[data-move-task="${task.id}:${direction}"]`, `[data-move-task="${task.id}:${other}"]`)
  }

  function handleDelete(task: Task, index: number) {
    const undo = api.deleteTask(task)
    showToast({ message: `Deleted "${task.title}".`, actionLabel: 'Undo', onAction: undo })
    // Keep keyboard focus in the list: move it to the next (or previous) task.
    const next = tasks[index + 1] ?? tasks[index - 1]
    if (next) focusLater(`#task-check-${CSS.escape(next.id)}`)
  }

  function dragPropsFor(task: Task): DragProps {
    return {
      draggable: editingId === null,
      onDragStart: (event: DragEvent<HTMLLIElement>) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', task.id)
        setDraggingId(task.id)
      },
      onDragOver: (event: DragEvent<HTMLLIElement>) => {
        if (!draggingId) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        const rect = event.currentTarget.getBoundingClientRect()
        const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
        if (dropTarget?.id !== task.id || dropTarget.position !== position) {
          setDropTarget({ id: task.id, position })
        }
      },
      onDrop: (event: DragEvent<HTMLLIElement>) => {
        event.preventDefault()
        const dragged = tasks.find((t) => t.id === draggingId)
        if (dragged && dropTarget && dragged.id !== dropTarget.id) {
          api.moveTask(dragged.id, dropTarget.id, dropTarget.position)
          const withoutDragged = tasks.filter((t) => t.id !== dragged.id)
          const targetIndex = withoutDragged.findIndex((t) => t.id === dropTarget.id)
          announceMove(dragged, dropTarget.position === 'before' ? targetIndex : targetIndex + 1)
        }
        setDraggingId(null)
        setDropTarget(null)
      },
      onDragEnd: () => {
        setDraggingId(null)
        setDropTarget(null)
      },
    }
  }

  return (
    <>
      <ul className="task-list" aria-label={label}>
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            today={today}
            isEditing={editingId === task.id}
            onStartEdit={() => setEditingId(task.id)}
            onFinishEdit={(input) => {
              if (input) api.updateTask(task.id, input)
              setEditingId(null)
              focusLater(`[data-edit-task="${task.id}"]`)
            }}
            onToggle={(completed) => api.setCompleted(task.id, completed)}
            onDelete={() => handleDelete(task, index)}
            onStartTimer={onStartTimer ? () => onStartTimer(task) : undefined}
            reorder={
              reorderable
                ? {
                    canMoveUp: index > 0,
                    canMoveDown: index < tasks.length - 1,
                    onMoveUp: () => moveByOne(task, index, 'up'),
                    onMoveDown: () => moveByOne(task, index, 'down'),
                    drag: dragPropsFor(task),
                    isDragging: draggingId === task.id,
                    dropPosition: dropTarget?.id === task.id && draggingId !== task.id ? dropTarget.position : null,
                  }
                : undefined
            }
          />
        ))}
      </ul>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </>
  )
}
