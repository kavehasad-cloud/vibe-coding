import { useState } from 'react'
import { cards } from './cards'
import Flashcard from './Flashcard'
import './App.css'

function App() {
  // which card we're on — an index into the `cards` array
  const [index, setIndex] = useState(0)

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

      {/* key={index} remounts the Flashcard when we move, so each new
          card starts on its question side instead of staying flipped */}
      <Flashcard key={index} card={cards[index]} />

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
