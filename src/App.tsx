import { AppLayout } from './components/layout/AppLayout'
import { StorageNotice } from './components/ui/StorageNotice'
import { useHashRoute } from './hooks/useHashRoute'
import { useTasks } from './hooks/useTasks'
import { useToday } from './hooks/useToday'
import { DashboardPage } from './pages/DashboardPage'
import { NotesPage } from './pages/NotesPage'
import { TasksPage } from './pages/TasksPage'
import { TimerPage } from './pages/TimerPage'

/*
  The top of the app. Data lives here (not inside individual pages) so that
  it's shared: the dashboard, tasks page and timer all see the same tasks.
*/
function App() {
  const route = useHashRoute()
  const today = useToday()
  const tasks = useTasks()

  return (
    <AppLayout route={route}>
      <StorageNotice message={tasks.storageMessage} onDismiss={tasks.dismissStorageMessage} />

      {route === 'dashboard' && <DashboardPage />}
      {route === 'tasks' && <TasksPage api={tasks} today={today} />}
      {route === 'notes' && <NotesPage />}
      {route === 'timer' && <TimerPage />}
    </AppLayout>
  )
}

export default App
