import { AppLayout } from './components/layout/AppLayout'
import { useHashRoute } from './hooks/useHashRoute'
import { DashboardPage } from './pages/DashboardPage'
import { NotesPage } from './pages/NotesPage'
import { TasksPage } from './pages/TasksPage'
import { TimerPage } from './pages/TimerPage'

function App() {
  const route = useHashRoute()

  return (
    <AppLayout route={route}>
      {route === 'dashboard' && <DashboardPage />}
      {route === 'tasks' && <TasksPage />}
      {route === 'notes' && <NotesPage />}
      {route === 'timer' && <TimerPage />}
    </AppLayout>
  )
}

export default App
