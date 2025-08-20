import React, { useEffect, useMemo, useState } from 'react'

function Notes({ isOpen, onClose }) {
  const [notes, setNotes] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lifesync-notes')
      if (saved) setNotes(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('lifesync-notes', JSON.stringify(notes))
    } catch {}
  }, [notes])

  const canAdd = useMemo(() => text.trim().length > 0, [text])

  const addNote = () => {
    if (!canAdd) return
    setNotes(prev => [
      { id: Date.now(), text: text.trim(), createdAt: new Date().toISOString() },
      ...prev,
    ])
    setText('')
  }

  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id))

  const clearAll = () => setNotes([])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Digital Notes</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="notes-toolbar">
            <input
              className="note-input"
              placeholder="Write a quick note..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addNote() }}
              maxLength={500}
            />
            <button className="action-button primary" onClick={addNote} disabled={!canAdd}>Add</button>
            <button className="action-button" onClick={clearAll} disabled={notes.length === 0}>Clear All</button>
          </div>

          <div className="notes-list">
            {notes.map(n => (
              <div key={n.id} className="note-card">
                <div style={{ whiteSpace: 'pre-wrap' }}>{n.text}</div>
                <div className="note-actions">
                  <button className="action-button" onClick={() => deleteNote(n.id)}>Delete</button>
                </div>
              </div>
            ))}
            {notes.length === 0 && <div style={{ color: '#6b7280' }}>No notes yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notes


