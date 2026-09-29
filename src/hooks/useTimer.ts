import { useCallback, useEffect, useRef, useState } from 'react'
import { isRecord, loadValue, saveValueQuietly } from '../lib/storage'
import { prepareSound } from '../lib/notify'

/*
  A countdown timer that stays accurate.

  Instead of subtracting one second at a time (which drifts, because browsers slow
  down timers in background tabs), we remember the exact moment the timer should
  end (`endsAt`) and calculate "time left = endsAt - now" whenever we display it.
  The timer state is saved, so it even survives a page refresh.
*/

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

type TimerState = {
  /** The chosen length of the timer. Also remembered as the user's preference. */
  durationMs: number
  status: TimerStatus
  /** When running: the timestamp (ms) at which the timer reaches zero. */
  endsAt: number | null
  /** When idle or paused: how much time is left. */
  remainingMs: number
  /** Optional task the user is focusing on. */
  taskId: string | null
}

export const TIMER_PRESETS_MIN = [5, 15, 25, 45, 60]
export const MIN_DURATION_MIN = 1
export const MAX_DURATION_MIN = 240

const STORE_NAME = 'timer'
const DEFAULT_DURATION_MS = 25 * 60_000
const TICK_MS = 250

const DEFAULT_STATE: TimerState = {
  durationMs: DEFAULT_DURATION_MS,
  status: 'idle',
  endsAt: null,
  remainingMs: DEFAULT_DURATION_MS,
  taskId: null,
}

function sanitizeTimer(raw: unknown): TimerState | null {
  if (!isRecord(raw)) return null
  const durationMs = Number(raw.durationMs)
  if (!Number.isFinite(durationMs) || durationMs < MIN_DURATION_MIN * 60_000 || durationMs > MAX_DURATION_MIN * 60_000) {
    return null
  }
  const status = ['idle', 'running', 'paused', 'finished'].includes(raw.status as string)
    ? (raw.status as TimerStatus)
    : 'idle'
  const endsAt = typeof raw.endsAt === 'number' && Number.isFinite(raw.endsAt) ? raw.endsAt : null
  const remaining = Number(raw.remainingMs)
  const remainingMs = Number.isFinite(remaining) ? Math.min(Math.max(remaining, 0), durationMs) : durationMs
  const taskId = typeof raw.taskId === 'string' ? raw.taskId : null

  if (status === 'running' && endsAt === null) return { ...DEFAULT_STATE, durationMs, remainingMs: durationMs, taskId }
  return { durationMs, status, endsAt: status === 'running' ? endsAt : null, remainingMs, taskId }
}

function loadTimer(): { state: TimerState; finishedWhileAway: boolean } {
  const state = loadValue(STORE_NAME, sanitizeTimer, DEFAULT_STATE)
  // If the timer ran out while the page was closed, show it as finished.
  if (state.status === 'running' && state.endsAt !== null && state.endsAt <= Date.now()) {
    return { state: { ...state, status: 'finished', endsAt: null, remainingMs: 0 }, finishedWhileAway: true }
  }
  return { state, finishedWhileAway: false }
}

type UseTimerOptions = {
  /** Called once when the countdown reaches zero while the page is open. */
  onFinish: (taskId: string | null, durationMs: number) => void
}

export function useTimer({ onFinish }: UseTimerOptions) {
  const [initial] = useState(loadTimer)
  const [state, setState] = useState<TimerState>(initial.state)
  const [finishedWhileAway, setFinishedWhileAway] = useState(initial.finishedWhileAway)
  const [now, setNow] = useState(() => Date.now())
  // Remembers which countdown we already announced, so onFinish never fires twice.
  const announcedEndsAt = useRef<number | null>(null)

  // Keep the latest onFinish without restarting the ticking interval.
  const onFinishRef = useRef(onFinish)
  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  // Save timer state and preferences whenever they change (not on every tick).
  useEffect(() => {
    saveValueQuietly(STORE_NAME, state)
  }, [state])

  // While running, re-render a few times per second and detect when time is up.
  useEffect(() => {
    if (state.status !== 'running' || state.endsAt === null) return
    const endsAt = state.endsAt
    const tick = () => {
      const current = Date.now()
      setNow(current)
      if (current >= endsAt && announcedEndsAt.current !== endsAt) {
        announcedEndsAt.current = endsAt
        setState((s) => (s.status === 'running' ? { ...s, status: 'finished', endsAt: null, remainingMs: 0 } : s))
        onFinishRef.current(state.taskId, state.durationMs)
      }
    }
    tick()
    const interval = window.setInterval(tick, TICK_MS)
    // Background tabs tick slowly; catch up immediately when the tab becomes visible again.
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [state.status, state.endsAt, state.taskId, state.durationMs])

  const remainingMs =
    state.status === 'running' && state.endsAt !== null ? Math.max(0, state.endsAt - now) : state.remainingMs

  const start = useCallback(() => {
    prepareSound()
    setFinishedWhileAway(false)
    setState((s) => {
      if (s.status === 'running') return s // Already running: ignore extra clicks.
      const startFrom = s.status === 'paused' ? s.remainingMs : s.durationMs
      return { ...s, status: 'running', endsAt: Date.now() + startFrom, remainingMs: startFrom }
    })
    setNow(Date.now())
  }, [])

  const pause = useCallback(() => {
    setState((s) =>
      s.status === 'running' && s.endsAt !== null
        ? { ...s, status: 'paused', remainingMs: Math.max(0, s.endsAt - Date.now()), endsAt: null }
        : s,
    )
  }, [])

  const reset = useCallback(() => {
    setFinishedWhileAway(false)
    setState((s) => ({ ...s, status: 'idle', endsAt: null, remainingMs: s.durationMs }))
  }, [])

  /** Change the length. Only allowed when the timer isn't running. */
  const setDuration = useCallback((minutes: number) => {
    if (!Number.isFinite(minutes) || minutes < MIN_DURATION_MIN || minutes > MAX_DURATION_MIN) return
    const durationMs = Math.round(minutes * 60_000)
    setFinishedWhileAway(false)
    setState((s) => (s.status === 'running' ? s : { ...s, durationMs, status: 'idle', endsAt: null, remainingMs: durationMs }))
  }, [])

  const setTaskId = useCallback((taskId: string | null) => {
    setState((s) => ({ ...s, taskId }))
  }, [])

  return {
    status: state.status,
    durationMs: state.durationMs,
    remainingMs,
    taskId: state.taskId,
    finishedWhileAway,
    start,
    pause,
    reset,
    setDuration,
    setTaskId,
  }
}

export type TimerApi = ReturnType<typeof useTimer>

/** 1500000 → "25:00"; 3725000 → "1:02:05". Rounds up so the display hits 0:00 exactly when time is up. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

/** "25 min", "1 hr 30 min", "90 sec" */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.round(ms / 60_000)
  if (totalMinutes < 1) return `${Math.round(ms / 1000)} sec`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`
}
