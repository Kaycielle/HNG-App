/*
  Ways to tell the user the timer has finished. Each one is optional:
  if the browser doesn't support something, it's silently skipped.
*/

let audioContext: AudioContext | null = null

/**
 * Browsers only allow sound after the user has interacted with the page, so we
 * prepare the audio when they press Start and use it later when time is up.
 */
export function prepareSound() {
  try {
    audioContext ??= new AudioContext()
    if (audioContext.state === 'suspended') void audioContext.resume()
  } catch {
    audioContext = null
  }
}

/** Three short, gentle beeps. */
export function playChime() {
  if (!audioContext) return
  try {
    const start = audioContext.currentTime
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = 880
      const t = start + i * 0.35
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
      oscillator.connect(gain).connect(audioContext.destination)
      oscillator.start(t)
      oscillator.stop(t + 0.3)
    }
  } catch {
    // Sound is a nice extra; ignore failures.
  }
}

export type NotificationSupport = 'unsupported' | NotificationPermission

export function notificationSupport(): NotificationSupport {
  return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
}

export async function requestNotificationPermission(): Promise<NotificationSupport> {
  if (notificationSupport() === 'unsupported') return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return notificationSupport()
  }
}

export function showBrowserNotification(title: string, body: string) {
  if (notificationSupport() !== 'granted') return
  try {
    new Notification(title, { body, tag: 'kay-todo-timer' })
  } catch {
    // Some browsers (e.g. Android Chrome) only allow notifications from a service worker.
  }
}
