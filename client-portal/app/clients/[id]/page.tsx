import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/app/app-shell";
import { NewProjectForm } from "../../new-project-form";
import { ProjectRow } from "../../project-row";
import { FteRoadmap } from "@/app/fte-roadmap";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PANEL_TITLE, PANEL, PANEL_HEADER } from "@/app/panel-title";
import { PageHeader } from "@/app/page-header";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  // Fail closed: only an explicit admin sees the client management page.
  if (profileError || profile?.role !== "admin") {
    redirect("/portal");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("name, contact_email")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, health, created_at")
    .eq("client_id", id)
    .order("created_at");

  const projectList = projects ?? [];
  const projectIds = projectList.map((p) => p.id);

  // Milestones drive each project's bar span; allocations fill the month cells.
  // Both scoped to this client's projects via .in (RLS also enforces it). Skip
  // the round-trip entirely when the client has no projects.
  const [milestonesRes, allocationsRes] = projectIds.length
    ? await Promise.all([
        supabase
          .from("milestones")
          .select("id, project_id, start_date, due_date")
          .in("project_id", projectIds),
        supabase
          .from("allocations")
          .select("project_id, month, planned_fte, actual_fte")
          .in("project_id", projectIds)
          .order("month"),
      ])
    : [{ data: [] }, { data: [] }];

  const milestones = milestonesRes.data ?? [];
  const allocations = allocationsRes.data ?? [];

  return (
    <AppShell maxWidth="max-w-4xl">
      <PageHeader
        backHref="/"
        backLabel="Back to clients"
        title={client.name}
        subtitle={client.contact_email}
      />

      <div className="mt-6 space-y-4">
        <Card className={PANEL}>
          <CardHeader className={PANEL_HEADER}>
            <CardTitle className={PANEL_TITLE}>Roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            {projectList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects yet</p>
            ) : (
              <FteRoadmap
                clientId={id}
                projects={projectList}
                milestones={milestones}
                allocations={allocations}
                monthsBefore={2}
                monthsAfter={3}
              />
            )}
          </CardContent>
        </Card>

        <Card className={PANEL}>
          <CardHeader className={PANEL_HEADER}>
            <CardTitle className={PANEL_TITLE}>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {!projects || projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects yet</p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {projects.map((project) => (
                  <ProjectRow key={project.id} project={project} clientId={id} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className={PANEL}>
          <CardHeader className={PANEL_HEADER}>
            <CardTitle className={PANEL_TITLE}>Add project</CardTitle>
          </CardHeader>
          <CardContent>
            <NewProjectForm clientId={id} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
