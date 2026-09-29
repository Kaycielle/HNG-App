import { useId, useState, type FormEvent } from 'react'
import {
  formatClock,
  formatDuration,
  MAX_DURATION_MIN,
  MIN_DURATION_MIN,
  TIMER_PRESETS_MIN,
  type TimerApi,
  type TimerStatus,
} from '../../hooks/useTimer'
import type { Task } from '../../types'
import '../../styles/timer.css'

const STATUS_LABELS: Record<TimerStatus, string> = {
  idle: 'Ready',
  running: 'Running',
  paused: 'Paused',
  finished: 'Time’s up',
}

type TimerPanelProps = {
  timer: TimerApi
  /** Unfinished tasks the timer can be linked to. */
  tasks: Task[]
  /** The linked task, if any (looked up by the parent). */
  task: Task | null
}

export function TimerPanel({ timer, tasks, task }: TimerPanelProps) {
  const id = useId()
  const [customMinutes, setCustomMinutes] = useState('')
  const [customError, setCustomError] = useState<string | null>(null)
  const { status } = timer
  const isRunning = status === 'running'
  const durationMinutes = timer.durationMs / 60_000

  function handleCustomSubmit(event: FormEvent) {
    event.preventDefault()
    const minutes = Number(customMinutes)
    if (customMinutes.trim() === '' || !Number.isInteger(minutes)) {
      setCustomError('Enter a whole number of minutes.')
      return
    }
    if (minutes < MIN_DURATION_MIN || minutes > MAX_DURATION_MIN) {
      setCustomError(`Choose between ${MIN_DURATION_MIN} and ${MAX_DURATION_MIN} minutes.`)
      return
    }
    setCustomError(null)
    timer.setDuration(minutes)
    setCustomMinutes('')
  }

  return (
    <div className={`timer-panel is-${status}`}>
      <TimerRing timer={timer} />

      <p className="timer-focus">
        {task ? (
          <>
            <span className="muted">Focusing on</span> <strong>{task.title}</strong>
          </>
        ) : (
          <span className="muted">{formatDuration(timer.durationMs)} session</span>
        )}
      </p>

      <TimerControls timer={timer} />

      <div className="timer-settings">
        <fieldset className="timer-fieldset" disabled={isRunning}>
          <legend className="field-label">Duration</legend>
          <div className="preset-row">
            {TIMER_PRESETS_MIN.map((minutes) => (
              <button
                key={minutes}
                type="button"
                className="preset-btn"
                aria-pressed={durationMinutes === minutes}
                onClick={() => timer.setDuration(minutes)}
              >
                {minutes} min
              </button>
            ))}
          </div>

          <form className="custom-duration" onSubmit={handleCustomSubmit} noValidate>
            <label className="field-label" htmlFor={`${id}-custom`}>
              Custom (minutes)
            </label>
            <div className="custom-duration-row">
              <input
                id={`${id}-custom`}
                className="input"
                type="number"
                inputMode="numeric"
                min={MIN_DURATION_MIN}
                max={MAX_DURATION_MIN}
                step={1}
                placeholder={`${MIN_DURATION_MIN}–${MAX_DURATION_MIN}`}
                value={customMinutes}
                aria-invalid={customError ? true : undefined}
                aria-describedby={customError ? `${id}-custom-error` : undefined}
                onChange={(event) => {
                  setCustomMinutes(event.target.value)
                  if (customError) setCustomError(null)
                }}
              />
              <button type="submit" className="btn">
                Set
              </button>
            </div>
            {customError && (
              <p id={`${id}-custom-error`} className="field-error" role="alert">
                {customError}
              </p>
            )}
          </form>
          {isRunning && <p className="timer-hint">Pause or reset the timer to change its length.</p>}
        </fieldset>

        <div className="field">
          <label className="field-label" htmlFor={`${id}-task`}>
            Focus on a task <span className="optional">(optional)</span>
          </label>
          <select
            id={`${id}-task`}
            className="select"
            value={task?.id ?? ''}
            onChange={(event) => timer.setTaskId(event.target.value || null)}
          >
            <option value="">No task</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          {tasks.length === 0 && <p className="timer-hint">Add tasks on the Tasks page to link one here.</p>}
        </div>
      </div>
    </div>
  )
}

/** The circular countdown display. */
export function TimerRing({ timer, size = 'large' }: { timer: TimerApi; size?: 'large' | 'small' }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const fraction = timer.durationMs > 0 ? timer.remainingMs / timer.durationMs : 0
  const clock = formatClock(timer.remainingMs)

  return (
    <div className={`timer-ring timer-ring-${size}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="timer-ring-track" cx="60" cy="60" r={radius} />
        <circle
          className="timer-ring-progress"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
      </svg>
      <div className="timer-readout">
        <span className="timer-time" role="timer" aria-label={`${clock} remaining`}>
          {clock}
        </span>
        <span className="timer-status">
          <span className="timer-status-dot" aria-hidden="true" />
          {STATUS_LABELS[timer.status]}
        </span>
      </div>
    </div>
  )
}

/** Start / Pause / Resume and Reset buttons. */
export function TimerControls({ timer, small = false }: { timer: TimerApi; small?: boolean }) {
  const { status } = timer
  const sizeClass = small ? ' btn-sm' : ''
  const atFullDuration = status === 'idle' && timer.remainingMs === timer.durationMs

  return (
    <div className="timer-controls">
      {status === 'running' ? (
        <button type="button" className={`btn btn-primary timer-main-btn${sizeClass}`} onClick={timer.pause}>
          Pause
        </button>
      ) : (
        <button type="button" className={`btn btn-primary timer-main-btn${sizeClass}`} onClick={timer.start}>
          {status === 'paused' ? 'Resume' : status === 'finished' ? 'Start again' : 'Start'}
        </button>
      )}
      <button type="button" className={`btn${sizeClass}`} onClick={timer.reset} disabled={atFullDuration}>
        Reset
      </button>
    </div>
  )
}
