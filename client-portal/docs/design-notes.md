# Client Portal — Design Notes

*Phase 10, Stage 2 (Design) · Day 9 · 2026-06-24*

These are the decisions behind the screens. The wireframes themselves were built
as live mockups during the session; **this file is the spec that survives** — what
each screen must contain and how it behaves. Visual polish (fonts, colors, exact
look) is deliberately deferred to a later hi-fi pass.

---

## The screens, and how you move between them

The app is a simple drill-down:

> Log in → **Dashboard** (home) → click a client → **Client detail** (that
> client's projects) → click a project → **Project detail** (the scorecard).

> **Note (superseded):** this originally read "Clients list (home)". Per the
> 2026-07-04 ADR, `/dashboard` is now the home — client-first, one box per client,
> hosting client CRUD — and the standalone clients list at `/` was retired (`/`
> redirects to `/dashboard`). See `docs/decisions.md`.

Two forms branch off: *add/edit client* and *add/edit project* — both now reached
from the dashboard / a client box rather than a separate clients list.

---

## Three ways to see projects

The product shows the same project data at three zoom levels:

1. **Dashboard (zoom out)** — projects as color-coded blocks: code + title only,
   filled by RAG status (green / amber / red). A fast scan of everything.
   *(Not yet wireframed — simple, standard.)*
2. **Client / sprint view (zoom in one)** — the **Gantt**: each project a colored
   bar across the months, FTE per project on the left, monthly resource totals
   along the bottom. The "what are we running for this client, and what's it
   costing in people" view.
3. **Project detail (zoom all the way in)** — the **scorecard**: a one-page status
   report for a single project (below).

---

## The project scorecard — five blocks

A scannable one-pager. The same template works for any project at any stage of its
life (planned, mid-flight, in trouble, winding down) — proven during the session by
rendering it for both a red/in-trouble project and a grey/upcoming one.

1. **Header & pulse** — project name + code, PM + sponsor, overall RAG status +
   trend arrow. Instant health-and-trajectory read.
2. **Executive summary** — 2–3 sentence narrative + "the asks" (decisions needed
   from leadership). Bottom line up front.
3. **Timeline & velocity** — last 2–3 accomplishments (with dates) + next 2–3
   deliverables (with target dates).
4. **Resource plan** — the monthly FTE grid from the `allocations` table: planned
   vs actual FTE per month (and the variance). This replaces the old EUR financials
   (budget vs actual) and the staffed/stretched/bottlenecked resourcing badge, both
   retired — FTE variance is the resource-health signal now.
5. **Risks, blockers & dependencies** — top 2–3 active risks + their mitigations,
   plus hard external dependencies.

### Two rules baked into the scorecard
- **30-day window only.** Show just the milestones moving in the current ~30 days
  (last 2–3 done, next 2–3 upcoming) — never a 50-line Gantt. Keeps it scannable.
- **Risks ≠ issues.** A *risk* is a future problem with a mitigation (block 5). An
  *issue* is a fire happening now (lives in the summary, block 2).

---

## The Gantt — notes
- Each project bar is colored by RAG status; a 4th state, grey = "upcoming / not
  started."
- FTE per project + the **monthly totals row** = the *resources-per-month* rollup.
  In the build this auto-sums whatever's active each month. (This is the
  "resources per month" feature scoped as a *Could* in Stage 1 — the bars + colors
  ship first; the live FTE math is a later slice.)
- Bars are **clickable → open that project's scorecard.** (Gantt = portfolio across
  time; scorecard = deep-dive on one.)

---

## Hi-fi / branding — DELIVERED (Days 24–26)
- **Hi-fi / branding:** fonts, color palette, exact RAG saturation, logo, icons,
  imagery — was deferred here to a later Design pass; that pass is now **delivered**
  (Days 24–26). The app adopted the **EDON brand identity** as its design system.
  - **The spec:** see `DESIGN.md` at repo root — the binding, living design spec
    (Manrope type, one Deep-ocean accent, no shadows/gradients, muted RAG). Not
    duplicated here.
  - **The decisions:** see `docs/decisions.md` (ADRs 2026-07-12 EDON adoption +
    shadcn token remap, 2026-07-13 AppShell/shared chrome + muted RAG register).
- **The asset question** (icon libraries vs AI images vs logo tools vs video) —
  resolved as part of that pass; the outcome lives in `DESIGN.md`.
- **Remaining wireframes:** login, the two add/edit forms, the dashboard of color
  blocks (now the home) — all simple/standard, quick to draw when needed. (The
  standalone clients list was retired per the 2026-07-04 ADR — `/` redirects to
  `/dashboard`.)

---

## Scope flags carried into Build
- The scorecard is ~15 fields. Build starts with a **skeleton** (header/pulse + the
  milestone window); the richer blocks (financials, risks) come as slices.
- Same for the Gantt's FTE math. **Lean first, features in slices** — the 4-week
  lever.
