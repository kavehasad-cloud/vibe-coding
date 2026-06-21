import { useState } from 'react'
import './App.css'

const ACTIONS = [
  { value: 'rewrite', label: 'Rewrite' },
  { value: 'summarize', label: 'Summarize' },
  { value: 'simplify', label: 'Simplify' },
]

function App() {
  const [text, setText] = useState('')
  const [action, setAction] = useState('rewrite')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onRun() {
    setLoading(true)
    setError('')
    setResult('')
    try {
      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, action }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Request failed.')
      } else {
        setResult(data.result)
      }
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  function onClear() {
    setText('')
    setResult('')
    setError('')
    setAction('rewrite') // back to default
  }

  return (
    <main className="tool">
      <h1>AI Text Tool</h1>
      <p className="subtitle">Rewrite, summarize, or simplify any text — powered by AI.</p>

      <textarea
        className="input"
        placeholder="Paste or type your text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
      />

      <div className="controls">
        <div className="actions" role="radiogroup" aria-label="Action">
          {ACTIONS.map((a) => (
            <label key={a.value} className="action">
              <input
                type="radio"
                name="action"
                value={a.value}
                checked={action === a.value}
                onChange={(e) => setAction(e.target.value)}
              />
              {a.label}
            </label>
          ))}
        </div>

        <div className="buttons">
          <button
            type="button"
            className="clear"
            onClick={onClear}
            disabled={loading || (text === '' && result === '' && error === '')}
          >
            Clear
          </button>
          <button
            type="button"
            className="run"
            onClick={onRun}
            disabled={loading || text.trim() === ''}
          >
            {loading ? 'Working…' : 'Run'}
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="output">
          <h2>Result</h2>
          <p>{result}</p>
        </div>
      )}
    </main>
  )
}

export default App
