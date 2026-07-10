import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/app-shell";
import { FteRoadmap } from "@/app/fte-roadmap";

export default async function PortalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("client_id")
    .eq("id", user.id)
    .single();

  if (!profile?.client_id) {
    redirect("/login");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("name")
    .eq("id", profile.client_id)
    .single();

  if (!client) {
    redirect("/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, health")
    .eq("client_id", profile.client_id)
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
      <h1 className="text-3xl font-semibold tracking-tight">{client.name}</h1>

      <h2 className="mt-8 text-xl font-medium">Roadmap</h2>

      {projectList.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No projects yet</p>
      ) : (
        <FteRoadmap
          clientId={profile.client_id}
          projects={projectList}
          milestones={milestones}
          allocations={allocations}
        />
      )}
    </AppShell>
  );
}
