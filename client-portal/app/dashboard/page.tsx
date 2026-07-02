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
          {/* Needs attention */}
          <section className="mt-8">
            <h2 className="text-xl font-medium">Needs attention</h2>
            {attention.length === 0 ? (
              <p className="mt-2 text-muted-foreground">
                All active projects are green — nothing needs attention.
              </p>
            ) : (
              <ul className="mt-4 divide-y rounded-lg border">
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
