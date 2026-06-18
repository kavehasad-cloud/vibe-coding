# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal collection of small, self-contained static web pages — "vibe coding" experiments. There is **no build system, no package manager, no test suite, and no framework**. Each page is plain HTML + CSS + vanilla JavaScript.

## How I work (I'm learning)
- I'm learning to build with Claude Code. Keep explanations short; define new terms plainly, once.
- Scope tight — don't overbuild. Propose a plan before big changes, and let me review before you edit.
- One new concept at a time.


## Running / developing

- **Run any page:** open the `.html` file directly in a browser (double-click, or `start <file>.html` on Windows). No server needed for most pages.
- **Exception — pages using ES module imports** (e.g. `guestbook.html`, which `import`s Supabase from `esm.sh`) must be served over `http://`, not `file://`, or the module/CORS will fail. Serve the folder with `python -m http.server` and visit `http://localhost:8000`.
- **No lint/build/test commands exist.** Don't invent them. "Testing" a change means opening the page in a browser and exercising it.

## Architecture

Two distinct conventions live side by side — match whichever you're editing.

### Root pages — single-file, self-contained
Each root `.html` is a complete standalone page with its **own inline `<style>` and `<script>`**. They don't share files with each other. `index.html` is a hub that links to the others via hardcoded cards. Adding a new root page means: create the file in the same self-contained style, then add a card to `index.html`'s `.pages` list by hand.

### `city-guide/` — the multi-file exception
A small mini-site that deliberately breaks the single-file pattern to demonstrate structure:
- `style.css` is **shared** across all three pages via `<link rel="stylesheet">` — no inline styles.
- `data.js` is the **single source of place data**, a global `MILAN` object; `eat.html` / `see.html` each `<script src="data.js">` and render their list with a small inline loop. No places are hardcoded in the pages.
- Uses a `.js` data file (not `.json` + `fetch`) specifically so it works when opened via `file://`. See `city-guide/README.md`.

## Shared conventions across all pages

- **Design language:** teal accent `--accent: #0d9488` (often with `--accent-dark: #0f766e`), slate text `#1e293b`, light background `#f8fafc`, system font stack, a centered `.container`. Reuse these CSS variables for visual consistency.
- **Render-from-data:** dynamic pages rebuild the DOM from a data source rather than mutating in place (see `guestbook.html`'s `render(rows)`, `city-guide` list loops). Follow this pattern.
- **External integrations** are called directly from the browser via CDN/public APIs, with keys inline in the page:
  - `landing.html` — contact form posts to **Web3Forms** (`access_key` inline).
  - `converter.html` — fetches the **Frankfurter** ECB-rates API; note IRR and other non-ECB currencies are intentionally unsupported and produce a handled error.
  - `guestbook.html` — reads/writes a **Supabase** `messages` table using the publishable (anon) key, imported from `esm.sh`.
  - `habits.html` — persists to **localStorage**.
  - These inline keys are publishable/anon keys by design; keep secrets out of these files.

## Git

Commits go directly to `main` (the established pattern) and push to `origin` (GitHub). The repo runs on Windows, so Git will warn about LF→CRLF normalization — harmless.
