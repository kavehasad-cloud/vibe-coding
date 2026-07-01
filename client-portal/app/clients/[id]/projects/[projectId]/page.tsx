import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { GanttChart } from "../../../../gantt-chart";
import { NewMilestoneForm } from "../../../../new-milestone-form";
import { RiskRow } from "../../../../risk-row";
import { NewRiskForm } from "../../../../new-risk-form";

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

const HEALTH_STYLES: Record<string, string> = {
  green: "border-green-500 bg-green-50 text-green-700",
  amber: "border-amber-500 bg-amber-50 text-amber-700",
  red: "border-red-500 bg-red-50 text-red-700",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>;
}) {
  const { id, projectId } = await params;
  const projectPath = `/clients/${id}/projects/${projectId}`;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: project } = await supabase
    .from("projects")
    .select("name, status, health, client_id")
    .eq("id", projectId)
    .single();

  if (!project) {
    notFound();
  }

  // Prevent cross-client access: the project must belong to the client in the
  // URL. 404 (not 403) so we don't reveal that the project exists elsewhere.
  if (project.client_id !== id) {
    notFound();
  }

  const showHealth =
    project.status === "active" || project.status === "on_hold";

  const { data: milestones } = await supabase
    .from("milestones")
    .select("id, name, start_date, due_date, is_done")
    .eq("project_id", projectId)
    .order("due_date");

  // Block 3 renders these as a Gantt chart (start_date → due_date bars).
  const allMilestones = milestones ?? [];

  const { data: risks } = await supabase
    .from("risks")
    .select("id, description, likelihood, impact, mitigation")
    .eq("project_id", projectId)
    .order("created_at");

  const allRisks = risks ?? [];

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={`/clients/${id}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Back to client
      </Link>

      <div className="mt-6 space-y-6">
        {/* Block 1 — Status & Pulse */}
        <section className="rounded-lg border p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Status &amp; Pulse
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {project.name}
            </h1>
            {showHealth ? (
              <span
                className={`shrink-0 rounded-md border px-2 py-1 text-sm ${
                  HEALTH_STYLES[project.health] ?? ""
                }`}
              >
                {project.health}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-muted-foreground">
            {STATUS_LABELS[project.status] ?? project.status}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <dt>Code:</dt>
              <dd>—</dd>
            </div>
            <div className="flex gap-2">
              <dt>PM:</dt>
              <dd>—</dd>
            </div>
            <div className="flex gap-2">
              <dt>Sponsor:</dt>
              <dd>—</dd>
            </div>
            <div className="flex gap-2">
              <dt>Trend:</dt>
              <dd>—</dd>
            </div>
          </dl>
        </section>

        {/* Block 2 — Executive Summary (placeholder) */}
        <section className="rounded-lg border p-6">
          <h2 className="text-xl font-medium">Executive Summary</h2>
          <p className="mt-2 text-muted-foreground">
            Narrative summary, key asks, and current issues will appear here.
          </p>
        </section>

        {/* Block 3 — Timeline & Velocity (milestones) */}
        <section className="rounded-lg border p-6">
          <h2 className="text-xl font-medium">Timeline &amp; Velocity</h2>

          <GanttChart
            tasks={allMilestones}
            projectPath={projectPath}
            readOnly={!isAdmin}
          />

          {isAdmin ? (
            <NewMilestoneForm projectId={projectId} projectPath={projectPath} />
          ) : null}
        </section>

        {/* Block 4 — Financials & Resources (placeholder) */}
        <section className="rounded-lg border p-6">
          <h2 className="text-xl font-medium">Financials &amp; Resources</h2>
          <p className="mt-2 text-muted-foreground">
            Budget vs actual and resourcing status will appear here.
          </p>
        </section>

        {/* Block 5 — Risks & Dependencies (risks) */}
        <section className="rounded-lg border p-6">
          <h2 className="text-xl font-medium">Risks &amp; Dependencies</h2>

          {allRisks.length === 0 ? (
            <p className="mt-2 text-muted-foreground">No risks yet</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Risk</th>
                    <th className="px-4 py-2 font-medium">Severity</th>
                    <th className="px-4 py-2 font-medium">Mitigation</th>
                    {isAdmin ? (
                      <th className="px-4 py-2 font-medium">Actions</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allRisks.map((risk) => (
                    <RiskRow
                      key={risk.id}
                      risk={risk}
                      projectPath={projectPath}
                      readOnly={!isAdmin}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {isAdmin ? (
            <NewRiskForm projectId={projectId} projectPath={projectPath} />
          ) : null}
        </section>
      </div>
    </main>
  );
}
