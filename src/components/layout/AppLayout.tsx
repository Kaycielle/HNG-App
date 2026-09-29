import type { ReactNode } from 'react'
import { routeHref, type Route } from '../../hooks/useHashRoute'
import { Icon, type IconName } from '../ui/Icon'
import '../../styles/layout.css'

const NAV_ITEMS: { route: Route; label: string; icon: IconName }[] = [
  { route: 'dashboard', label: 'Dashboard', icon: 'home' },
  { route: 'tasks', label: 'Tasks', icon: 'tasks' },
  { route: 'notes', label: 'Notes', icon: 'notes' },
  { route: 'timer', label: 'Timer', icon: 'timer' },
]

type AppLayoutProps = {
  route: Route
  /** Small text shown next to "Timer" in the nav while a timer is running, e.g. "12:34". */
  timerBadge?: string
  children: ReactNode
}

export function AppLayout({ route, timerBadge, children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Icon name="check" size={16} />
          </span>
          <span className="brand-name">Kay To-Do</span>
        </div>

        <nav aria-label="Main">
          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.route}>
                <a
                  className="nav-link"
                  href={routeHref(item.route)}
                  aria-current={route === item.route ? 'page' : undefined}
                >
                  <Icon name={item.icon} size={20} />
                  <span className="nav-label">{item.label}</span>
                  {item.route === 'timer' && timerBadge && (
                    <span className="nav-badge">
                      <span className="visually-hidden">Timer running, </span>
                      {timerBadge}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main id="main-content" className="main" tabIndex={-1}>
        <div className="main-inner">{children}</div>
      </main>
    </div>
  )
}
