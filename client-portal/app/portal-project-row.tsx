import { RagBadge } from "@/app/rag";
import { STATUS_LABELS, HEALTH_LABELS } from "@/app/status-labels";

// Read-only project row for the client portal — no link (clients have no
// scorecard route), no selects, no Edit/Delete. Nothing here mutates. Mirrors
// the dashboard's project-row look and the scorecard's health gating.
type Project = {
  id: string;
  name: string;
  status: string;
  health: string;
};

export function PortalProjectRow({ project }: { project: Project }) {
  // Health is only meaningful while a project is live (same gating as the
  // scorecard's showHealth and the admin ProjectRow).
  const showHealth =
    project.status === "active" || project.status === "on_hold";

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="min-w-0 flex-1 truncate font-medium">
        {project.name}
      </span>
      {showHealth ? (
        <RagBadge
          rag={project.health}
          label={HEALTH_LABELS[project.health] ?? project.health}
        />
      ) : null}
      <span className="shrink-0 text-sm text-muted-foreground">
        {STATUS_LABELS[project.status] ?? project.status}
      </span>
    </li>
  );
}
