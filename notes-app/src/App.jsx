import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    // Get the current session on first load.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Keep `session` in sync on login, logout, and token refresh.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Remove the listener when the component unmounts.
    return () => subscription.unsubscribe()
  }, [])

  // Load notes when logged in; clear them on logout.
  useEffect(() => {
    if (session) {
      fetchNotes()
    } else {
      setNotes([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  async function fetchNotes() {
    setError(null)
    // RLS already restricts rows to the owner — no user filtering needed.
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setNotes(data)
  }

  async function handleAddNote() {
    const content = newNote.trim()
    if (!content) return
    setError(null)
    setLoading(true)
    try {
      // user_id is stamped by the DB default (auth.uid()) — don't set it here.
      const { error } = await supabase.from('notes').insert({ content })
      if (error) {
        setError(error.message)
      } else {
        setNewNote('')
        await fetchNotes()
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteNote(id) {
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) setError(error.message)
      else await fetchNotes()
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp() {
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogIn() {
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogOut() {
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const wrapperStyle = {
    maxWidth: '320px',
    margin: '4rem auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    fontFamily: 'system-ui, sans-serif',
  }

  if (session) {
    return (
      <div style={wrapperStyle}>
        <p>Logged in as {session.user.email}</p>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="New note"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button type="button" onClick={handleAddNote} disabled={loading}>
            {loading ? 'Working…' : 'Add'}
          </button>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {notes.map((note) => (
            <li
              key={note.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '0.5rem',
                padding: '0.25rem 0',
              }}
            >
              <span>{note.content}</span>
              <button
                type="button"
                onClick={() => handleDeleteNote(note.id)}
                disabled={loading}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        <button type="button" onClick={handleLogOut} disabled={loading}>
          {loading ? 'Working…' : 'Log Out'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    )
  }

  return (
    <div style={wrapperStyle}>
      <h1>Sign in</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={handleSignUp} disabled={loading}>
          {loading ? 'Working…' : 'Sign Up'}
        </button>
        <button type="button" onClick={handleLogIn} disabled={loading}>
          {loading ? 'Working…' : 'Log In'}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default App
