import { formatDuration, type TimerApi } from '../../hooks/useTimer'
import type { Task } from '../../types'
import { Icon } from '../ui/Icon'
import '../../styles/timer.css'

type TimerFinishedBannerProps = {
  timer: TimerApi
  task: Task | null
  onCompleteTask: (task: Task) => void
}

/** Shown at the top of every page when the timer reaches zero, until dismissed. */
export function TimerFinishedBanner({ timer, task, onCompleteTask }: TimerFinishedBannerProps) {
  if (timer.status !== 'finished') return null

  return (
    <div className="timer-banner" role="alert">
      <Icon name="bell" size={22} />
      <p className="timer-banner-text">
        <strong>Time’s up!</strong>
        {timer.finishedWhileAway ? 'Your timer finished while you were away' : `Your ${formatDuration(timer.durationMs)} timer is done`}
        {task ? ` (${task.title}).` : '.'}
      </p>
      <div className="timer-banner-actions">
        {task && !task.completed && (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              onCompleteTask(task)
              timer.reset()
            }}
          >
            <Icon name="check" size={16} />
            Mark task complete
          </button>
        )}
        <button type="button" className="btn btn-sm" onClick={timer.start}>
          Start again
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={timer.reset}>
          Dismiss
        </button>
      </div>
    </div>
  )
}
