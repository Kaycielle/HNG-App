import { useState } from 'react'
import { TaskForm } from '../components/tasks/TaskForm'
import { TaskList } from '../components/tasks/TaskList'
import { TimerControls, TimerRing } from '../components/timer/TimerPanel'
import { Icon } from '../components/ui/Icon'
import { matchesFilter } from '../data/tasks'
import { noteDisplayTitle, notePreview, sortByRecent } from '../data/notes'
import { navigate, routeHref } from '../hooks/useHashRoute'
import type { NotesApi } from '../hooks/useNotes'
import type { TasksApi } from '../hooks/useTasks'
import type { TimerApi } from '../hooks/useTimer'
import { formatLongDate, formatRelativeTime } from '../lib/dates'
import type { Task } from '../types'
import '../styles/dashboard.css'

type DashboardPageProps = {
  tasks: TasksApi
  notes: NotesApi
  timer: TimerApi
  timerTask: Task | null
  today: string
  onStartTimer: (task: Task) => void
}

const RECENT_NOTES_COUNT = 3

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage({ tasks, notes, timer, timerTask, today, onStartTimer }: DashboardPageProps) {
  const [isAdding, setIsAdding] = useState(false)

  const remaining = tasks.tasks.filter((t) => !t.completed).length
  const completed = tasks.tasks.length - remaining
  // Today's tasks, with finished ones moved to the bottom.
  const todayTasks = tasks.tasks.filter((t) => matchesFilter(t, 'today', today))
  const todaySorted = [...todayTasks.filter((t) => !t.completed), ...todayTasks.filter((t) => t.completed)]
  const dueTodayRemaining = todayTasks.filter((t) => !t.completed).length
  const recentNotes = sortByRecent(notes.notes).slice(0, RECENT_NOTES_COUNT)

  return (
    <>
      <header className="page-header">
        <div>
          <h1>{greeting()}</h1>
          <p>{formatLongDate(today)}</p>
        </div>
        {!isAdding && (
          <button type="button" className="btn btn-primary" onClick={() => setIsAdding(true)}>
            <Icon name="plus" size={18} />
            Add task
          </button>
        )}
      </header>

      {isAdding && (
        <section className="card dashboard-add" aria-label="Add a task">
          <TaskForm
            submitLabel="Add task"
            defaultDueDate={today}
            autoFocus
            onSubmit={tasks.addTask}
            onCancel={() => setIsAdding(false)}
          />
        </section>
      )}

      <ul className="stat-row" aria-label="Task summary">
        <li className="stat">
          <span className="stat-value">{remaining}</span>
          <span className="stat-label">Remaining</span>
        </li>
        <li className="stat">
          <span className="stat-value">{completed}</span>
          <span className="stat-label">Completed</span>
        </li>
        <li className="stat">
          <span className="stat-value">{dueTodayRemaining}</span>
          <span className="stat-label">Due today</span>
        </li>
      </ul>

      <div className="dashboard-grid">
        <section className="card dashboard-today" aria-labelledby="today-heading">
          <div className="card-header">
            <h2 id="today-heading">Today</h2>
            <a className="card-link" href={routeHref('tasks')}>
              All tasks
            </a>
          </div>
          {todaySorted.length === 0 ? (
            <div className="empty-state">
              <strong>You’re all clear for today</strong>
              {remaining > 0
                ? 'Nothing is due today. Tasks with today’s due date will show up here.'
                : 'Add a task to plan your day.'}
            </div>
          ) : (
            <TaskList tasks={todaySorted} today={today} api={tasks} onStartTimer={onStartTimer} label="Today's tasks" />
          )}
        </section>

        <div className="dashboard-side">
          <section className={`card dashboard-timer is-${timer.status}`} aria-labelledby="timer-heading">
            <div className="card-header">
              <h2 id="timer-heading">Timer</h2>
              <a className="card-link" href={routeHref('timer')}>
                Open timer
              </a>
            </div>
            <div className="dashboard-timer-body">
              <TimerRing timer={timer} size="small" />
              <div className="dashboard-timer-info">
                <p className="dashboard-timer-task">
                  {timerTask ? (
                    <>
                      <span className="muted">Focusing on</span> <strong>{timerTask.title}</strong>
                    </>
                  ) : (
                    <span className="muted">No task linked</span>
                  )}
                </p>
                <TimerControls timer={timer} small />
              </div>
            </div>
          </section>

          <section className="card" aria-labelledby="notes-heading">
            <div className="card-header">
              <h2 id="notes-heading">Recent notes</h2>
              <a className="card-link" href={routeHref('notes')}>
                All notes
              </a>
            </div>
            {recentNotes.length === 0 ? (
              <p className="muted dashboard-notes-empty">No notes yet.</p>
            ) : (
              <ul className="dashboard-notes">
                {recentNotes.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      className="dashboard-note"
                      onClick={() => {
                        notes.selectNote(note.id)
                        navigate('notes')
                      }}
                    >
                      <span className="dashboard-note-title">{noteDisplayTitle(note)}</span>
                      <span className="dashboard-note-preview">{notePreview(note, 60)}</span>
                      <span className="dashboard-note-date">{formatRelativeTime(note.updatedAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="btn btn-sm dashboard-new-note"
              onClick={() => {
                notes.addNote()
                navigate('notes')
              }}
            >
              <Icon name="plus" size={16} />
              New note
            </button>
          </section>
        </div>
      </div>
    </>
  )
}
