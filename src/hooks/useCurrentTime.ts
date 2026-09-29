import { useEffect, useState } from 'react'
import { currentTimeKey } from '../lib/dates'

/**
 * The current time as "HH:MM", refreshed every 30 seconds.
 * Used to mark tasks as overdue once their due time has passed.
 */
export function useCurrentTime(): string {
  const [time, setTime] = useState(currentTimeKey)

  useEffect(() => {
    const interval = window.setInterval(() => setTime(currentTimeKey()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  return time
}
