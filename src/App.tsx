import { useCallback, useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { TimerFinishedBanner } from './components/timer/TimerFinishedBanner'
import { StorageNotice } from './components/ui/StorageNotice'
import { navigate, useHashRoute } from './hooks/useHashRoute'
import { useNotes } from './hooks/useNotes'
import { useTasks } from './hooks/useTasks'
import { formatClock, formatDuration, useTimer } from './hooks/useTimer'
import { useToday } from './hooks/useToday'
import { playChime, showBrowserNotification } from './lib/notify'
import { DashboardPage } from './pages/DashboardPage'
import { NotesPage } from './pages/NotesPage'
import { TasksPage } from './pages/TasksPage'
import { TimerPage } from './pages/TimerPage'
import type { Task } from './types'

const APP_TITLE = 'Kay To-Do'

/*
  The top of the app. Data lives here (not inside individual pages) so that
  it's shared: the dashboard, tasks page and timer all see the same tasks,
  and the timer keeps running when you switch pages.
*/
function App() {
  const route = useHashRoute()
  const today = useToday()
  const tasks = useTasks()
  const notes = useNotes()

  const findTask = useCallback((id: string | null) => tasks.tasks.find((t) => t.id === id) ?? null, [tasks.tasks])

  const handleTimerFinished = useCallback(
    (taskId: string | null, durationMs: number) => {
      playChime()
      const task = findTask(taskId)
      showBrowserNotification(
        'Time’s up!',
        task ? `${formatDuration(durationMs)} on “${task.title}” is done.` : `Your ${formatDuration(durationMs)} timer is done.`,
      )
    },
    [findTask],
  )

  const timer = useTimer({ onFinish: handleTimerFinished })
  const timerTask = findTask(timer.taskId)
  const activeTasks = tasks.tasks.filter((t) => !t.completed)
  const timerIsActive = timer.status === 'running' || timer.status === 'paused'

  // Each page starts at the top, like a normal website.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  // Show the countdown in the browser tab title so it's visible from other tabs.
  useEffect(() => {
    if (timer.status === 'running') document.title = `${formatClock(timer.remainingMs)} · ${APP_TITLE}`
    else if (timer.status === 'finished') document.title = `Time’s up! · ${APP_TITLE}`
    else document.title = APP_TITLE
  }, [timer.status, timer.remainingMs])

  function startTimerForTask(task: Task) {
    timer.setTaskId(task.id)
    if (timer.status !== 'running' && timer.status !== 'paused') timer.start()
    navigate('timer')
  }

  return (
    <AppLayout route={route} timerBadge={timerIsActive ? formatClock(timer.remainingMs) : undefined}>
      <StorageNotice message={tasks.storageMessage} onDismiss={tasks.dismissStorageMessage} />
      <StorageNotice message={notes.storageMessage} onDismiss={notes.dismissStorageMessage} />
      <TimerFinishedBanner
        timer={timer}
        task={timerTask}
        onCompleteTask={(task) => tasks.setCompleted(task.id, true)}
      />

      {route === 'dashboard' && (
        <DashboardPage
          tasks={tasks}
          notes={notes}
          timer={timer}
          timerTask={timerTask}
          today={today}
          onStartTimer={startTimerForTask}
        />
      )}
      {route === 'tasks' && <TasksPage api={tasks} today={today} onStartTimer={startTimerForTask} />}
      {route === 'notes' && <NotesPage api={notes} />}
      {route === 'timer' && <TimerPage timer={timer} activeTasks={activeTasks} task={timerTask} />}
    </AppLayout>
  )
}

export default App
