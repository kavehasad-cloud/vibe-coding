import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { STATUS_LABELS } from "@/app/status-labels";
import { formatCurrency, parseDate, todayMidnight } from "@/app/format";
import { NewClientForm } from "@/app/new-client-form";
import { ClientBoxControls } from "@/app/client-box-controls";
import { Button } from "@/components/ui/button";

type DashboardProject = {
  id: string;
  name: string;
  status: string;
  health: string;
  clientId: string;
  budget: number | null;
  actualSpend: number | null;
};

type ClientRecord = {
  id: string;
  name: string;
  contactEmail: string | null;
};

// Solid traffic-light dot fills, keyed by RAG health. Distinct from HEALTH_STYLES
// (bordered badges); this is the dot variant already used by the summary strip.
const HEALTH_DOT: Record<string, string> = {
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

// The project list only surfaces work that is live or about to start; completed
// and cancelled projects are dropped. Rank drives the in-box sort order.
const LISTED_STATUS_RANK: Record<string, number> = {
  active: 0,
  on_hold: 1,
  not_started: 2,
};

// "Live" = in-flight work. Health is only meaningful for live projects, so the
// green/amber/red mix is always tallied over this set (and sums to its size).
function isLive(p: DashboardProject): boolean {
  return p.status === "active" || p.status === "on_hold";
}

// At-a-glance counts for a set of projects: total · live · active · RAG mix.
// Reused for both the global strip (all projects) and each per-client box. An
// empty live set renders 0/0/0 — the filters below never divide, so no NaN.
function StatusStrip({ projects }: { projects: DashboardProject[] }) {
  const total = projects.length;
  const activeCount = projects.filter((p) => p.status === "active").length;
  const live = projects.filter(isLive);
  const greenCount = live.filter((p) => p.health === "green").length;
  const amberCount = live.filter((p) => p.health === "amber").length;
  const redCount = live.filter((p) => p.health === "red").length;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span>
        <span className="font-medium">{total}</span>{" "}
        <span className="text-muted-foreground">projects</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span>
        <span className="font-medium">{live.length}</span>{" "}
        <span className="text-muted-foreground">live</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span>
        <span className="font-medium">{activeCount}</span>{" "}
        <span className="text-muted-foreground">active</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${HEALTH_DOT.green}`} />
        <span className="font-medium">{greenCount}</span>{" "}
        <span className="text-muted-foreground">green</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${HEALTH_DOT.amber}`} />
        <span className="font-medium">{amberCount}</span>{" "}
        <span className="text-muted-foreground">amber</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${HEALTH_DOT.red}`} />
        <span className="font-medium">{redCount}</span>{" "}
        <span className="text-muted-foreground">red</span>
      </span>
    </div>
  );
}

// Variance = actual − budget. Positive = over budget (bad, red); zero/negative =
// on/under budget (good, green). Mirrors the Variance component in financials.tsx.
function VarianceFigure({
  budget,
  actual,
  showPct = false,
}: {
  budget: number;
  actual: number;
  showPct?: boolean;
}) {
  const diff = actual - budget;
  const overBudget = diff > 0;
  const magnitude = formatCurrency(Math.abs(diff));
  // Guard divide-by-zero when budget is 0.
  const pct = budget !== 0 ? Math.round((Math.abs(diff) / budget) * 100) : 0;
  return (
    <span className={overBudget ? "text-red-700" : "text-green-700"}>
      {overBudget ? "+" : "-"}
      {magnitude}
      {showPct ? ` (${pct}% ${overBudget ? "over" : "under"} budget)` : ""}
    </span>
  );
}

// Budget/actual over the non-cancelled projects only — a cancelled project's
// budget is an abandoned commitment. Nulls count as 0.
function ClientFinancials({ projects }: { projects: DashboardProject[] }) {
  const inScope = projects.filter((p) => p.status !== "cancelled");
  const budget = inScope.reduce((s, p) => s + (p.budget ?? 0), 0);
  const actual = inScope.reduce((s, p) => s + (p.actualSpend ?? 0), 0);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span>
        <span className="text-muted-foreground">Budget</span>{" "}
        <span className="font-medium">{formatCurrency(budget)}</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span>
        <span className="text-muted-foreground">Actual</span>{" "}
        <span className="font-medium">{formatCurrency(actual)}</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span>
        <span className="text-muted-foreground">Variance</span>{" "}
        <VarianceFigure budget={budget} actual={actual} showPct />
      </span>
    </div>
  );
}

async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Fail closed, same as the home page: only an explicit admin sees the roll-up.
  if (profileError || profile?.role !== "admin") {
    redirect("/portal");
  }

  // Every client for this owner (RLS scopes to owner). Boxes are driven by this
  // list, not by the projects query, so a client with zero projects still gets a
  // (manageable) box.
  const { data: clientRows } = await supabase
    .from("clients")
    .select("id, name, contact_email")
    .order("name");

  const clients: ClientRecord[] = (clientRows ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    contactEmail: (c.contact_email as string | null) ?? null,
  }));

  // Every project for this owner (RLS scopes to owner). Grouped by client_id
  // below; client names come from the clients query above.
  const { data: rows } = await supabase
    .from("projects")
    .select("id, name, status, health, client_id, budget, actual_spend")
    .order("created_at");

  const projects: DashboardProject[] = (rows ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    status: r.status as string,
    health: r.health as string,
    clientId: r.client_id as string,
    budget: (r.budget as number | null) ?? null,
    actualSpend: (r.actual_spend as number | null) ?? null,
  }));

  // One broad milestone query (RLS scopes to owner): just what's needed to find
  // each project's earliest start. No date/status filter — we bucket in JS.
  const { data: milestoneRows } = await supabase
    .from("milestones")
    .select("project_id, start_date");

  // earliestStart per project = min of its milestone start_dates. A project
  // absent from this map has no dated milestones (undated → always listed).
  const earliestStartByProject = new Map<string, Date>();
  for (const row of milestoneRows ?? []) {
    const m = row as { project_id: string; start_date: string | null };
    if (!m.start_date) continue;
    const start = parseDate(m.start_date);
    const current = earliestStartByProject.get(m.project_id);
    if (!current || start.getTime() < current.getTime()) {
      earliestStartByProject.set(m.project_id, start);
    }
  }

  // Relevance horizon: a listed project must start on or before today + 2 months
  // (or be undated). todayMidnight compares cleanly against parsed date-only values.
  const today = todayMidnight();
  const horizon = new Date(
    today.getFullYear(),
    today.getMonth() + 2,
    today.getDate()
  );
  const horizonMs = horizon.getTime();

  // Group projects by client_id.
  const byClient = new Map<string, DashboardProject[]>();
  for (const p of projects) {
    const list = byClient.get(p.clientId) ?? [];
    list.push(p);
    byClient.set(p.clientId, list);
  }

  // A project is listed if it's live/starting soon: status in the listed set AND
  // (undated OR earliest start within the horizon).
  function isListed(p: DashboardProject): boolean {
    if (!(p.status in LISTED_STATUS_RANK)) return false;
    const start = earliestStartByProject.get(p.id);
    if (!start) return true;
    return start.getTime() <= horizonMs;
  }

  // Within a box: active → on_hold → not_started, then earliest start ascending
  // (undated last in its status group), then name A→Z for a stable tiebreak.
  function compareListed(a: DashboardProject, b: DashboardProject): number {
    const rank = LISTED_STATUS_RANK[a.status] - LISTED_STATUS_RANK[b.status];
    if (rank !== 0) return rank;
    const sa = earliestStartByProject.get(a.id);
    const sb = earliestStartByProject.get(b.id);
    if (sa && sb && sa.getTime() !== sb.getTime()) {
      return sa.getTime() - sb.getTime();
    }
    if (sa && !sb) return -1; // dated before undated
    if (!sa && sb) return 1;
    return a.name.localeCompare(b.name);
  }

  // Box order: clients with a red live project first, then amber-live, then the
  // rest; alphabetical by client name within each tier for a stable order.
  function boxPriority(clientProjects: DashboardProject[]): number {
    const live = clientProjects.filter(isLive);
    if (live.some((p) => p.health === "red")) return 0;
    if (live.some((p) => p.health === "amber")) return 1;
    return 2;
  }

  // One box per client (from the clients list, so zero-project clients appear).
  const clientBoxes = clients
    .map((c) => {
      const clientProjects = byClient.get(c.id) ?? [];
      return {
        clientId: c.id,
        name: c.name,
        contactEmail: c.contactEmail,
        projects: clientProjects,
        listed: clientProjects.filter(isListed).sort(compareListed),
        priority: boxPriority(clientProjects),
      };
    })
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Roll-up across all clients and projects.
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </div>

      {clients.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No clients yet</p>
      ) : (
        <>
          {/* Global summary strip: at-a-glance counts across all projects */}
          <div className="mt-6">
            <StatusStrip projects={projects} />
          </div>

          {/* One box per client */}
          <div className="mt-8 space-y-6">
            {clientBoxes.map((box) => (
              <section key={box.clientId} className="rounded-lg border p-4">
                {/* Header: large name anchor + inline edit/delete controls */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/clients/${box.clientId}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {box.name}
                  </Link>
                  <ClientBoxControls
                    client={{
                      id: box.clientId,
                      name: box.name,
                      contact_email: box.contactEmail,
                    }}
                    projectCount={box.projects.length}
                  />
                </div>

                {/* Per-client status strip */}
                <div className="mt-2">
                  <StatusStrip projects={box.projects} />
                </div>

                {/* Per-client financials */}
                <div className="mt-1">
                  <ClientFinancials projects={box.projects} />
                </div>

                {/* Relevant projects */}
                {box.listed.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No active projects in the next 2 months
                  </p>
                ) : (
                  <ul className="mt-3 divide-y rounded-lg border">
                    {box.listed.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <span
                          aria-hidden
                          className={`size-2 shrink-0 rounded-full ${
                            HEALTH_DOT[p.health] ?? "bg-muted-foreground"
                          }`}
                        />
                        <Link
                          href={`/clients/${box.clientId}/projects/${p.id}`}
                          className="min-w-0 flex-1 truncate font-medium hover:underline"
                        >
                          {p.name}
                        </Link>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </>
      )}

      {/* Add client */}
      <section className="mt-10">
        <h2 className="text-xl font-medium">Add client</h2>
        <NewClientForm />
      </section>
    </main>
  );
}
