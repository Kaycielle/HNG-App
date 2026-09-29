import { useState } from 'react'
import { TimerPanel } from '../components/timer/TimerPanel'
import type { TimerApi } from '../hooks/useTimer'
import { notificationSupport, requestNotificationPermission } from '../lib/notify'
import type { Task } from '../types'

type TimerPageProps = {
  timer: TimerApi
  activeTasks: Task[]
  task: Task | null
}

export function TimerPage({ timer, activeTasks, task }: TimerPageProps) {
  return (
    <>
      <header className="page-header">
        <div>
          <h1>Timer</h1>
          <p>Pick a length, press Start and focus. It keeps running while you use the rest of the app.</p>
        </div>
      </header>

      <section className="card" aria-label="Focus timer">
        <TimerPanel timer={timer} tasks={activeTasks} task={task} />
      </section>

      <NotificationSetting />
    </>
  )
}

/** Optional: ask permission to show a desktop notification when the timer ends. */
function NotificationSetting() {
  const [support, setSupport] = useState(notificationSupport)

  let content
  if (support === 'unsupported') {
    content = <span className="muted">Desktop notifications aren’t available in this browser. You’ll still see and hear an alert here.</span>
  } else if (support === 'granted') {
    content = <span className="muted">Desktop notifications are on. You’ll be notified even if this tab is in the background.</span>
  } else if (support === 'denied') {
    content = (
      <span className="muted">
        Desktop notifications are blocked. You can allow them in your browser’s site settings. You’ll still see and hear an
        alert here.
      </span>
    )
  } else {
    content = (
      <>
        <span className="muted">Get a desktop notification when time’s up, even if this tab is in the background.</span>
        <button type="button" className="btn btn-sm" onClick={async () => setSupport(await requestNotificationPermission())}>
          Enable notifications
        </button>
      </>
    )
  }

  return <div className="notify-setting card timer-notify-card">{content}</div>
}
