import React, { useState, useEffect, useRef } from 'react'
import './Clock.css'

/**
 * Clock Component
 * 
 * A comprehensive time management component featuring:
 * - Real-time digital clock display
 * - Countdown timer with custom time setting
 * - Stopwatch with lap functionality
 * - Audio notifications for timer completion
 * - Persistent state management
 */
function Clock({ focusMode, onSessionComplete, clockFormat = '24h' }) {
  // Current time state
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Timer states
  const [timerMinutes, setTimerMinutes] = useState(25) // Default 25 minutes (Pomodoro)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [timerTime, setTimerTime] = useState(25 * 60) // Timer time in seconds
  
  // Stopwatch states
  const [stopwatchTime, setStopwatchTime] = useState(0) // Stopwatch time in centiseconds
  const [stopwatchActive, setStopwatchActive] = useState(false)
  const [laps, setLaps] = useState([])
  
  // Active mode state
  const [activeMode, setActiveMode] = useState('clock') // 'clock', 'timer', 'stopwatch'
  const [format, setFormat] = useState(clockFormat) // '24h' | '12h'
  
  // Refs for intervals
  const timerIntervalRef = useRef(null)
  const stopwatchIntervalRef = useRef(null)
  const clockIntervalRef = useRef(null)

  // Update current time every second
  useEffect(() => {
    clockIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current)
      }
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (timerActive && timerTime > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerTime(prevTime => {
          if (prevTime <= 1) {
            setTimerActive(false)
            playNotificationSound()
            try {
              if (onSessionComplete) onSessionComplete({ type: 'timer', minutes: Math.floor(timerTime / 60), date: new Date().toISOString() })
              if (Notification && Notification.permission === 'granted') {
                new Notification("Timer complete", { body: "Great job! Time's up." })
              }
            } catch {}
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [timerActive, timerTime])

  // Stopwatch effect
  useEffect(() => {
    if (stopwatchActive) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(prevTime => prevTime + 1)
      }, 10) // Update every 10ms for centiseconds
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current)
      }
    }

    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current)
      }
    }
  }, [stopwatchActive])

  /**
   * Play notification sound when timer completes
   */
  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1)
    } catch (error) {
      console.log('Audio notification not available:', error)
    }
  }

  /**
   * Timer Functions
   */
  const startTimer = () => {
    if (timerTime > 0) {
      setTimerActive(true)
    }
  }

  const pauseTimer = () => {
    setTimerActive(false)
  }

  const resetTimer = () => {
    setTimerActive(false)
    setTimerTime(timerMinutes * 60 + timerSeconds)
  }

  const setCustomTimer = () => {
    const totalSeconds = timerMinutes * 60 + timerSeconds
    if (totalSeconds > 0 && totalSeconds <= 3600) { // Max 1 hour
      setTimerTime(totalSeconds)
      setTimerActive(false)
    }
  }

  /**
   * Stopwatch Functions
   */
  const startStopwatch = () => {
    setStopwatchActive(true)
  }

  const pauseStopwatch = () => {
    setStopwatchActive(false)
  }

  const resetStopwatch = () => {
    setStopwatchActive(false)
    setStopwatchTime(0)
    setLaps([])
  }

  const addLap = () => {
    if (stopwatchTime > 0) {
      const lapTime = stopwatchTime
      setLaps(prevLaps => [...prevLaps, lapTime])
    }
  }

  /**
   * Format time functions
   */
  const formatTime = (date) => {
    const use12 = format === '12h'
    return date.toLocaleTimeString(undefined, {
      hour12: use12,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatTimerTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatStopwatchTime = (centiseconds) => {
    const totalSeconds = Math.floor(centiseconds / 100)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const cs = centiseconds % 100
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="clock-section">
      {/* Mode Selector */}
      <div className="mode-selector">
        <button 
          className={`mode-button ${activeMode === 'clock' ? 'active' : ''}`}
          onClick={() => setActiveMode('clock')}
        >
          Clock
        </button>
        <button 
          className={`mode-button ${activeMode === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveMode('timer')}
        >
          Timer
        </button>
        <button 
          className={`mode-button ${activeMode === 'stopwatch' ? 'active' : ''}`}
          onClick={() => setActiveMode('stopwatch')}
        >
          Stopwatch
        </button>
      </div>
      {/* Format toggle: only show under Clock tab */}
      {activeMode === 'clock' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <button className="action-button" onClick={() => setFormat(f => (f === '24h' ? '12h' : '24h'))}>
            Clock: {format === '24h' ? '24-hour' : '12-hour'}
          </button>
        </div>
      )}

      {/* Clock Mode */}
      {activeMode === 'clock' && (
        <div className="clock-display">
          <div className="current-time">
            {formatTime(currentTime)}
          </div>
          <div className="current-date">
            {formatDate(currentTime)}
          </div>
        </div>
      )}

      {/* Timer Mode */}
      {activeMode === 'timer' && (
        <div className="timer-section">
          <div className="timer-display">
            <div className={`timer-time ${timerTime <= 10 && timerActive ? 'warning' : ''}`}>
              {formatTimerTime(timerTime)}
            </div>
            {timerTime === 0 && (
              <div className="timer-complete">Time's up! 🎉</div>
            )}
          </div>

          {/* Timer Settings */}
          <div className="timer-settings">
            <div className="time-inputs">
              <div className="input-group">
                <label>Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  disabled={timerActive}
                />
              </div>
              <div className="input-group">
                <label>Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  disabled={timerActive}
                />
              </div>
            </div>
            <button 
              onClick={setCustomTimer}
              className="set-timer-button"
              disabled={timerActive}
            >
              Set Timer
            </button>
          </div>

          {/* Timer Controls */}
          <div className="timer-controls">
            {!timerActive ? (
              <button onClick={startTimer} className="control-button start" disabled={timerTime === 0}>
                Start
              </button>
            ) : (
              <button onClick={pauseTimer} className="control-button pause">
                Pause
              </button>
            )}
            <button onClick={resetTimer} className="control-button reset">
              Reset
            </button>
          </div>

          {/* Quick Timer Presets */}
          <div className="timer-presets">
            <button onClick={() => { setTimerMinutes(5); setTimerSeconds(0); setCustomTimer(); }} disabled={timerActive}>
              5 min
            </button>
            <button onClick={() => { setTimerMinutes(15); setTimerSeconds(0); setCustomTimer(); }} disabled={timerActive}>
              15 min
            </button>
            <button onClick={() => { setTimerMinutes(25); setTimerSeconds(0); setCustomTimer(); }} disabled={timerActive}>
              25 min
            </button>
            <button onClick={() => { setTimerMinutes(45); setTimerSeconds(0); setCustomTimer(); }} disabled={timerActive}>
              45 min
            </button>
          </div>
        </div>
      )}

      {/* Stopwatch Mode */}
      {activeMode === 'stopwatch' && (
        <div className="stopwatch-section">
          <div className="stopwatch-display">
            <div className="stopwatch-time">
              {formatStopwatchTime(stopwatchTime)}
            </div>
          </div>

          {/* Stopwatch Controls */}
          <div className="stopwatch-controls">
            {!stopwatchActive ? (
              <button onClick={startStopwatch} className="control-button start">
                Start
              </button>
            ) : (
              <button onClick={pauseStopwatch} className="control-button pause">
                Pause
              </button>
            )}
            <button onClick={addLap} className="control-button lap" disabled={!stopwatchActive && stopwatchTime === 0}>
              Lap
            </button>
            <button onClick={resetStopwatch} className="control-button reset">
              Reset
            </button>
          </div>

          {/* Lap Times */}
          {laps.length > 0 && (
            <div className="lap-times">
              <h4>Lap Times</h4>
              <div className="lap-list">
                {laps.map((lapTime, index) => (
                  <div key={index} className="lap-item">
                    <span className="lap-number">Lap {index + 1}</span>
                    <span className="lap-time">{formatStopwatchTime(lapTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Clock