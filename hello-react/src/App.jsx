import { useState, useEffect } from 'react'
import { cards } from './cards'
import Flashcard from './Flashcard'
import './App.css'

function App() {
  // which card we're on — an index into the `cards` array
  const [index, setIndex] = useState(0)

  // App owns the tally. The Flashcard child never stores these counts —
  // it just tells us what happened, and we update the numbers here.
  // Load the saved tally once on startup (same pattern as the to-do list).
  const [known, setKnown] = useState(() => {
    const saved = localStorage.getItem('tally')
    return saved ? JSON.parse(saved).known : 0
  })
  const [reviewing, setReviewing] = useState(() => {
    const saved = localStorage.getItem('tally')
    return saved ? JSON.parse(saved).reviewing : 0
  })

  // save to localStorage whenever either count changes
  useEffect(() => {
    localStorage.setItem('tally', JSON.stringify({ known, reviewing }))
  }, [known, reviewing])

  // the event handler we hand down to Flashcard via the onMark prop
  function handleMark(result) {
    if (result === 'known') setKnown(known + 1)
    else setReviewing(reviewing + 1)
  }

  function next() {
    if (index < cards.length - 1) setIndex(index + 1)
  }

  function prev() {
    if (index > 0) setIndex(index - 1)
  }

  return (
    <section id="center">
      <h1>Flashcards</h1>

      <p className="progress">
        Card {index + 1} of {cards.length}
      </p>

      <p className="tally">
        Known: {known} · Reviewing: {reviewing}
      </p>

      {/* key={index} remounts the Flashcard when we move, so each new
          card starts on its question side instead of staying flipped */}
      <Flashcard key={index} card={cards[index]} onMark={handleMark} />

      <div className="nav">
        <button type="button" onClick={prev} disabled={index === 0}>
          Previous
        </button>
        <button
          type="button"
          onClick={next}
          disabled={index === cards.length - 1}
        >
          Next
        </button>
      </div>
    </section>
  )
}

export default App
