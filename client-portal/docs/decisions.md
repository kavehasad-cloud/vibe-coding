# Architecture Decision Record

A running log of significant product & architecture decisions and WHY we made them — so changes are deliberate choices, not silent drift.

Last updated: 2026-07-08

---

## 2026-07-08 — Shared role-aware NavBar; `logout()` + `getSessionRole()` in `app/auth.ts`
**Decision:** Extracted the duplicated inline `logout()` (copied in `dashboard/page.tsx` and `portal/page.tsx`) into one shared server action in `app/auth.ts`, alongside a `getSessionRole()` helper returning `{ role, homeHref }`. Added a single role-aware `NavBar` (home link → `homeHref`, shared Log out) at the top of all four authenticated pages (dashboard, portal, client detail, project scorecard), removing both inline logout copies. Chose **approach A**: `NavBar` self-fetches the session role rather than taking it as a prop.
**Why:** Same single-source-of-truth principle as the `status-labels.ts` (ADR 2026-07-02) and `format.ts` (ADR 2026-07-04) extractions — a copied logout would drift. Self-fetching keeps usage uniform (`<NavBar />` everywhere, no prop-threading) and works on pages that don't already query role (client detail had no role read), at the cost of one indexed `profiles` read per page. `getSessionRole()` is the seam to later consolidate the role queries still scattered inline across pages.
**Status:** Done. Typecheck clean; four pages wired.

## 2026-07-06 — Slice 3: executed the EUR→FTE swap; dropped the money columns
**Decision:** Carried out the switch the 2026-07-05 allocations decision set up. The
`projects.budget`, `projects.actual_spend`, and `projects.resourcing` columns were
**dropped** from the database. The scorecard's "Financials & Resources" block was
removed — the monthly FTE grid (allocations) is now the sole resource view on the
scorecard. On the dashboard, the per-client EUR money line was replaced by a
**current-month FTE** line (planned vs actual FTE + variance), and a **portfolio
total** strip (current-month FTE across all clients) was added to the admin overview.
**Why:** Finish retiring the flat two-number money model in favor of month-by-month
FTE, so resourcing has one source of truth. `resourcing` (staffed / stretched /
bottlenecked) was **retired entirely** rather than relocated: planned-vs-actual FTE
variance is the resource-health signal now, so the manual badge was redundant.
**Status:** Done. Docs (data-model.md, design-notes.md) updated to match; the
2026-07-01 money-model ADR is marked superseded below.

## 2026-07-05 — `allocations` table (project × month FTE) as the resourcing + pricing model
**Decision:** Introduced an `allocations` table (project × month, `planned_fte` + `actual_fte`) as the resourcing and pricing model, replacing the flat `projects.budget` / `actual_spend` columns. FTE (1 FTE = one person-month) is now the unit of both resource planning and client billing. Planned vs actual FTE per month drives the project's resource health; summed across a client's projects it gives the monthly capacity/billing roll-up shown on the client page.
**Why:** The old two-number budget model couldn't express month-by-month resourcing or the FTE-based pricing the consulting practice actually uses. A per-month allocation row is the faithful model — it drives the scorecard resource grid, the client engagement roadmap, and the health signal from one source. Deferred: money/€ pricing (FTE-only for now); a soft "no allocation without a task that month" check; and auto-deriving health (health stays manually set, informed by FTE variance, not auto-derived).
**Status:** In progress — table + RLS live (Slice 1 of 4). Scorecard FTE editing, retiring old financials, and the client-page rollup are the remaining slices.

## 2026-07-04 — /dashboard is the home; retire the standalone clients list
**Decision:** Made `/dashboard` the application home. Retired the standalone clients list page (`/` now redirects to `/dashboard`). Client management (add/edit/delete) moved onto the dashboard, which is now client-first: one box per client with that client's project status, financials, and a filtered project list (active/on-hold/not-started starting within ~2 months, or undated). Boxes are driven by the clients query so zero-project clients still appear and are manageable. Login/signup now redirect to `/dashboard`.
**Why:** The old split (a flat clients list at `/` plus a separate global-sections dashboard) was redundant and the dashboard had grown too dense. A per-client, client-first home matches how the consultant actually reads the portfolio (by client), naturally trims the global sections (health/financials become per-box), and removes a whole page. Client-delete relies on the existing DB ON DELETE CASCADE (client→projects→milestones→risks), guarded by a native `confirm()` that states the blast radius.
**Status:** Done.

