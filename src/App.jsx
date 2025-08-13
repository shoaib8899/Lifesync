import React from 'react'
import TodoList from './components/TodoList'
import Clock from './components/Clock'
import './App.css'

/**
 * Main App Component
 * 
 * This is the root component that renders the entire LifeSync productivity application.
 * It contains a header with the app title and description, and the main content area
 * with TodoList and Clock components arranged side by side.
 */
function App() {
  return (
    <div className="container">
      {/* App Header */}
      <header className="app-header">
        <h1>LifeSync</h1>
        <p>Your personal productivity companion</p>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Left Side - Todo List */}
        <TodoList />
        
        {/* Right Side - Clock with Timer and Stopwatch */}
        <Clock />
      </main>
    </div>
  )
}

export default App