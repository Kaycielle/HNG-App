import { noteDisplayTitle, notePreview } from '../../data/notes'
import { formatRelativeTime } from '../../lib/dates'
import type { Note } from '../../types'
import { Icon } from '../ui/Icon'

type NoteListProps = {
  notes: Note[]
  totalCount: number
  selectedId: string | null
  query: string
  onQueryChange: (query: string) => void
  onSelect: (id: string) => void
}

export function NoteList({ notes, totalCount, selectedId, query, onQueryChange, onSelect }: NoteListProps) {
  return (
    <div className="note-list-pane">
      <div className="note-search">
        <Icon name="search" size={16} className="note-search-icon" />
        <label htmlFor="note-search" className="visually-hidden">
          Search notes
        </label>
        <input
          id="note-search"
          className="input"
          type="search"
          placeholder="Search notes"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      {query && (
        <p className="note-search-status" aria-live="polite">
          {notes.length === 0 ? 'No matches' : `${notes.length} of ${totalCount} ${totalCount === 1 ? 'note' : 'notes'}`}
        </p>
      )}

      {totalCount === 0 ? (
        <div className="empty-state">
          <strong>No notes yet</strong>
          Create one with the “New note” button.
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <strong>No notes match “{query.trim()}”</strong>
          <button type="button" className="btn btn-sm" onClick={() => onQueryChange('')}>
            Clear search
          </button>
        </div>
      ) : (
        <ul className="note-list" aria-label="Notes">
          {notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                className="note-list-item"
                aria-current={note.id === selectedId ? 'true' : undefined}
                onClick={() => onSelect(note.id)}
              >
                <span className={`note-list-title${note.title.trim() ? '' : ' is-untitled'}`}>
                  {noteDisplayTitle(note)}
                </span>
                <span className="note-list-preview">{notePreview(note)}</span>
                <span className="note-list-date">{formatRelativeTime(note.updatedAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
