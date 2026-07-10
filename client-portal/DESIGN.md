# EDON ERP — Design System (operational rules)

> This file is the single source of truth for how EDON ERP looks and feels. It is the
> operational translation of the locked EDON brand identity. When building or restyling
> ANY UI, follow these rules. They are not suggestions. When in doubt, choose the calmer,
> quieter, more spacious option.

---

## 0. The one-sentence brief

EDON ERP is a **dense product UI** (tables, grids, scorecards, forms) that must feel
**modern, minimal, bright, and expensive** — the Mont Blanc / Apple register. Premium
through **clarity, not ornament**. Light-dominant, generous space, one signature colour
used with intent. Calm on first load; detail on demand.

**This is NOT a marketing/landing page.** Never reach for a bold hero, a dramatic display
font, a gradient, or a "get started" splash. The value is the data and its legibility.

---

## 1. The hard laws (never break these)

1. **No shadows.** No `box-shadow`, no `shadow-*` utilities. Separation comes from hairline
   borders and negative space, never from elevation.
2. **No gradients.** Flat, matte surfaces only. Ever.
3. **Light always dominates.** Paper (`#ffffff`) is the default background. Dark surfaces
   (Deep ocean) are the rare, intentional exception, not the theme.
4. **Colour is the exception, not the rule.** Deep ocean is the ONE signature, used with
   intent on the things that matter. Neutrals carry almost everything. Sage appears rarely.
5. **Generous space over decoration.** When a layout feels busy, the fix is more negative
   space, not more lines/boxes/colour.
6. **One accent.** Deep ocean `#1f3047` is the only brand colour that carries meaning.
   Do not introduce new hues. (RAG status colours are a separate, functional system — see §6.)

---

## 2. Colour tokens (the locked palette)

Light-to-dark neutrals + one signature blue + one rare support. Encode these as CSS
variables / Tailwind theme tokens; never hardcode hexes in components.

### Neutrals
| Token | Hex | Role |
|---|---|---|
| `paper` | `#ffffff` | Primary background |
| `mist` | `#e7e7e8` | Surfaces, cards, subtle fills |
| `platinum` | `#c4c6c9` | Fine lines, hairline borders, detailing |
| `slate` | `#919295` | Lines, large/muted text (NOT small body) |
| `graphite` | `#6d6e71` | Secondary text |
| `ink` | `#1a1b1d` | Primary text |

### Signature blue
| Token | Hex | Role |
|---|---|---|
| `ocean-tint` | `#e9edf2` | Subtle fills, section backgrounds, selected rows |
| `ocean` | `#1f3047` | THE signature. Primary actions, key emphasis, active nav |
| `ocean-dark` | `#16233a` | Hover / pressed / depth on ocean surfaces |

### Support
| Token | Hex | Role |
|---|---|---|
| `sage` | `#74837a` | Accent / fills, used RARELY — one distinct area or a touch of life |

### Contrast rules (WCAG-checked)
- **Ink on Paper** (~17:1) and **Deep ocean on Paper** (~13:1): safe for text at any size,
  including Paper text reversed on a Deep ocean surface.
- **Graphite**: the secondary-text grey; clears the bar for body copy.
- **Slate, Sage, Platinum**: for large text, lines, fills, and detailing ONLY — never small body text.

---

## 3. Typography

Two faces, strict division of labour. Both are free Google Fonts.

- **Manrope** — EVERYTHING except the logo: headings, subheads, body, UI, tables, numbers.
  - `SemiBold 600` — headings and tracked eyebrows (small uppercase section markers)
  - `Medium 500` — subheads
  - `Regular 400` — body
  - Graphite is the secondary-text colour.
- **Tenor Sans** — the LOGO ONLY (wordmark + grid mark). Never in running text, never in UI.
  Single weight, editorial, light — it's a mark, not a typeface for content.

Numbers in tables/grids: use tabular figures (`tabular-nums`) so columns align.

