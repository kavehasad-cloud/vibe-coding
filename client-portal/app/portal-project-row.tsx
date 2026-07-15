import Link from "next/link";
import { RagDot } from "@/app/rag";
import {
  STATUS_LABELS,
  HEALTH_LABELS,
  STATUS_ICONS,
  STATUS_ICON_FALLBACK,
} from "@/app/status-labels";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Read-only project row for the client portal — the name links to the (read-
// only) scorecard; no selects, no Edit/Delete. Nothing here mutates. Mirrors
// the dashboard's project-row look and the scorecard's health gating.
type Project = {
  id: string;
  name: string;
  status: string;
  health: string;
};

export function PortalProjectRow({
  project,
  clientId,
}: {
  project: Project;
  clientId: string;
}) {
  // Health is only meaningful while a project is live (same gating as the
  // scorecard's showHealth and the admin ProjectRow).
  const showHealth =
    project.status === "active" || project.status === "on_hold";

  const StatusIcon = STATUS_ICONS[project.status] ?? STATUS_ICON_FALLBACK;
  const statusLabel = STATUS_LABELS[project.status] ?? project.status;
  const healthLabel = HEALTH_LABELS[project.health] ?? project.health;

  return (
    <li className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ocean-tint">
      {/* Name links to the read-only scorecard. Not a whole-row link (keeps the
          quiet read-only register); the row hover-tint is the §5 affordance. */}
      <Link
        href={`/clients/${clientId}/projects/${project.id}`}
        className="min-w-0 flex-1 truncate font-medium text-ink hover:underline"
      >
        {project.name}
      </Link>
      {/* Health as a bigger traffic-light circle; label on hover. role=img +
          aria-label carry the name (the dot is aria-hidden). Mirrors the risk
          severity cell. Only shown while the project is live. */}
      {showHealth ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              role="img"
              aria-label={healthLabel}
              className="inline-flex"
            >
              <RagDot rag={project.health} className="size-2.5" />
            </span>
          </TooltipTrigger>
          <TooltipContent>{healthLabel}</TooltipContent>
        </Tooltip>
      ) : null}
      {/* Status as a monochrome glyph; label on hover. role=img + aria-label
          give it an accessible name since the icon alone says nothing to a
          reader. Mirrors the dashboard's read-only project rows. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="img"
            aria-label={statusLabel}
            className="shrink-0 text-graphite"
          >
            <StatusIcon aria-hidden className="size-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{statusLabel}</TooltipContent>
      </Tooltip>
    </li>
  );
}
