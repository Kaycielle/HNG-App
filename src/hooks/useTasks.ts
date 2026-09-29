import { useCallback } from 'react'
import { createTask, loadTasks, saveTasks, TASKS_STORAGE_KEY } from '../data/tasks'
import type { Task, TaskInput } from '../types'
import { usePersistedList } from './usePersistedList'

/*
  All task state and actions live here. Components call these functions
  instead of changing the task list directly.
  The list's order IS the user's manual order, so reordering just moves items in the array.
*/
export function useTasks() {
  const { items: tasks, setItems, storageMessage, dismissStorageMessage } = usePersistedList(
    loadTasks,
    saveTasks,
    TASKS_STORAGE_KEY,
  )

  const addTask = useCallback(
    (input: TaskInput) => {
      const task = createTask(input)
      // New tasks go to the top so you can see them right away.
      setItems((current) => [task, ...current])
      return task
    },
    [setItems],
  )

  const updateTask = useCallback(
    (id: string, input: TaskInput) => {
      setItems((current) =>
        current.map((task) =>
          task.id === id
            ? {
                ...task,
                title: input.title.trim(),
                description: input.description.trim(),
                dueDate: input.dueDate,
                priority: input.priority,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      )
    },
    [setItems],
  )

  const setCompleted = useCallback(
    (id: string, completed: boolean) => {
      const now = new Date().toISOString()
      setItems((current) =>
        current.map((task) =>
          task.id === id ? { ...task, completed, completedAt: completed ? now : null, updatedAt: now } : task,
        ),
      )
    },
    [setItems],
  )

  /** Removes a task and returns what's needed to undo the deletion. */
  const deleteTask = useCallback(
    (task: Task) => {
      let index = -1
      setItems((current) => {
        index = current.findIndex((t) => t.id === task.id)
        return current.filter((t) => t.id !== task.id)
      })
      return () =>
        setItems((current) => {
          if (current.some((t) => t.id === task.id)) return current
          const next = [...current]
          next.splice(index < 0 ? 0 : Math.min(index, next.length), 0, task)
          return next
        })
    },
    [setItems],
  )

  /** Move a task so it sits directly before or after another task. */
  const moveTask = useCallback(
    (id: string, targetId: string, position: 'before' | 'after') => {
      if (id === targetId) return
      setItems((current) => {
        const moving = current.find((t) => t.id === id)
        if (!moving) return current
        const rest = current.filter((t) => t.id !== id)
        const targetIndex = rest.findIndex((t) => t.id === targetId)
        if (targetIndex < 0) return current
        rest.splice(position === 'before' ? targetIndex : targetIndex + 1, 0, moving)
        return rest
      })
    },
    [setItems],
  )

  return { tasks, addTask, updateTask, setCompleted, deleteTask, moveTask, storageMessage, dismissStorageMessage }
}

export type TasksApi = ReturnType<typeof useTasks>
