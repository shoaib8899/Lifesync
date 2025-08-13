import React, { useState, useEffect } from 'react'
import './TodoList.css'

/**
 * TodoList Component
 * 
 * Manages a list of todo items with the following features:
 * - Add new tasks with input validation
 * - Mark tasks as complete/incomplete
 * - Delete individual tasks
 * - Clear all completed tasks
 * - Persist data in localStorage
 * - Display task statistics
 */
function TodoList() {
  // State for managing todos and input
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')

  // Load todos from localStorage on component mount
  useEffect(() => {
    try {
      const savedTodos = localStorage.getItem('lifesync-todos')
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos))
      }
    } catch (error) {
      console.error('Error loading todos from localStorage:', error)
    }
  }, [])

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    try {
      localStorage.setItem('lifesync-todos', JSON.stringify(todos))
    } catch (error) {
      console.error('Error saving todos to localStorage:', error)
    }
  }, [todos])

  /**
   * Add a new todo item
   * Validates input to prevent empty tasks
   */
  const addTodo = () => {
    const trimmedValue = inputValue.trim()
    
    // Input validation
    if (!trimmedValue) {
      setError('Please enter a task description')
      return
    }

    if (trimmedValue.length > 100) {
      setError('Task description must be less than 100 characters')
      return
    }

    // Create new todo
    const newTodo = {
      id: Date.now() + Math.random(), // Simple unique ID generation
      text: trimmedValue,
      completed: false,
      createdAt: new Date().toISOString()
    }

    setTodos(prevTodos => [...prevTodos, newTodo])
    setInputValue('')
    setError('')
  }

  /**
   * Toggle completion status of a todo
   */
  const toggleTodo = (id) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  /**
   * Delete a specific todo
   */
  const deleteTodo = (id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id))
  }

  /**
   * Clear all completed todos
   */
  const clearCompleted = () => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed))
  }

  /**
   * Handle Enter key press in input field
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  /**
   * Clear error message when user starts typing
   */
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    if (error) {
      setError('')
    }
  }

  // Calculate statistics
  const totalTasks = todos.length
  const completedTasks = todos.filter(todo => todo.completed).length
  const pendingTasks = totalTasks - completedTasks

  return (
    <div className="todo-section">
      <div className="todo-header">
        <h2>Tasks</h2>
        <div className="task-stats">
          <span className="stat">
            <span className="stat-number">{pendingTasks}</span>
            <span className="stat-label">Pending</span>
          </span>
          <span className="stat">
            <span className="stat-number">{completedTasks}</span>
            <span className="stat-label">Done</span>
          </span>
        </div>
      </div>

      {/* Add Task Input */}
      <div className="add-task-section">
        <div className="input-group">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className={`task-input ${error ? 'error' : ''}`}
            maxLength="100"
          />
          <button 
            onClick={addTodo}
            className="add-button"
            disabled={!inputValue.trim()}
          >
            <span className="add-icon">+</span>
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Todo List */}
      <div className="todo-list">
        {todos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>No tasks yet. Add one above to get started!</p>
          </div>
        ) : (
          <>
            {todos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-content">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="todo-checkbox"
                  />
                  <span className="todo-text">{todo.text}</span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-button"
                  title="Delete task"
                >
                  ×
                </button>
              </div>
            ))}
            
            {/* Clear Completed Button */}
            {completedTasks > 0 && (
              <div className="todo-actions">
                <button onClick={clearCompleted} className="clear-completed-button">
                  Clear {completedTasks} completed task{completedTasks !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TodoList