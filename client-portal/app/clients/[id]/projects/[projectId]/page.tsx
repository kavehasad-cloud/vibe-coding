import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ExecSummary } from "../../../../exec-summary";
import { GanttChart } from "../../../../gantt-chart";
import { NewMilestoneForm } from "../../../../new-milestone-form";
import { AllocationGrid } from "../../../../allocation-grid";
import { NewAllocationForm } from "../../../../new-allocation-form";
import { RiskRow } from "../../../../risk-row";
import { NewRiskForm } from "../../../../new-risk-form";
import { AppShell } from "@/app/app-shell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_LABELS, HEALTH_STYLES } from "@/app/status-labels";
import { PANEL_TITLE } from "@/app/panel-title";

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
    .select("name, status, health, client_id, summary, asks, issues")
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

  const { data: allocations } = await supabase
    .from("allocations")
    .select("id, month, planned_fte, actual_fte")
    .eq("project_id", projectId)
    .order("month");

  const allAllocations = allocations ?? [];

  return (
    <AppShell maxWidth="max-w-5xl">
      <Link
        href={`/clients/${id}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Back to client
      </Link>

      <div className="mt-6 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        {/* Block 1 — Status & Pulse */}
        <Card className="rounded-lg border ring-0">
          <CardHeader>
            <CardTitle className={PANEL_TITLE}>Status &amp; Pulse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-semibold tracking-tight">
                {project.name}
              </h1>
              {showHealth ? (
                <span
                  className={`shrink-0 rounded-md border px-2 py-1 text-xs ${
                    HEALTH_STYLES[project.health] ?? ""
                  }`}
                >
                  {project.health}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
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
          </CardContent>
        </Card>

        {/* Block 2 — Executive Summary */}
        <Card className="rounded-lg border ring-0">
          <CardHeader>
            <CardTitle className={PANEL_TITLE}>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecSummary
              projectId={projectId}
              projectPath={projectPath}
              summary={project.summary}
              asks={project.asks}
              issues={project.issues}
              readOnly={!isAdmin}
            />
          </CardContent>
        </Card>

        {/* Block 3 — Timeline & Velocity (milestones) — full-width band */}
        <Card className="rounded-lg border ring-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className={PANEL_TITLE}>Timeline &amp; Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <GanttChart
              tasks={allMilestones}
              projectPath={projectPath}
              readOnly={!isAdmin}
            />
          </CardContent>
        </Card>

        {/* Block 3 (admin) — Add milestone entry form, its own panel */}
        {isAdmin ? (
          <Card className="rounded-lg border ring-0 lg:col-span-2">
            <CardHeader>
              <CardTitle className={PANEL_TITLE}>Add milestone</CardTitle>
            </CardHeader>
            <CardContent>
              <NewMilestoneForm
                projectId={projectId}
                projectPath={projectPath}
              />
            </CardContent>
          </Card>
        ) : null}

        {/* Block 3.5 — Resource plan (monthly FTE, allocations) */}
        <Card className="rounded-lg border ring-0">
          <CardHeader>
            <CardTitle className={PANEL_TITLE}>
              Resource plan (monthly FTE)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationGrid
              allocations={allAllocations}
              projectPath={projectPath}
              readOnly={!isAdmin}
            />
          </CardContent>
        </Card>

        {/* Block 5 — Risks & Dependencies (risks) */}
        <Card className="rounded-lg border ring-0">
          <CardHeader>
            <CardTitle className={PANEL_TITLE}>Risks &amp; Dependencies</CardTitle>
          </CardHeader>
          <CardContent>
            {allRisks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No risks yet</p>
            ) : (
              <div className="overflow-hidden rounded-lg border">
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
          </CardContent>
        </Card>

        {/* Block 3.5 (admin) — Add month entry form, its own panel */}
        {isAdmin ? (
          <Card className="rounded-lg border ring-0">
            <CardHeader>
              <CardTitle className={PANEL_TITLE}>Add month</CardTitle>
            </CardHeader>
            <CardContent>
              <NewAllocationForm
                projectId={projectId}
                projectPath={projectPath}
              />
            </CardContent>
          </Card>
        ) : null}

        {/* Block 5 (admin) — Add risk entry form, its own panel */}
        {isAdmin ? (
          <Card className="rounded-lg border ring-0">
            <CardHeader>
              <CardTitle className={PANEL_TITLE}>Add risk</CardTitle>
            </CardHeader>
            <CardContent>
              <NewRiskForm projectId={projectId} projectPath={projectPath} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
