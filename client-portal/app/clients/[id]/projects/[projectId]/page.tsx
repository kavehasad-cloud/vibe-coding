import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { MilestoneRow } from "../../../../milestone-row";
import { NewMilestoneForm } from "../../../../new-milestone-form";

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
    .select("id, name, due_date, is_done")
    .eq("project_id", projectId)
    .order("due_date");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={`/clients/${id}`}
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Back to client
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
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

      <h2 className="mt-8 text-xl font-medium">Milestones</h2>

      {!milestones || milestones.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No milestones yet</p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border">
          {milestones.map((milestone) => (
            <MilestoneRow
              key={milestone.id}
              milestone={milestone}
              projectPath={projectPath}
              readOnly={!isAdmin}
            />
          ))}
        </ul>
      )}

      {isAdmin ? (
        <NewMilestoneForm projectId={projectId} projectPath={projectPath} />
      ) : null}
    </main>
  );
}
