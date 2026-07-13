import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { STATUS_LABELS } from "@/app/status-labels";
import { parseDate, todayMidnight, localDateStr } from "@/app/format";
import { NewClientForm } from "@/app/new-client-form";
import { ClientBoxControls } from "@/app/client-box-controls";
import { AppShell } from "@/app/app-shell";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PANEL_TITLE, PANEL, PANEL_HEADER } from "@/app/panel-title";
import { PageHeader } from "@/app/page-header";

type DashboardProject = {
  id: string;
  name: string;
  status: string;
  health: string;
  clientId: string;
};

type FteTotals = { planned: number; actual: number };

type ClientRecord = {
  id: string;
  name: string;
  contactEmail: string | null;
};

// Solid traffic-light dot fills, keyed by RAG health. Distinct from HEALTH_STYLES
// (bordered badges); this is the dot variant already used by the summary strip.
const HEALTH_DOT: Record<string, string> = {
  green: "bg-rag-green",
  amber: "bg-rag-amber",
  red: "bg-rag-red",
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

// FTE printed with at most one decimal: whole numbers stay whole ("3"), fractions
// show one place ("2.5"). No currency — FTE is a plain count of person-months.
function formatFte(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

// Current-month resourcing in FTE (1 FTE = one person-month). Actual over planned
// is flagged red (over-allocated); on/under planned is green — mirrors the old
// money line's color logic, in FTE not €. Shared by the per-client boxes and the
// portfolio total strip; only the leading `label` differs. Empty totals → 0 / 0.
function FteLine({
  label,
  planned,
  actual,
}: {
  label: string;
  planned: number;
  actual: number;
}) {
  const diff = actual - planned;
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>
        <span className="font-medium">{formatFte(planned)}</span>{" "}
        <span className="text-muted-foreground">planned FTE</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span>
        <span className="font-medium">{formatFte(actual)}</span>{" "}
        <span className="text-muted-foreground">actual FTE</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span className={diff > 0 ? "text-rag-red" : "text-rag-green"}>
        {sign}
        {formatFte(Math.abs(diff))} FTE
      </span>
    </div>
  );
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
    .select("id, name, status, health, client_id")
    .order("created_at");

  const projects: DashboardProject[] = (rows ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    status: r.status as string,
    health: r.health as string,
    clientId: r.client_id as string,
  }));

  // Current-month FTE roll-up. allocations store `month` as the 1st of the month
  // (a date, e.g. "2026-07-01"); build that exact local key so .eq matches — a
  // UTC/timestamp-formatted key would match nothing and show 0 for everyone.
  const now = todayMidnight();
  const monthKey = localDateStr(new Date(now.getFullYear(), now.getMonth(), 1));

  const { data: allocRows } = await supabase
    .from("allocations")
    .select("project_id, planned_fte, actual_fte")
    .eq("month", monthKey);

  // Map each allocation to its client via the projects list, summing planned and
  // actual FTE per client. Clients with no row this month stay at 0 / 0.
  const projectToClient = new Map<string, string>();
  for (const p of projects) projectToClient.set(p.id, p.clientId);

  const fteByClient = new Map<string, FteTotals>();
  for (const row of allocRows ?? []) {
    const a = row as {
      project_id: string;
      planned_fte: number | null;
      actual_fte: number | null;
    };
    const clientId = projectToClient.get(a.project_id);
    if (!clientId) continue;
    const acc = fteByClient.get(clientId) ?? { planned: 0, actual: 0 };
    acc.planned += a.planned_fte ?? 0;
    acc.actual += a.actual_fte ?? 0;
    fteByClient.set(clientId, acc);
  }

  // Portfolio current-month totals: sum the per-client FTE across all clients.
  const portfolioFte: FteTotals = { planned: 0, actual: 0 };
  for (const t of fteByClient.values()) {
    portfolioFte.planned += t.planned;
    portfolioFte.actual += t.actual;
  }

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
        fte: fteByClient.get(c.id) ?? { planned: 0, actual: 0 },
      };
    })
    .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));

  return (
    <AppShell maxWidth="max-w-5xl">
      <PageHeader
        title="Dashboard"
        subtitle="Roll-up across all clients and projects."
      />

      {clients.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No clients yet</p>
      ) : (
        <>
          {/* Global summary strip: at-a-glance counts across all projects */}
          <div className="mt-6">
            <StatusStrip projects={projects} />
          </div>

          {/* Portfolio current-month FTE total across all clients */}
          <div className="mt-1">
            <FteLine
              label="This month across all clients:"
              planned={portfolioFte.planned}
              actual={portfolioFte.actual}
            />
          </div>

          {/* One card per client, tiled in a balanced grid (§4.5) */}
          <div className="mt-6 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
            {clientBoxes.map((box) => (
              <Card key={box.clientId} className={PANEL}>
                <CardHeader className={PANEL_HEADER}>
                  <CardTitle className={PANEL_TITLE}>
                    <Link
                      href={`/clients/${box.clientId}`}
                      className="hover:underline"
                    >
                      {box.name}
                    </Link>
                  </CardTitle>
                  <CardAction>
                    <ClientBoxControls
                      client={{
                        id: box.clientId,
                        name: box.name,
                        contact_email: box.contactEmail,
                      }}
                      projectCount={box.projects.length}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  {/* Per-client status strip */}
                  <StatusStrip projects={box.projects} />

                  {/* Per-client current-month FTE */}
                  <div className="mt-1">
                    <FteLine
                      label="This month:"
                      planned={box.fte.planned}
                      actual={box.fte.actual}
                    />
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
                              HEALTH_DOT[p.health] ?? "bg-rag-neutral"
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
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add client — its own titled panel */}
      <Card className={`mt-4 ${PANEL}`}>
        <CardHeader className={PANEL_HEADER}>
          <CardTitle className={PANEL_TITLE}>Add client</CardTitle>
        </CardHeader>
        <CardContent>
          <NewClientForm />
        </CardContent>
      </Card>
    </AppShell>
  );
}
