import { NOTE_BODY_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from '../../data/notes'
import { formatRelativeTime, formatShortDate } from '../../lib/dates'
import type { Note } from '../../types'
import { Icon } from '../ui/Icon'

type NoteEditorProps = {
  note: Note
  saveFailed: boolean
  onChange: (changes: Partial<Pick<Note, 'title' | 'body'>>) => void
  onDelete: () => void
  onBack: () => void
}

export function NoteEditor({ note, saveFailed, onChange, onDelete, onBack }: NoteEditorProps) {
  // The editor is re-created for each note (see `key` in NotesPage), so this only
  // applies when a note is opened: a brand-new note starts with the cursor in the title.
  const isBrandNew = !note.title && !note.body

  return (
    <article className="note-editor" aria-label="Note editor">
      <div className="note-editor-toolbar">
        <button type="button" className="btn btn-ghost btn-sm note-back" onClick={onBack}>
          <Icon name="back" size={16} />
          All notes
        </button>
        <span className={`note-save-status${saveFailed ? ' is-error' : ''}`} role="status">
          {saveFailed ? 'Not saved' : (
            <>
              <Icon name="check" size={14} /> Saved
            </>
          )}
        </span>
        <button type="button" className="btn btn-sm btn-danger" onClick={onDelete}>
          <Icon name="trash" size={16} />
          Delete
        </button>
      </div>

      <label htmlFor="note-title" className="visually-hidden">
        Note title
      </label>
      <input
        autoFocus={isBrandNew}
        id="note-title"
        className="note-title-input"
        type="text"
        placeholder="Title"
        maxLength={NOTE_TITLE_MAX_LENGTH}
        value={note.title}
        onChange={(event) => onChange({ title: event.target.value })}
      />
      {!note.title.trim() && note.body.trim() && (
        <p className="note-hint">Tip: add a title so this note is easier to find later.</p>
      )}

      <p className="note-meta">
        Edited {editedLabel(note.updatedAt)} · Created {formatShortDate(note.createdAt)}
      </p>

      <label htmlFor="note-body" className="visually-hidden">
        Note text
      </label>
      <textarea
        id="note-body"
        className="note-body-input"
        placeholder="Start writing…"
        maxLength={NOTE_BODY_MAX_LENGTH}
        value={note.body}
        onChange={(event) => onChange({ body: event.target.value })}
      />
    </article>
  )
}

function editedLabel(iso: string): string {
  const label = formatRelativeTime(iso)
  return label === 'Just now' ? 'just now' : label
}
