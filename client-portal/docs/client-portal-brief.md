# Consultant's Client Portal — Product Brief

*Phase 10, Stage 1 (Discover) · Day 9 · 2026-06-23*

---

## The one-liner

A private cockpit for a solo consultant to run their whole practice — clients,
projects, status, time, and money in one place — plus a read-only window where
each client can see exactly where their projects stand.

---

## Who it's for

**Primary user:** the solo strategy/management consultant (i.e. Kaveh — 20+ years
in the field). Juggles several clients at once, each with multiple projects, and
currently tracks it all across email, Drive, spreadsheets, and memory.

**Secondary user:** the consultant's clients — who today have to *ask* for status
updates and dig through email for files and agreements.

---

## The problem

Running a one-person consulting practice means being the consultant *and* the
back office. The admin is scattered and repetitive:

- No single view of **what's running for each client** — how many projects, what
  phase each is in, what's due when.
- **Time/effort** worked per project lives nowhere consistent — yet it's the basis
  for both billing and understanding where the month went.
- **Money** (payment milestones, terms, who's late) lives in the head or a messy
  sheet.
- **Documents** (contracts, deliverables, invoices) are spread across tools.
- Clients **ping for status**, and the consultant rewrites the same update by hand.

It looks unprofessional, wastes billable time, and things slip through.

---

## The value

- One trusted place to answer "what's the state of this client, right now?"
- Less repetitive admin; fewer dropped milestones and late-payment surprises.
- A more established, professional impression — clients log in instead of emailing.
- The data foundation (time per project) that later powers billing and capacity views.

---

## Quick competitor scan

The market splits into tools that each do *part* of this:

- **Project/PM tools** (Asana, Trello, Monday) — strong on tasks, weak on the
  consulting-specific client→project→money→time chain, and not client-facing in
  a simple read-only way.
- **Time-tracking tools** (Toggl, Harvest) — good at hours, but a separate silo.
- **Practice-management suites** (for lawyers/accountants) — closest in spirit,
  but heavy, expensive, and built for other professions.

**The gap we're filling:** a *lightweight, consultant-shaped* tool that ties
clients → projects → status → time → money together, with a clean client-facing
view — without the bloat.

---

## Scope (MoSCoW)

The **MVP is the "Must" list only.** Everything else is the backlog — queued, not
forgotten. The 4-week timeline is real *because* we hold this line.

### Must — the MVP (build first)
- Consultant login (one user: you)
- **Clients** — add / list / edit (name, contact info, notes)
- **Projects under a client** — project code, name, status/phase, milestones with
  deadlines

> This is the **trunk**: clients contain projects; everything else later hangs off
> a project. Useful on its own — you can finally see every client and every
> project's status in one place.

### Should — next, in priority order
1. **Dashboard** — "what needs attention": deadlines/milestones coming up this week
2. **Time/effort logging** — daily hours + short description, tagged to a project
   code, aggregated under the client
3. **Client login + read-only client view** — the second interface; a client logs
   in and sees their own projects, status, and deadlines (same data, filtered &
   read-only)

### Could — once the Shoulds are solid
4. **Invoicing + payment tracking** — payment milestones, amounts, terms, and
   late-payment alerts
5. **Resources-per-month rollup** — total effort/cost per client per month (builds
   directly on time logging)
6. **Document management** — files per client/project (contracts, agreements,
   invoices, deliverables)

### Won't (this time)
7. **Email paper-trail search** — searching Gmail/mail-server exchanges with a
   client by topic. Deferred because it's the only piece that isn't *our own data* —
   it requires integrating an external mail system, a separate effort that bolts on
   from the side rather than growing from the trunk.

---

## The two interfaces (decided)

- **Admin view (yours) — built first.** Full control: create/edit clients,
  projects, terms, deadlines; later, log time, issue invoices.
- **Client view — a later slice (Should #3).** Mostly the *same data shown
  read-only*, filtered to that one client. Far cheaper to build once the admin side
  exists, which is why it comes second, not in parallel.

---

## Definition of done (for the whole product)

The Client Portal is live, has been used by a small handful of real friendly
users, and at least one feedback→iterate loop has happened.

---

## Glossary (plain words)

- **MVP** (Minimum Viable Product) — the smallest version that's genuinely useful,
  built first so you learn fast.
- **Backlog** — the prioritized parking lot of everything you *could* build, in
  order. Nothing's lost; it's queued.
- **MoSCoW** — sorting features into Must / Should / Could / Won't-this-time.
- **Product brief** — this one-pager: what we're building and why. The north star.
- **Interface** — a "view" into the app; here, one for the consultant (full
  control) and one for clients (read-only).
