import React, { useEffect, useMemo, useState } from 'react'

// A lightweight weekly dashboard based on stored sessions
function Dashboard({ isOpen, onClose }) {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lifesync-sessions')
      if (saved) setSessions(JSON.parse(saved))
    } catch {}
  }, [])

  const byDay = useMemo(() => {
    const map = new Map()
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(now.getDate() - i)
      const key = day.toISOString().slice(0, 10)
      map.set(key, 0)
    }
    for (const s of sessions) {
      const key = (s.date || '').slice(0, 10)
      if (map.has(key)) {
        map.set(key, (map.get(key) || 0) + (s.minutes || 0))
      }
    }
    return Array.from(map.entries()).map(([date, minutes]) => ({ date, minutes }))
  }, [sessions])

  const totalMinutes = useMemo(() => byDay.reduce((a, b) => a + b.minutes, 0), [byDay])
  const max = useMemo(() => Math.max(1, ...byDay.map(d => d.minutes)), [byDay])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Weekly Dashboard</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="stats-grid">
            <div className="stat-card">
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total Productive Hours</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{(totalMinutes / 60).toFixed(1)}</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Sessions Tracked</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{sessions.length}</div>
            </div>
          </div>

          <div className="weekly-bars">
            {byDay.map(d => (
              <div key={d.date} style={{ textAlign: 'center' }}>
                <div className="bar" style={{ height: `${(d.minutes / max) * 120 + 8}px` }} />
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                  {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard


