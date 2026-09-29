import { useState } from 'react'
import { TaskForm } from '../components/tasks/TaskForm'
import { TaskList } from '../components/tasks/TaskList'
import { matchesFilter, TASK_FILTERS, type TaskFilter } from '../data/tasks'
import type { TasksApi } from '../hooks/useTasks'
import type { Task } from '../types'

type TasksPageProps = {
  api: TasksApi
  today: string
  onStartTimer?: (task: Task) => void
}

const EMPTY_MESSAGES: Record<TaskFilter, { title: string; hint: string }> = {
  all: { title: 'No tasks yet', hint: 'Add your first task above to get started.' },
  today: { title: 'Nothing due today', hint: 'Tasks with today’s due date (or overdue ones) show up here.' },
  upcoming: { title: 'Nothing upcoming', hint: 'Give a task a future due date under “More options” to see it here.' },
  completed: { title: 'No completed tasks yet', hint: 'Tick a task’s checkbox when you finish it.' },
}

export function TasksPage({ api, today, onStartTimer }: TasksPageProps) {
  const [filter, setFilter] = useState<TaskFilter>('all')
  const activeCount = api.tasks.filter((task) => !task.completed).length
  const visible = api.tasks.filter((task) => matchesFilter(task, filter, today))
  const empty = EMPTY_MESSAGES[filter]

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Tasks</h1>
          <p aria-live="polite">
            {activeCount === 0 ? 'No active tasks' : `${activeCount} active ${activeCount === 1 ? 'task' : 'tasks'}`}
          </p>
        </div>
      </header>

      <section className="card tasks-card" aria-label="Task list">
        <TaskForm submitLabel="Add task" onSubmit={api.addTask} />

        <div className="filter-bar" role="group" aria-label="Filter tasks">
          {TASK_FILTERS.map(({ id, label }) => {
            const count = api.tasks.filter((task) => matchesFilter(task, id, today)).length
            return (
              <button
                key={id}
                type="button"
                className="filter-btn"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
              >
                {label}
                <span className="filter-count" aria-label={`, ${count} tasks`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {visible.length === 0 ? (
          <div className="empty-state">
            <strong>{empty.title}</strong>
            {empty.hint}
          </div>
        ) : (
          <TaskList
            tasks={visible}
            today={today}
            api={api}
            reorderable
            onStartTimer={onStartTimer}
            label={`${TASK_FILTERS.find((f) => f.id === filter)?.label} tasks`}
          />
        )}
      </section>
    </>
  )
}
