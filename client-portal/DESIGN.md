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

### Type scale (KEEP IT SMALL — this is a dense tool, not a marketing page)

Current headings are TOO BIG. Come down to a tight, professional scale (Linear/Notion register).
These are targets, not marketing sizes — err smaller, never larger:

| Role | Size | Weight |
|---|---|---|
| Page title (e.g. "Dashboard") | ~20-24px | SemiBold 600 |
| Panel / section heading | ~14-16px | SemiBold 600 |
| Subhead | ~13-14px | Medium 500 |
| Body / table text | ~13-14px | Regular 400 |
| Small / meta / eyebrow | ~11-12px | Medium/SemiBold |

- **Never** use a giant display heading. A page title is a modest label, not a hero.
- Hierarchy comes from **weight and colour** (SemiBold Ink vs Regular Graphite), not from big sizes.
- Tighten line-height on headings; keep body comfortable.

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

## 4.5 Layout: DASHBOARD, not report (this is the most important layout rule)

The app must read as a **dashboard** — balanced panels arranged side by side, taken in at a
glance — NOT as a **report** (one section stacked on top of another running down a long scroll).

- **Panels sit in a balanced GRID, side by side.** Where content allows, place panels in a
  multi-column grid (2 columns on a normal screen, more where it fits) rather than a single
  vertical stack. Related information lives next to each other, not below.
- **Balance and align.** Panels in a row share equal width and align to a clean grid. Consistent
  gaps between panels (the 8px rhythm). No ragged, different-width blocks running down the page.
- **Scannable at a glance.** The most important summary (the "is everything OK?" answer) sits at
  the top; detail is arranged in tidy panels below. Avoid making the user scroll through a
  document to find things.
- **Each panel is a grid-motif card** (thin Platinum outline, modest radius, no shadow, generous
  internal padding) — the same card language everywhere.
- **The scorecard specifically:** its blocks (Status, Exec Summary, Timeline, Resource plan,
  Risks) should be laid out as a **balanced 2-column panel grid**, not five full-width blocks
  stacked vertically. Think tiles next to each other, a control-panel view.
- **The dashboard specifically:** the per-client boxes should tile in a balanced grid (already
  partly there) — keep them even and aligned, with the global summary as a compact strip on top.

When a layout feels like a printed document, it's wrong. Rework it into balanced panels.

---

## 4.6 The top bar / nav — HARMONIZED across every page

The top navigation must be **identical on every authenticated page** — same height, same logo
placement, same spacing, same treatment. It is the one constant frame around every screen.

- One shared component, uniform everywhere. No per-page variation in height or style.
- Left: the EDON mark (grid mark for the compact corner). Right: Log out (and any global action).
- A single hairline Platinum divider under it. No shadow.
- Page-specific back-links ("Back to client") live BELOW the bar, in the page content — they are
  not part of the global bar.
- Keep it slim and quiet — it frames the content, it doesn't compete with it.

---

## 4.7 Panels & panel titles (RIGID, uniform — no variation)

Every panel/card in the app follows ONE structure so the whole app reads as one system.

- **Panel = a shadcn `Card`** (use the real shadcn Card component, pulled via the shadcn MCP — do
  not hand-roll `<div className="rounded-lg border">`). Thin Platinum outline, modest radius,
  NO shadow, generous internal padding.
- **Panel titles are IDENTICAL everywhere** — this is the one title treatment, applied to every
  panel header with zero variation:
  - Small, **UPPERCASE**, letter-spaced (tracked), **Graphite** (`#6d6e71`), Manrope SemiBold,
    ~11–12px. (The "STATUS & PULSE" eyebrow style — now the standard for ALL panel titles.)
  - Examples: "EXECUTIVE SUMMARY", "TIMELINE & VELOCITY", "RESOURCE PLAN", "RISKS & DEPENDENCIES".
  - NEVER a large, mixed-case, Ink panel heading. Titles are quiet tracked-caps labels, clearly
    distinct from body text (which is Ink, normal case).
- **Every distinct section gets its own panel** — including admin ENTRY FORMS (Add milestone, Add
  month, Add risk). A form is not left floating loose next to display panels; it sits in its own
  Card, same grid-motif, so admin and client both see a clean boxed layout.
- Panels in a grid row share equal height and align cleanly (per §4.5).

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
