# Architecture Decision Record

A running log of significant product & architecture decisions and WHY we made them — so changes are deliberate choices, not silent drift.

Last updated: 2026-07-02

---

## 2026-07-02 — Extract shared status/health label maps into a single module
**Decision:** Moved the duplicated STATUS_LABELS and HEALTH_STYLES maps into one shared `app/status-labels.ts` and imported it everywhere (dashboard, portal, project detail, project-health-select) instead of adding a fourth inline copy.
**Why:** The maps had forked across 3–4 files; a label/color change would have to be made in every copy and could silently drift. A single source of truth means one edit, no drift. (HEALTH_OPTIONS stays local to the health `<select>` — genuinely control-specific, not a shared convention.)
**Status:** Live.

## 2026-07-01 — Money as `numeric`, variance computed on read
**Decision:** Store `budget`/`actual_spend` as `numeric`, and compute financial variance on read instead of storing it.
**Why:** `numeric` is exact for currency (floats drift), and computed variance can't fall out of sync.
**Status:** Live.

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
