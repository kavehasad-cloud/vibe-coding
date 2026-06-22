# text-cli

A small command-line tool that transforms text using the Google Gemini API
(`gemini-2.5-flash-lite`). It reuses the same Gemini call as this repo's `ai-tool`
web app, but runs in the terminal.

## Setup

```sh
cd text-cli
npm install
cp .env.example .env   # then paste your real key into .env
```

`.env` holds your `GEMINI_API_KEY` and is git-ignored — the key is never committed.

## Usage

```sh
node cli.js <action> <input>
```

- `<action>` — one of: `rewrite`, `proofread`, `summarize`, `simplify`
- `<input>` — a path to a text file (its contents are read), **or** literal text in
  quotes (used as-is when no such file exists).

### Examples

```sh
node cli.js proofread "i has went too the stor"
node cli.js summarize article.txt
node cli.js simplify "The mitochondrion is the powerhouse of the cell."
```

Run `node cli.js` with no arguments to see the built-in help.
