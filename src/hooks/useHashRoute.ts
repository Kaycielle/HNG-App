import { useEffect, useState } from 'react'

/*
  Tiny "router": the current page is stored in the URL after the # sign
  (e.g. http://localhost:5173/#/notes). That way refreshing the page keeps you
  on the same screen, and the browser's back/forward buttons work,
  without needing a routing library.
*/

export type Route = 'dashboard' | 'tasks' | 'notes' | 'timer'

const ROUTES: Route[] = ['dashboard', 'tasks', 'notes', 'timer']

function readRoute(): Route {
  const name = window.location.hash.replace(/^#\/?/, '')
  return ROUTES.includes(name as Route) ? (name as Route) : 'dashboard'
}

export function routeHref(route: Route): string {
  return `#/${route}`
}

export function navigate(route: Route) {
  window.location.hash = `/${route}`
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute)

  useEffect(() => {
    const onChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
