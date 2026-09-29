import { useEffect, useRef, useState } from 'react'
import type { LoadResult } from '../lib/storage'

/*
  Keeps a list (tasks or notes) in React state and mirrors every change to localStorage.
  It also listens for changes made in other browser tabs, so two open tabs stay in sync.
*/
export function usePersistedList<T>(
  load: () => LoadResult<T>,
  save: (items: T[]) => string | null,
  fullStorageKey: string,
) {
  // Load from storage only once, when the app starts.
  const [initial] = useState(load)
  const [items, setItems] = useState<T[]>(initial.items)
  const [loadProblem, setLoadProblem] = useState<string | null>(initial.problem)
  const [saveError, setSaveError] = useState<string | null>(null)
  // True when `items` was just read from storage, so there's nothing new to write back.
  const skipNextSave = useRef(true)

  // Save whenever the list changes.
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    setSaveError(save(items))
  }, [items, save])

  // Another tab changed the same data: reload it here (without saving it straight back).
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== fullStorageKey) return
      const result = load()
      skipNextSave.current = true
      setItems(result.items)
      if (result.problem) setLoadProblem(result.problem)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [load, fullStorageKey])

  return {
    items,
    setItems,
    /** A problem found while loading (e.g. damaged data), or a failed save. */
    storageMessage: saveError ?? loadProblem,
    dismissStorageMessage: () => {
      setLoadProblem(null)
      setSaveError(null)
    },
  }
}
