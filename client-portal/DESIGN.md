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

| Role | Size | Weight | Colour |
|---|---|---|---|
| Page title (e.g. "Dashboard") | ~22px | SemiBold 600 | Ink |
| Entity name (a client, a project — the thing itself) | ~18px | SemiBold 600 | Ink |
| Subhead / secondary heading | ~14px | Medium 500 | Graphite |
| Panel section label (the tracked-caps eyebrow) | ~11–12px, UPPERCASE, tracked | SemiBold 600 | Graphite |
| Table column header | ~12px, normal case | Medium 500 | Graphite |
| Body & table text | ~14px | Regular 400 | Ink (Graphite for secondary/muted body) |
| Small meta (timestamps, counts, captions) | ~11px | Medium 500 | Slate |

- **Never** use a giant display heading. A page title is a modest label, not a hero — this stays a
  dense tool, not a marketing page.
- Hierarchy comes from **weight, colour, AND a disciplined size scale.** Each level must be visibly
  distinct from the one above and below — if two different kinds of thing render at the same size and
  weight, the hierarchy has failed.
- **Use the neutral ramp systematically:** Ink = primary (page titles, entity names, body text),
  Graphite = secondary (subheads, section labels, column headers, muted body), Slate = meta/muted.
  Per §2's contrast rule, Slate is for *larger or non-essential* meta only — never small running body
  text; where a small meta value must be read reliably, use Graphite instead.
- The steps are real but tight — ~22 → ~18 → ~14 → ~12 → ~11 — and no level collides with its
  neighbour in BOTH size and weight (e.g. the 12px section label is SemiBold UPPERCASE tracked, while
  the 12px column header is Medium normal-case: same size, deliberately different weight and case).
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
- **Entity names are NOT section labels — give them the entity treatment, not the eyebrow.** A
  section label ("PROJECTS", "EXECUTIVE SUMMARY", "TIMELINE & VELOCITY") names a *kind of panel* and
  KEEPS the identical tracked-caps Graphite eyebrow, zero variation — the rule directly above stands.
  An **entity name** — a specific client, a specific project — is not a label for a section; it is the
  thing itself, and takes the Entity-name treatment from the §3 scale: larger, **mixed-case, Ink**,
  SemiBold. The "NEVER a large mixed-case Ink heading" ban above applies to PANEL TITLES only — it
  never applies to entity names. Today "NIKI INC" (an entity) renders identically to "PROJECTS" (a
  label); that collision is the bug this fixes — the reader cannot tell a name from a section heading.
- **Every distinct section gets its own panel** — including admin ENTRY FORMS (Add milestone, Add
  month, Add risk). A form is not left floating loose next to display panels; it sits in its own
  Card, same grid-motif, so admin and client both see a clean boxed layout.
- Panels in a grid row share equal height and align cleanly (per §4.5).

---

## 4.8 Surface hierarchy & scannability (figure/ground)

Light-dominant does NOT mean white-on-white. The flat, hard-to-scan pages came from one thing:
Paper cards on a Paper page, with no figure/ground. The fix is a single move at the PAGE level —
tint the canvas, keep the cards Paper. That is the whole law. Nothing here loosens the brand: no
shadows, no gradients, light still dominates, one accent (Deep ocean), no new hues.

> **Learned the hard way.** An earlier version of this section also permitted Ocean-tint fills on
> table headers and section bands INSIDE cards. It was built, looked at, and rejected on sight — it
> made every card busy and cluttered, reading as decoration, not structure. That permission is now a
> prohibition (below). Figure/ground lives at the page level only; inside a card, restraint rules.

- **Figure/ground is mandatory — and it is a PAGE-LEVEL move only.** The app canvas takes a subtle
  **Mist** (`#e7e7e8`) tint; Cards/panels are Paper (`#ffffff`) sitting ON that canvas. Surfaces
  separate by the Paper-on-Mist contrast plus the hairline Platinum border — this REPLACES the old
  white-card-on-white-page, which had no figure/ground and read as one flat sheet. This single change
  fixed the flatness; it is the real win of this section.
- **Do NOT tint inside cards.** No fill on table header rows, no banded section headers, no tinted
  sub-tables or nested lists — nothing static inside a Card gets a background fill. Inside a card,
  hierarchy comes ONLY from the type scale (§3), hairline Platinum dividers, and space. A tint inside
  a card reads as decoration, not structure, and violates §1.5. This was tried and rejected in
  practice — treat it as settled, not open.
- **Ocean-tint is for INTERACTIVE state, never static structure.** The one sanctioned use of
  Ocean-tint (`#e9edf2`) as a fill is a **row hover** or a **selected row** — the affordance signal
  from §5. That is a transient interaction cue, not a structural band. Keep it subtle. (A dense table
  may still use a very faint Mist zebra per §5, but reach for space and dividers first.)
- **Reconciling with §4 ("Outline for structure, fill for emphasis"):** intact and reinforced.
  Structure is carried by outline (hairline borders) and space — NOT by tinted fills. The only fills
  are the rare Deep-ocean-FILLED emphasis element (§4) and the Ocean-tint interactive state above.
- **Restraint governs.** ONE canvas tint (Mist), held everywhere; Paper cards on top; no tint within.
  When in doubt, choose the quieter step (§0).

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

### Interactive affordance — it must look interactive without discovery

Anything interactive must LOOK interactive without requiring discovery. The reader should never have
to hover blindly to find out where the interactions are.

- **Clickable / editable cells and rows** get a pointer cursor (`cursor-pointer`) AND an Ocean-tint
  hover fill (per §4.8). An editable value shows a subtle hover affordance — a tint fill, or a quiet
  Platinum outline appearing on hover — that says "you can change me."
- **If a user has to guess, or hover blindly to find an interaction, the affordance has failed.** A
  primitive that does something on click must signal that it is clickable BEFORE the click.
- **Reconciling with "row actions reveal on hover" (§5):** hover-reveal is fine for SECONDARY actions
  (Edit / Delete) on a row that is ITSELF already obviously interactive. It is NOT acceptable as the
  ONLY signal that a primitive — an editable grid cell, an inline-editable value — is interactive at
  all. The primary "this is interactive" cue must be present without hover; hover-reveal only layers
  secondary actions on top of an already-legible affordance.
- **Stay calm.** Affordances use the sanctioned quiet vocabulary — Ocean-tint fill, Platinum outline,
  pointer cursor, focus ring in Deep ocean. No new colours, no shadows, no loud hover states.

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
