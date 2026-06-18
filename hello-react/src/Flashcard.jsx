import { useState } from 'react'

// Shows ONE card. It only knows about the single `card` it's given via props
// and tracks its own "am I flipped?" state. Click anywhere on it to flip.
// The `onMark` prop is a function from App: we call it when a rating button is
// clicked. We don't keep a tally here — we just report the event upward.
function Flashcard({ card, onMark }) {
  // false = showing the question, true = showing the answer
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="card-wrap">
      <button
        type="button"
        className="card"
        onClick={() => setFlipped(!flipped)}
      >
        <span className="card-label">{flipped ? 'Answer' : 'Question'}</span>
        <p className="card-text">{flipped ? card.answer : card.question}</p>
        <span className="card-hint">click to flip</span>
      </button>

      <div className="mark">
        <button type="button" onClick={() => onMark('known')}>
          Got it
        </button>
        <button type="button" onClick={() => onMark('reviewing')}>
          Review again
        </button>
      </div>
    </div>
  )
}

export default Flashcard
