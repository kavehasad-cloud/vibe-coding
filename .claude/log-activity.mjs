// Claude Code sends a hook its data as JSON on STDIN (not via env vars —
// that's the part most Mac/Linux tutorials get wrong for Windows).
//   { tool_name, tool_input: { file_path }, tool_response: {...} }
import { appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Write the log right next to THIS script (the .claude/ folder), derived from
// the script's own location — so it never depends on the working directory or
// on CLAUDE_PROJECT_DIR being set.
const logPath = join(dirname(fileURLToPath(import.meta.url)), 'hook-activity.log')

let raw = ''
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(raw)
    const file = data.tool_input?.file_path ?? data.tool_response?.filePath ?? '(unknown)'
    const line = `${new Date().toISOString()}\t${data.tool_name}\t${file}\n`
    appendFileSync(logPath, line)
  } catch {
    // A logging hook must never break your session — swallow errors.
  }
})
