// text-cli — transform text with the Google Gemini API from the terminal.
//
// Usage:  node cli.js <action> <input>
//   <action>  one of: rewrite, proofread, summarize, simplify
//   <input>   a path to a text file (its contents are read) OR literal text
//             in quotes (used as-is when no such file exists).
//
// The API key is read from process.env.GEMINI_API_KEY, loaded from a local
// .env file by dotenv. It is never hardcoded here.

import 'dotenv/config'
import { readFileSync, existsSync } from 'node:fs'

// Same Gemini setup as the ai-tool web app (api/transform.js): same model,
// same endpoint, same request shape — just driven from the command line.
const API_KEY = process.env.GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash-lite'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

// One instruction per action, prepended to the user's text.
const INSTRUCTIONS = {
  rewrite:
    'Rewrite the following text to be clearer and more polished. Return only the rewritten text.',
  proofread:
    'Proofread the following text and fix any spelling, grammar, and punctuation mistakes. Return only the corrected text.',
  summarize:
    'Summarize the following text concisely. Return only the summary.',
  simplify:
    'Rewrite the following text in plain, simple language a beginner can understand. Return only the simplified text.',
}

// A friendly usage block, shown when run with no arguments or on bad input.
function printUsage() {
  const actions = Object.keys(INSTRUCTIONS).join(', ')
  console.log(`text-cli — transform text with the Google Gemini API

Usage:
  node cli.js <action> <input>

Actions:
  ${actions}

Input:
  A path to a text file (its contents are read), OR literal text in quotes.

Examples:
  node cli.js proofread "i has went too the stor"
  node cli.js summarize article.txt`)
}

// Print an error message and exit with a non-zero code.
function fail(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

async function main() {
  const [action, input] = process.argv.slice(2)

  // No arguments at all → friendly help, treated as a success.
  if (!action && input === undefined) {
    printUsage()
    process.exit(0)
  }

  // Validate the action.
  if (!INSTRUCTIONS[action]) {
    console.error(`Error: unknown action "${action ?? ''}".`)
    console.error(`Valid actions: ${Object.keys(INSTRUCTIONS).join(', ')}`)
    process.exit(1)
  }

  // Require some input.
  if (input === undefined || input === '') {
    fail('please provide text or a file path as the second argument.')
  }

  // Resolve the input: an existing file is read; otherwise it's literal text.
  let text
  if (existsSync(input)) {
    try {
      text = readFileSync(input, 'utf8')
    } catch (err) {
      fail(`could not read file "${input}": ${err.message}`)
    }
  } else {
    text = input
  }

  if (text.trim() === '') {
    fail('the text is empty.')
  }

  // The key must be present before we call the API.
  if (!API_KEY) {
    fail(
      'missing GEMINI_API_KEY. Copy .env.example to .env and add your key.'
    )
  }

  // Call Gemini.
  const prompt = `${INSTRUCTIONS[action]}\n\n${text}`
  let res
  try {
    res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })
  } catch (err) {
    fail(`could not reach the Gemini API: ${err.message}`)
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    fail(`the Gemini API returned ${res.status}. ${detail}`.trim())
  }

  const data = await res.json()
  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!result) {
    fail('no text was returned from the Gemini API.')
  }

  console.log(result.trim())
}

main()
