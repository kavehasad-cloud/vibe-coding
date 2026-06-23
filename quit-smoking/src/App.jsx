import { useEffect, useState } from 'react'
import './App.css'

// ---- Fixed defaults (MVP, no settings UI) ----
const CIGS_PER_DAY = 20
const PACK_PRICE = 12 // €, one pack (20 cigs) per day
const PRICE_PER_DAY = PACK_PRICE
const XP_PER_DAY = 10
const XP_PER_LEVEL = 50
const STORAGE_KEY = 'quitSmoking.v1'

const BADGES = [
  { day: 1, label: 'First Day', emoji: '🌱' },
  { day: 3, label: '3 Days', emoji: '🍃' },
  { day: 7, label: 'One Week', emoji: '⭐' },
  { day: 14, label: 'Two Weeks', emoji: '🔥' },
  { day: 30, label: 'One Month', emoji: '🏆' },
]

// ---- Date helpers (local calendar, not UTC) ----
function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Whole calendar-day difference (b - a) between two YYYY-MM-DD strings.
function daysBetween(a, b) {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const start = new Date(ay, am - 1, ad)
  const end = new Date(by, bm - 1, bd)
  return Math.round((end - start) / 86400000)
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore corrupt storage; fall through to fresh state
  }
  return {
    quitDate: todayStr(),
    lastCheckIn: null,
    streak: 0,
    bestStreak: 0,
    xp: 0,
  }
}

function App() {
  const [state, setState] = useState(loadState)

  // Persist on every change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const today = todayStr()
  const checkedInToday = state.lastCheckIn === today

  // Displayed streak: only valid if the last check-in was today or yesterday.
  const gap = state.lastCheckIn === null ? Infinity : daysBetween(state.lastCheckIn, today)
  const displayStreak = state.lastCheckIn !== null && gap <= 1 ? state.streak : 0
  const streakBroken = state.lastCheckIn !== null && gap > 1

  // Calendar-based savings (independent of check-ins).
  const daysSinceQuit = daysBetween(state.quitDate, today)
  const cigsNotSmoked = daysSinceQuit * CIGS_PER_DAY
  const moneySaved = daysSinceQuit * PRICE_PER_DAY

  // Gamification.
  const level = Math.floor(state.xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = state.xp % XP_PER_LEVEL
  const progress = xpIntoLevel / XP_PER_LEVEL

  function handleCheckIn() {
    if (checkedInToday) return
    setState((s) => {
      const g = s.lastCheckIn === null ? Infinity : daysBetween(s.lastCheckIn, today)
      const newStreak = g === 1 ? s.streak + 1 : 1
      return {
        ...s,
        lastCheckIn: today,
        streak: newStreak,
        bestStreak: Math.max(s.bestStreak, newStreak),
        xp: s.xp + XP_PER_DAY,
      }
    })
  }

  function handleReset() {
    if (!window.confirm('Reset all progress? This cannot be undone.')) return
    localStorage.removeItem(STORAGE_KEY)
    setState(loadState())
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Smoke-Free</h1>
        <p className="since">Quit on {state.quitDate}</p>
      </header>

      <section className="card streak-card">
        <p className="streak-label">Current streak</p>
        <p className="streak-day">Day {displayStreak}</p>
        {streakBroken && (
          <p className="streak-broken">Streak broke — check in to restart.</p>
        )}
        <button
          className="checkin-btn"
          onClick={handleCheckIn}
          disabled={checkedInToday}
        >
          {checkedInToday ? '✓ Checked in today' : 'I stayed smoke-free today'}
        </button>
      </section>

      <section className="stats">
        <div className="card stat">
          <p className="stat-value">€{moneySaved.toLocaleString()}</p>
          <p className="stat-label">Money saved</p>
        </div>
        <div className="card stat">
          <p className="stat-value">{cigsNotSmoked.toLocaleString()}</p>
          <p className="stat-label">Cigarettes not smoked</p>
        </div>
      </section>

      <section className="card level-card">
        <div className="level-row">
          <span className="level-name">Level {level}</span>
          <span className="level-xp">
            {xpIntoLevel} / {XP_PER_LEVEL} XP
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="level-hint">{state.xp} XP total · earn {XP_PER_DAY} XP each smoke-free day</p>
      </section>

      <section className="card badges-card">
        <h2>Milestones</h2>
        <div className="badges">
          {BADGES.map((b) => {
            const unlocked = state.bestStreak >= b.day
            return (
              <div
                key={b.day}
                className={`badge ${unlocked ? 'unlocked' : 'locked'}`}
                title={unlocked ? 'Unlocked' : `Reach a ${b.day}-day streak`}
              >
                <span className="badge-emoji">{unlocked ? b.emoji : '🔒'}</span>
                <span className="badge-label">{b.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      <button className="reset-link" onClick={handleReset}>
        Reset progress
      </button>
    </main>
  )
}

export default App
