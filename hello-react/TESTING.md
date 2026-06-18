# Testing — Flashcard app

Manual happy-path checks. No automated tests exist; "testing" means running the
app and exercising it by hand.

**Run it:** from `hello-react/`, `npm run dev`, then open the printed
`localhost` URL.

## Happy-path checks

1. **Loads clean** — the page renders with the first card showing its Question
   side, `Card 1 of N`, and `Known: 0 · Reviewing: 0` (on a fresh browser with
   no saved tally).
2. **Flip** — clicking the card toggles between Question and Answer.
3. **Next** — "Next" advances to the following card, which starts on its
   Question side, and `Card X of N` increments.
4. **Previous** — "Previous" goes back a card, which also starts on its Question
   side, and `Card X of N` decrements.
5. **Disabled edges** — "Previous" is disabled on the first card; "Next" is
   disabled on the last card.
6. **Tally counts** — clicking **Got it** increments Known; clicking
   **Review again** increments Reviewing, e.g. `Known: 1 · Reviewing: 0` then
   `Known: 1 · Reviewing: 1`.
7. **Tally persists across cards** — navigate Next/Previous after marking; the
   tally keeps its totals (App owns the count, so changing cards doesn't reset
   it).
8. **Survives refresh** — reload the page; the tally still shows the last
   totals (saved to `localStorage` under the `tally` key).

> Reset the saved tally with `localStorage.removeItem('tally')` in the browser
> console.

## Known limitations

- **No per-card dedupe.** The tally counts *every* click. Clicking **Got it**
  multiple times on the same card adds to Known each time — there is no tracking
  of which cards have already been marked. This is intentional for a throwaway
  build; the goal was the "data down, events up" wiring and localStorage
  persistence, not an accurate spaced-repetition score.