**Eyebrows / section markers:** small, uppercase, tracked (letter-spaced), Graphite or Slate,
Manrope SemiBold — matches the brand doc's "OUR VALUES" / "STAT TILES" style.

---

## 4. Shape & space

- **The grid motif is the brand's signature device.** The logo is a 2×2 of thin-outlined,
  slightly-rounded squares. Echo it: cards, tiles, and stat blocks are **thin-outlined,
  slightly-rounded rectangles** (border in Platinum, small-to-medium radius). "Outline for
  structure, fill for emphasis" — most cells are outlined; the rare important one is filled Deep ocean.
- **Radius:** consistent, modest rounding (the logo squares' feel). Pick ONE radius scale and
  hold it everywhere. No pill shapes, no sharp corners mixed with round.
- **Borders:** hairline, Platinum (`#c4c6c9`). This is how surfaces separate — not shadows.
- **Spacing:** generous and consistent. Use an 8px rhythm. Err toward MORE whitespace.
  Density should come from clean alignment, not cramming.

---

## 5. Component rules (dense product UI)

- **Tables/grids:** right-align numbers (`tabular-nums`), left-align text. Separate rows with
  hairline Platinum borders or a very subtle Mist zebra — NOT heavy borders or shadows.
  Sticky headers where a table scrolls. Keep row height comfortable, not cramped.
- **Row actions:** reveal on hover (or a quiet kebab), don't line up 5 always-visible buttons.
- **Primary action:** Deep ocean fill, Paper text. ONE primary per view. Everything else is a
  quiet outline or ghost button (Ink/Graphite text, Platinum border, Paper fill).
- **Selected / active states:** Ocean-tint fill or an Ocean left-border — subtle, not loud.
- **Inputs:** Paper fill, Platinum border, Ink text; focus ring in Deep ocean.
- **Empty/loading/disabled states:** always designed, always calm. Muted Graphite text, never
  a jarring placeholder.

---

## 6. Status colours (functional — kept separate from brand)

RAG health is a FUNCTIONAL signal, not brand decoration. It coexists with the restraint above:
keep RAG dots/badges small and let the Deep-ocean-and-neutral world stay calm around them.
- Green = on track · Amber = at risk · Red = off track · (neutral grey = not started)
- Use them as small dots or pale bordered badges, never as large colour fields that fight the
  brand's calm. (This mirrors the brand doc's "highlight technique": colour only what matters.)

---

## 7. The logo in-app

- **Grid mark** (2×2 squares) — the compact icon: nav bar corner, favicon, avatar. Use where
  space is square/small.
- **Wordmark** — where there's horizontal room (a wide header, a footer).
- On dark (Deep ocean) surfaces, both reverse to white.
- Both are in Tenor Sans (outlined SVG) — the ONLY place Tenor Sans appears.

---

## 8. How to work (process)

- **Redesign in ROUNDS, screen by screen.** Foundation first (tokens, type, spacing), then
  polish. Converge by looking — screenshot, compare, refine — not one mega-prompt.
- **Screenshot-compare every change** against the brand register (Apple/Mont Blanc calm).
- **Re-check performance** at the end (the pre-design Lighthouse baseline is 97/100/96/100 —
  fonts/images/bundle must not tank it).
- When a screen feels "designed," ask: is it calmer than default shadcn? Is Deep ocean used
  with intent (not sprinkled)? Is there enough space? Would this look at home next to an Apple
  product page? If not, quiet it down.

---

## 9. The tells to avoid (generic-AI look)

Never ship any of these — they are the opposite of the EDON register:
- Inter / Roboto / system-font defaults (we use Manrope).
- Purple/blue gradients, any gradient.
- Drop shadows, glows, elevation.
- Three-column rounded-card "feature grid" hero.
- Loud multi-colour palettes.
- A bright "Get Started" primary-blue button (our primary is Deep ocean, quiet and intentional).
