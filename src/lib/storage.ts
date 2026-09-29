/*
  All reading and writing of the browser's localStorage goes through this file.

  Data is stored as: { "version": 1, "items": [...] }
  The version number lets a future release upgrade old data safely.

  Nothing here throws: problems are returned as friendly messages so the UI can
  show them instead of crashing.
*/

const STORAGE_VERSION = 1
const PREFIX = 'kay-todo'

export function storageKey(name: string): string {
  return `${PREFIX}:${name}`
}

export type LoadResult<T> = {
  items: T[]
  /** A message to show the user if something went wrong, otherwise null. */
  problem: string | null
}

/**
 * Load a list of records.
 * `sanitize` checks each stored record and returns a clean copy, or null if the record is unusable.
 */
export function loadList<T>(
  name: string,
  sanitize: (raw: unknown) => T | null,
  label: string,
): LoadResult<T> {
  const key = storageKey(name)
  let raw: string | null
  try {
    raw = window.localStorage.getItem(key)
  } catch {
    return {
      items: [],
      problem: `Your browser is blocking storage, so your ${label} won't be saved after you close this tab.`,
    }
  }

  if (raw === null) return { items: [], problem: null }

  let rawItems: unknown
  try {
    const parsed: unknown = JSON.parse(raw)
    rawItems = isRecord(parsed) ? parsed.items : parsed
  } catch {
    rawItems = null
  }

  if (!Array.isArray(rawItems)) {
    keepBackup(key, raw)
    return {
      items: [],
      problem: `Your saved ${label} couldn't be read, so we started fresh. A backup of the damaged data was kept in your browser.`,
    }
  }

  const items: T[] = []
  for (const entry of rawItems) {
    const clean = sanitize(entry)
    if (clean) items.push(clean)
  }

  const skipped = rawItems.length - items.length
  if (skipped > 0) {
    keepBackup(key, raw)
    return {
      items,
      problem: `${skipped} saved ${label} ${skipped === 1 ? 'was' : 'were'} damaged and skipped. Everything else loaded normally.`,
    }
  }

  return { items, problem: null }
}

/** Save a list of records. Returns an error message, or null on success. */
export function saveList<T>(name: string, items: T[], label: string): string | null {
  return saveValue(name, { version: STORAGE_VERSION, items }, label)
}

/** Load a single settings object. Falls back to `fallback` if missing or damaged. */
export function loadValue<T>(name: string, sanitize: (raw: unknown) => T | null, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(storageKey(name))
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    const value = isRecord(parsed) ? parsed.value : undefined
    return sanitize(value) ?? fallback
  } catch {
    return fallback
  }
}

export function saveValueQuietly<T>(name: string, value: T): void {
  saveValue(name, { version: STORAGE_VERSION, value }, 'settings')
}

function saveValue(name: string, data: unknown, label: string): string | null {
  try {
    window.localStorage.setItem(storageKey(name), JSON.stringify(data))
    return null
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return `Couldn't save your ${label}: your browser's storage is full.`
    }
    return `Couldn't save your ${label}. Changes may be lost when you close this tab.`
  }
}

function keepBackup(key: string, raw: string) {
  try {
    window.localStorage.setItem(`${key}:backup`, raw)
  } catch {
    // If even the backup can't be written there is nothing more we can do.
  }
}

// ---------- Small validation helpers used by the sanitize functions ----------

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function asIsoDate(value: unknown, fallback: string): string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : fallback
}
