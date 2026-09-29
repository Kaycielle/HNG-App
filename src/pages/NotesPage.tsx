import { useState } from 'react'
import { NoteEditor } from '../components/notes/NoteEditor'
import { NoteList } from '../components/notes/NoteList'
import { Icon } from '../components/ui/Icon'
import { useToast } from '../components/ui/toastContext'
import { noteDisplayTitle, searchNotes, sortByRecent } from '../data/notes'
import type { NotesApi } from '../hooks/useNotes'
import '../styles/notes.css'

type NotesPageProps = {
  api: NotesApi
}

export function NotesPage({ api }: NotesPageProps) {
  const showToast = useToast()
  const [query, setQuery] = useState('')
  const { selectedNote } = api
  const visibleNotes = searchNotes(sortByRecent(api.notes), query)

  function handleNewNote() {
    setQuery('')
    api.addNote()
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Notes</h1>
          <p>
            {api.notes.length === 0
              ? 'Capture ideas, meeting notes and anything else.'
              : `${api.notes.length} ${api.notes.length === 1 ? 'note' : 'notes'} · saved automatically`}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleNewNote}>
          <Icon name="plus" size={18} />
          New note
        </button>
      </header>

      <div className={`notes-layout card${selectedNote ? ' has-selection' : ''}`}>
        <NoteList
          notes={visibleNotes}
          totalCount={api.notes.length}
          selectedId={selectedNote?.id ?? null}
          query={query}
          onQueryChange={setQuery}
          onSelect={api.selectNote}
        />

        <div className="note-editor-pane">
          {selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              saveFailed={Boolean(api.storageMessage?.startsWith("Couldn't save"))}
              onChange={(changes) => api.updateNote(selectedNote.id, changes)}
              onBack={() => api.selectNote(null)}
              onDelete={() => {
                const undo = api.deleteNote(selectedNote)
                showToast({ message: `Deleted "${noteDisplayTitle(selectedNote)}".`, actionLabel: 'Undo', onAction: undo })
              }}
            />
          ) : (
            <div className="empty-state note-editor-empty">
              <strong>{api.notes.length === 0 ? 'Your notes will appear here' : 'No note selected'}</strong>
              {api.notes.length === 0 ? 'Click “New note” to write your first one.' : 'Pick a note from the list, or create a new one.'}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
