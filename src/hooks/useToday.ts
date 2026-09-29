import { useEffect, useState } from 'react'
import { todayKey } from '../lib/dates'

/** Today's date as "YYYY-MM-DD". Updates automatically if the app is left open past midnight. */
export function useToday(): string {
  const [today, setToday] = useState(todayKey)

  useEffect(() => {
    const interval = window.setInterval(() => setToday(todayKey()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  return today
}
