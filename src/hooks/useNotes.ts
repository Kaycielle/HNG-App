import { useCallback, useState } from 'react'
import { createNote, isEmptyNote, loadNotes, NOTES_STORAGE_KEY, saveNotes } from '../data/notes'
import type { Note } from '../types'
import { usePersistedList } from './usePersistedList'

/*
  All note state and actions. Every edit is saved immediately (auto-save),
  so there is no "Save" button.
*/
export function useNotes() {
  const { items: notes, setItems, storageMessage, dismissStorageMessage } = usePersistedList(
    loadNotes,
    saveNotes,
    NOTES_STORAGE_KEY,
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedNote = notes.find((note) => note.id === selectedId) ?? null

  /** Removes the currently open note if the user left it completely blank. */
  const discardIfBlank = useCallback(
    (keepId: string | null) => {
      setItems((current) =>
        current.filter((note) => note.id === keepId || note.id !== selectedId || !isEmptyNote(note)),
      )
    },
    [selectedId, setItems],
  )

  const selectNote = useCallback(
    (id: string | null) => {
      if (id !== selectedId) discardIfBlank(id)
      setSelectedId(id)
    },
    [selectedId, discardIfBlank],
  )

  const addNote = useCallback((): Note => {
    // If the open note is still blank, reuse it instead of piling up empty notes.
    if (selectedNote && isEmptyNote(selectedNote)) return selectedNote
    const note = createNote()
    discardIfBlank(null)
    setItems((current) => [note, ...current])
    setSelectedId(note.id)
    return note
  }, [selectedNote, discardIfBlank, setItems])

  const updateNote = useCallback(
    (id: string, changes: Partial<Pick<Note, 'title' | 'body'>>) => {
      setItems((current) =>
        current.map((note) => (note.id === id ? { ...note, ...changes, updatedAt: new Date().toISOString() } : note)),
      )
    },
    [setItems],
  )

  /** Removes a note and returns a function that undoes the deletion. */
  const deleteNote = useCallback(
    (note: Note) => {
      setItems((current) => current.filter((n) => n.id !== note.id))
      if (selectedId === note.id) setSelectedId(null)
      return () => {
        setItems((current) => (current.some((n) => n.id === note.id) ? current : [...current, note]))
        setSelectedId(note.id)
      }
    },
    [selectedId, setItems],
  )

  return {
    notes,
    selectedNote,
    selectNote,
    addNote,
    updateNote,
    deleteNote,
    storageMessage,
    dismissStorageMessage,
  }
}

export type NotesApi = ReturnType<typeof useNotes>
