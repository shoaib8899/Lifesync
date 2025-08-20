import React, { useEffect, useMemo, useState } from 'react'
import TodoList from './components/TodoList'
import Clock from './components/Clock'
import Notes from './components/Notes'
import Dashboard from './components/Dashboard'
import './App.css'

/**
 * Main App Component
 * 
 * This is the root component that renders the entire LifeSync productivity application.
 * It contains a header with the app title and description, and the main content area
 * with TodoList and Clock components arranged side by side.
 */
function App() {
  const [focusMode, setFocusMode] = useState(false)
  const [theme, setTheme] = useState('light')
  const [showNotes, setShowNotes] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  // persistent theme
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lifesync-theme')
      if (saved) setTheme(saved)
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('lifesync-theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    document.body.classList.toggle('theme-dark', theme === 'dark')
    document.body.classList.toggle('theme-light', theme === 'light')
    document.body.classList.toggle('focus-mode', focusMode)
  }, [theme, focusMode])

  // Exit focus on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setFocusMode(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Notification permission
  useEffect(() => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {})
      }
    } catch {}
  }, [])

  // Health reminders (water/stretches)
  useEffect(() => {
    const waterId = setInterval(() => {
      try { if (Notification && Notification.permission === 'granted') new Notification('Water reminder', { body: 'Time to drink water 💧' }) } catch {}
    }, 60 * 60 * 1000) // hourly
    const healthId = setInterval(() => {
      try { if (Notification && Notification.permission === 'granted') new Notification('Health break', { body: 'Stretch and check posture 🧘' }) } catch {}
    }, 45 * 60 * 1000)
    return () => { clearInterval(waterId); clearInterval(healthId) }
  }, [])

  const addSession = (session) => {
    try {
      const saved = JSON.parse(localStorage.getItem('lifesync-sessions') || '[]')
      saved.push(session)
      localStorage.setItem('lifesync-sessions', JSON.stringify(saved))
    } catch {}
  }

  // streaks
  const [streak, setStreak] = useState(0)
  useEffect(() => {
    try {
      const sessions = JSON.parse(localStorage.getItem('lifesync-sessions') || '[]')
      const days = new Set(sessions.map(s => (s.date || '').slice(0, 10)))
      // count consecutive up to today
      let count = 0
      const today = new Date()
      for (let i = 0; ; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        if (days.has(key)) count++
        else break
      }
      setStreak(count)
    } catch {}
  }, [showDashboard])

  return (
    <div className="container">
      {/* App Header */}
      <header className="app-header">
        <h1>LifeSync</h1>
        <p>Your personal productivity companion</p>
        <div className="header-actions">
          <button className="action-button" onClick={() => setFocusMode(v => !v)}>
            {focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
          </button>
          <button className="action-button" onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}>
            Theme: {theme === 'light' ? 'Light' : 'Dark'}
          </button>
          <button className="action-button" onClick={() => setShowNotes(true)}>Notes</button>
          <button className="action-button" onClick={() => setShowDashboard(true)}>Dashboard</button>
          <span className="toggle">Streak: <strong>{streak} day{streak === 1 ? '' : 's'}</strong></span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Left Side - Todo List */}
        <TodoList onAddSession={addSession} focusMode={focusMode} />
        
        {/* Right Side - Clock with Timer and Stopwatch */}
        <Clock focusMode={focusMode} onSessionComplete={addSession} clockFormat="24h" />
      </main>

      <Notes isOpen={showNotes} onClose={() => setShowNotes(false)} />
      <Dashboard isOpen={showDashboard} onClose={() => setShowDashboard(false)} />

      {focusMode && (
        <button className="focus-exit" onClick={() => setFocusMode(false)} title="Exit Focus (Esc)">Exit Focus</button>
      )}
    </div>
  )
}

export default App