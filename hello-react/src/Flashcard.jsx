import { useState } from 'react'

// Shows ONE card. It only knows about the single `card` it's given via props
// and tracks its own "am I flipped?" state. Click anywhere on it to flip.
function Flashcard({ card }) {
  // false = showing the question, true = showing the answer
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      className="card"
      onClick={() => setFlipped(!flipped)}
    >
      <span className="card-label">{flipped ? 'Answer' : 'Question'}</span>
      <p className="card-text">{flipped ? card.answer : card.question}</p>
      <span className="card-hint">click to flip</span>
    </button>
  )
}

export default Flashcard