## 2026-07-04 — Extract shared date helpers into `app/format.ts`
**Decision:** Moved the shared date helpers (`parseDate`, `localDateStr`, `formatShort`, `todayMidnight`, `formatFull`) into `app/format.ts` as the single source of truth.
**Why:** These helpers (esp. the local-parts UTC-shift guard) were triplicated across `dashboard/page.tsx`, `gantt-chart.tsx`, and `milestone-row.tsx`, each commented as "mirrors the others" — exactly the drift risk ADRs #8 and #9 were created to prevent. `format.ts` already existed as the home for shared formatting. Note: `formatFull` was kept distinct from `formatShort` because milestone-row's date renders WITH the year; collapsing them would have silently dropped it.
**Status:** Done (this slice).

## 2026-07-03 — Extract formatCurrency into a shared module
**Decision:** Moved the `formatCurrency` helper out of `app/financials.tsx` into a shared `app/format.ts`, imported by both the scorecard financials block and the dashboard's portfolio-financials section.
**Why:** Same single-source-of-truth reasoning as the status-labels extraction (ADR 2026-07-02): currency formatting shouldn't fork across pages, or a change (e.g. USD → EUR, or decimal places) would have to be made in multiple copies and could drift.
**Status:** Live.

## 2026-07-02 — Extract shared status/health label maps into a single module
**Decision:** Moved the duplicated STATUS_LABELS and HEALTH_STYLES maps into one shared `app/status-labels.ts` and imported it everywhere (dashboard, portal, project detail, project-health-select) instead of adding a fourth inline copy.
**Why:** The maps had forked across 3–4 files; a label/color change would have to be made in every copy and could silently drift. A single source of truth means one edit, no drift. (HEALTH_OPTIONS stays local to the health `<select>` — genuinely control-specific, not a shared convention.)
**Status:** Live.

## 2026-07-01 — Money as `numeric`, variance computed on read
**Decision:** Store `budget`/`actual_spend` as `numeric`, and compute financial variance on read instead of storing it.
**Why:** `numeric` is exact for currency (floats drift), and computed variance can't fall out of sync.
**Status:** Superseded by the 2026-07-05 allocations/FTE decision — the EUR money model (`budget`/`actual_spend`) was retired and the columns dropped in Slice 3 (2026-07-06, above).

## 2026-07-01 — Cut the "last week / next week" text digest
**Decision:** Drop the planned text digest summarizing recent and upcoming work.
**Why:** The Gantt already conveys done/in-progress/upcoming via the today-line and colors — a text restatement was redundant.
**Status:** Cut (scope removal).

## 2026-07-01 — Gantt tasks reuse the `milestones` table
**Decision:** Add `start_date` to the existing `milestones` table for the Gantt chart rather than introducing a separate tasks table.
**Why:** The milestone's due date already *is* the task end date; reusing the table is the lean MVP.
**Status:** Live.

## 2026-06-30 — Risk RAG severity is derived, not stored
**Decision:** Compute risk severity from a likelihood×impact matrix in code (`risk-rag.ts`); do not persist it.
**Why:** A stored copy can drift out of sync with its inputs; deriving it on read guarantees correctness.
**Status:** Live.

## 2026-06-30 — Authorize every write Server Action with `requireAdmin()`
**Decision:** Each write Server Action calls a `requireAdmin()` helper up front, with RLS kept as a second layer.
**Why:** A Server Action is a POST endpoint reachable directly, so hiding UI is not a security control.
**Status:** Live.

## 2026-06-29 — Role-based access via a `profiles` table, enforced in RLS
**Decision:** Model admin vs client roles in a `profiles` table and enforce access with additive RLS SELECT policies, not app-code checks alone.
**Why:** Authorization must hold at the database even if the UI is bypassed — defense in depth.
**Status:** Live.

## 2026-06-28 — Two independent axes: lifecycle `status` vs RAG `health`
**Decision:** Track project `status` (not_started→cancelled) and `health` (green/amber/red) as two separate columns.
**Why:** Where a project *is* and how it's *going vs plan* are different questions; collapsing them into one field loses information.
**Status:** Live.
