import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { STATUS_LABELS, HEALTH_STYLES } from "@/app/status-labels";

type DashboardProject = {
  id: string;
  name: string;
  status: string;
  health: string;
  clientId: string;
  clientName: string;
};

// One shared shape for both the overdue and upcoming milestone lists — they come
// from the same query and normalization; only the date bucket differs.
type MilestoneItem = {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  dueDate: string;
  dueMs: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Date-only strings (YYYY-MM-DD) parsed from their parts into a LOCAL midnight
// Date, so a UTC parse can't shift the day. Mirrors gantt-chart.tsx / milestone-row.tsx.
function parseDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Local YYYY-MM-DD for a given date, built from local parts (not toISOString,
// which is UTC and could roll the day). Used for the SQL date-range cutoffs.
function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Short "Jul 10" label; mirrors formatShort in gantt-chart.tsx.
function formatShort(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Health is only meaningful for live work, so only active/on_hold projects with
// a red/amber badge count as needing attention (matches the project detail page).
function needsAttention(p: DashboardProject): boolean {
  const isLive = p.status === "active" || p.status === "on_hold";
  return isLive && (p.health === "red" || p.health === "amber");
}

function HealthBadge({ health }: { health: string }) {
  return (
    <span
      className={`shrink-0 rounded-md border px-2 py-1 text-xs capitalize ${
        HEALTH_STYLES[health] ?? ""
      }`}
    >
      {health}
    </span>
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

  // One query: every project for this owner (RLS scopes to owner) + its client
  // name via the FK join. No per-client loop.
  const { data: rows } = await supabase
    .from("projects")
    .select("id, name, status, health, client_id, clients(name)")
    .order("created_at");

  // Normalize the embedded client name — a to-one join may surface as an object
  // or a single-element array depending on type inference.
  const projects: DashboardProject[] = (rows ?? []).map((r) => {
    const clientField = (r as { clients: unknown }).clients;
    const clientName = Array.isArray(clientField)
      ? (clientField[0] as { name?: string } | undefined)?.name ?? "—"
      : (clientField as { name?: string } | null)?.name ?? "—";
    return {
      id: r.id as string,
      name: r.name as string,
      status: r.status as string,
      health: r.health as string,
      clientId: r.client_id as string,
      clientName,
    };
  });

  // Attention: red before amber so the worst surfaces first.
  const attention = projects
    .filter(needsAttention)
    .sort((a, b) => (a.health === "red" ? 0 : 1) - (b.health === "red" ? 0 : 1));

  // Portfolio summary counts (derived, no query). Health is only meaningful for
  // live work, so the green/amber/red mix is tallied over active+on_hold — it
  // sums exactly to the "live" figure. "active" is the true in-flight count.
  const total = projects.length;
  const activeCount = projects.filter((p) => p.status === "active").length;
  const live = projects.filter(
    (p) => p.status === "active" || p.status === "on_hold"
  );
  const liveCount = live.length;
  const greenCount = live.filter((p) => p.health === "green").length;
  const amberCount = live.filter((p) => p.health === "amber").length;
  const redCount = live.filter((p) => p.health === "red").length;

  // Open milestones due on or before today+14: one query covering both the
  // overdue (< today) and upcoming (today..+14) buckets. Filtered in SQL;
  // project + client context comes via nested embeds. RLS scopes to the owner.
  const now = new Date();
  const todayMs = parseDate(localDateStr(now)).getTime();
  const plus14 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);
  const plus14Str = localDateStr(plus14);

  const { data: milestoneRows } = await supabase
    .from("milestones")
    .select("id, name, due_date, project_id, projects(name, client_id, clients(name))")
    .eq("is_done", false)
    .lte("due_date", plus14Str)
    .order("due_date");

  // Normalize the nested project → client embeds (same object-or-array shape
  // guard as the projects query above).
  const milestones: MilestoneItem[] = (milestoneRows ?? []).map((r) => {
    const row = r as {
      id: string;
      name: string;
      due_date: string;
      project_id: string;
      projects: unknown;
    };
    const projectField = Array.isArray(row.projects)
      ? row.projects[0]
      : row.projects;
    const project = (projectField as {
      name?: string;
      client_id?: string;
      clients?: unknown;
    } | null);
    const clientField = project?.clients;
    const clientName = Array.isArray(clientField)
      ? (clientField[0] as { name?: string } | undefined)?.name ?? "—"
      : (clientField as { name?: string } | null)?.name ?? "—";
    return {
      id: row.id,
      name: row.name,
      projectId: row.project_id,
      projectName: project?.name ?? "—",
      clientId: project?.client_id ?? "",
      clientName,
      dueDate: row.due_date,
      dueMs: parseDate(row.due_date).getTime(),
    };
  });

  // Partition by a single comparison so the buckets can't double-count or drop
  // the boundary: due exactly today (dueMs === todayMs) falls into upcoming.
  const overdue = milestones.filter((m) => m.dueMs < todayMs);
  const upcoming = milestones.filter((m) => m.dueMs >= todayMs);

  // Group all projects by client name for the full list (query order preserved
  // within each client; client groups sorted alphabetically).
  const byClient = new Map<string, DashboardProject[]>();
  for (const p of projects) {
    const list = byClient.get(p.clientName) ?? [];
    list.push(p);
    byClient.set(p.clientName, list);
  }
  const clientGroups = [...byClient.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to clients
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">
        Roll-up across all clients and projects.
      </p>

      {projects.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No projects yet</p>
      ) : (
        <>
          {/* Portfolio summary strip: at-a-glance counts across all projects */}
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span>
              <span className="font-medium">{total}</span>{" "}
              <span className="text-muted-foreground">projects</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span>
              <span className="font-medium">{liveCount}</span>{" "}
              <span className="text-muted-foreground">live</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span>
              <span className="font-medium">{activeCount}</span>{" "}
              <span className="text-muted-foreground">active</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-green-500" />
              <span className="font-medium">{greenCount}</span>{" "}
              <span className="text-muted-foreground">green</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              <span className="font-medium">{amberCount}</span>{" "}
              <span className="text-muted-foreground">amber</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-500" />
              <span className="font-medium">{redCount}</span>{" "}
              <span className="text-muted-foreground">red</span>
            </span>
          </div>

          {/* Needs attention */}
          <section className="mt-8">
            <h2 className="text-xl font-medium">Needs attention</h2>
            {attention.length === 0 && overdue.length === 0 ? (
              <p className="mt-2 text-muted-foreground">
                All active projects are green — nothing needs attention.
              </p>
            ) : (
              <div className="mt-4 space-y-6">
                {attention.length > 0 ? (
                  <ul className="divide-y rounded-lg border">
                    {attention.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/clients/${p.clientId}/projects/${p.id}`}
                            className="truncate font-medium hover:underline"
                          >
                            {p.name}
                          </Link>
                          <p className="truncate text-sm text-muted-foreground">
                            {p.clientName} · {STATUS_LABELS[p.status] ?? p.status}
                          </p>
                        </div>
                        <HealthBadge health={p.health} />
                      </li>
                    ))}
                  </ul>
                ) : null}

                {overdue.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Overdue milestones
                    </h3>
                    <ul className="mt-2 divide-y rounded-lg border">
                      {overdue.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <Link
                              href={`/clients/${m.clientId}/projects/${m.projectId}`}
                              className="truncate font-medium hover:underline"
                            >
                              {m.name}
                            </Link>
                            <p className="truncate text-sm text-muted-foreground">
                              {m.projectName} · {m.clientName}
                            </p>
                          </div>
                          {(() => {
                            const days = Math.round((todayMs - m.dueMs) / DAY_MS);
                            return (
                              <span className="shrink-0 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                                {days} {days === 1 ? "day" : "days"} overdue
                              </span>
                            );
                          })()}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          {/* Upcoming deadlines: milestones due today through the next 14 days */}
          <section className="mt-10">
            <h2 className="text-xl font-medium">Upcoming deadlines</h2>
            {upcoming.length === 0 ? (
              <p className="mt-2 text-muted-foreground">
                Nothing due in the next two weeks.
              </p>
            ) : (
              <ul className="mt-4 divide-y rounded-lg border">
                {upcoming.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/clients/${m.clientId}/projects/${m.projectId}`}
                        className="truncate font-medium hover:underline"
                      >
                        {m.name}
                      </Link>
                      <p className="truncate text-sm text-muted-foreground">
                        {m.projectName} · {m.clientName}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      {formatShort(parseDate(m.dueDate))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* All projects, grouped by client */}
          <section className="mt-10">
            <h2 className="text-xl font-medium">All projects</h2>
            <div className="mt-4 space-y-6">
              {clientGroups.map(([clientName, clientProjects]) => (
                <div key={clientName}>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {clientName}
                  </h3>
                  <ul className="mt-2 divide-y rounded-lg border">
                    {clientProjects.map((p) => {
                      const showHealth =
                        p.status === "active" || p.status === "on_hold";
                      return (
                        <li
                          key={p.id}
                          className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                          <Link
                            href={`/clients/${p.clientId}/projects/${p.id}`}
                            className="min-w-0 truncate font-medium hover:underline"
                          >
                            {p.name}
                          </Link>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {STATUS_LABELS[p.status] ?? p.status}
                            </span>
                            {showHealth ? (
                              <HealthBadge health={p.health} />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
