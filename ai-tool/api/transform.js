// Vercel serverless function that holds the Gemini API key and proxies
// text-transform requests. The key lives ONLY here (server side) — it never
// reaches the browser. Vercel maps this file to the URL path /api/transform.

const API_KEY = process.env.GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash-lite'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

// A short instruction is prepended to the user's text based on the chosen action.
const INSTRUCTIONS = {
  rewrite:
    'Rewrite the following text to be clearer and more polished. Return only the rewritten text.',
  summarize:
    'Summarize the following text concisely. Return only the summary.',
  simplify:
    'Rewrite the following text in plain, simple language a beginner can understand. Return only the simplified text.',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const { text, action } = req.body || {}

  // Validate input before doing anything else.
  if (typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Please provide some text.' })
  }
  if (!INSTRUCTIONS[action]) {
    return res.status(400).json({ error: 'Unknown action.' })
  }
  if (!API_KEY) {
    return res.status(500).json({ error: 'Server missing GEMINI_API_KEY.' })
  }

  try {
    const prompt = `${INSTRUCTIONS[action]}\n\n${text}`
    const upstream = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })

    if (!upstream.ok) {
      // Log the real upstream error server-side, but send the client a clean one.
      console.error('Gemini error:', upstream.status, await upstream.text())
      return res.status(502).json({ error: 'The AI service returned an error.' })
    }

    const data = await upstream.json()
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!result) {
      return res.status(502).json({ error: 'No text returned from the AI.' })
    }

    return res.json({ result })
  } catch (err) {
    console.error('Transform failed:', err)
    return res.status(500).json({ error: 'Something went wrong.' })
  }
}
