/*
  Note "repository": how notes are created, validated, searched and stored.
  Like data/tasks.ts, this is the file to change when moving to a real database.
*/

import { createId } from '../lib/id'
import { asIsoDate, asString, isRecord, loadList, saveList, storageKey } from '../lib/storage'
import type { Note } from '../types'

const STORE_NAME = 'notes'
const LABEL = 'notes'

export const NOTES_STORAGE_KEY = storageKey(STORE_NAME)
export const NOTE_TITLE_MAX_LENGTH = 200
export const NOTE_BODY_MAX_LENGTH = 100_000

export function loadNotes() {
  const result = loadList(STORE_NAME, sanitizeNote, LABEL)
  // Blank notes (no title, no text) aren't worth keeping.
  return { ...result, items: result.items.filter((note) => !isEmptyNote(note)) }
}

export function saveNotes(notes: Note[]) {
  return saveList(STORE_NAME, notes, LABEL)
}

export function createNote(): Note {
  const now = new Date().toISOString()
  return { id: createId(), title: '', body: '', createdAt: now, updatedAt: now }
}

export function isEmptyNote(note: Note): boolean {
  return !note.title.trim() && !note.body.trim()
}

export function noteDisplayTitle(note: Note): string {
  return note.title.trim() || 'Untitled note'
}

/** First bit of the note's text, for list previews. */
export function notePreview(note: Note, length = 90): string {
  const text = note.body.replace(/\s+/g, ' ').trim()
  if (!text) return 'No additional text'
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text
}

/** Case-insensitive search in the title and text. Every word typed must appear somewhere. */
export function searchNotes(notes: Note[], query: string): Note[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return notes
  return notes.filter((note) => {
    const haystack = `${note.title}\n${note.body}`.toLowerCase()
    return words.every((word) => haystack.includes(word))
  })
}

/** Most recently edited first. */
export function sortByRecent(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

function sanitizeNote(raw: unknown): Note | null {
  if (!isRecord(raw)) return null
  const id = asString(raw.id)
  if (!id) return null
  const now = new Date().toISOString()
  const createdAt = asIsoDate(raw.createdAt, now)
  return {
    id,
    title: asString(raw.title).slice(0, NOTE_TITLE_MAX_LENGTH),
    body: asString(raw.body).slice(0, NOTE_BODY_MAX_LENGTH),
    createdAt,
    updatedAt: asIsoDate(raw.updatedAt, createdAt),
  }
}
