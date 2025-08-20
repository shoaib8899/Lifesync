const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(bodyParser.json())

// In-memory store (replace with DB in production)
const db = {
  notes: [],
  todos: [],
  sessions: [],
}

// Helpers
const ok = (res, data) => res.json({ ok: true, data })

// Notes API
app.get('/api/notes', (req, res) => ok(res, db.notes))
app.post('/api/notes', (req, res) => {
  const note = { id: Date.now(), text: req.body.text || '', createdAt: new Date().toISOString() }
  db.notes.unshift(note)
  ok(res, note)
})
app.delete('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id)
  db.notes = db.notes.filter(n => n.id !== id)
  ok(res, true)
})

// Todos API
app.get('/api/todos', (req, res) => ok(res, db.todos))
app.post('/api/todos', (req, res) => {
  const todo = { id: Date.now(), text: req.body.text || '', completed: false, createdAt: new Date().toISOString() }
  db.todos.push(todo)
  ok(res, todo)
})
app.patch('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  db.todos = db.todos.map(t => t.id === id ? { ...t, ...req.body } : t)
  ok(res, db.todos.find(t => t.id === id))
})
app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  db.todos = db.todos.filter(t => t.id !== id)
  ok(res, true)
})

// Sessions & stats
app.get('/api/sessions', (req, res) => ok(res, db.sessions))
app.post('/api/sessions', (req, res) => {
  const session = { id: Date.now(), type: req.body.type || 'focus', minutes: Number(req.body.minutes || 0), date: new Date().toISOString() }
  db.sessions.push(session)
  ok(res, session)
})
app.get('/api/stats/weekly', (req, res) => {
  const now = new Date()
  const map = new Map()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    map.set(key, 0)
  }
  for (const s of db.sessions) {
    const key = (s.date || '').slice(0, 10)
    if (map.has(key)) map.set(key, (map.get(key) || 0) + (s.minutes || 0))
  }
  const byDay = Array.from(map.entries()).map(([date, minutes]) => ({ date, minutes }))
  ok(res, { byDay, totalMinutes: byDay.reduce((a, b) => a + b.minutes, 0) })
})

app.listen(port, () => console.log(`API server listening on http://localhost:${port}`))


