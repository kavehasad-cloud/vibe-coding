import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/app/nav-bar";
import { NewProjectForm } from "../../new-project-form";
import { ProjectRow } from "../../project-row";
import { FteRoadmap } from "@/app/fte-roadmap";

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
    <main className="mx-auto max-w-4xl px-6 py-12">
      <NavBar />

      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to clients
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {client.name}
      </h1>
      {client.contact_email ? (
        <p className="mt-1 text-muted-foreground">{client.contact_email}</p>
      ) : null}

      <h2 className="mt-8 text-xl font-medium">Roadmap</h2>

      {projectList.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No projects yet</p>
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

      <h2 className="mt-8 text-xl font-medium">Projects</h2>

      {!projects || projects.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No projects yet</p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border">
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} clientId={id} />
          ))}
        </ul>
      )}

      <NewProjectForm clientId={id} />
    </main>
  );
}
