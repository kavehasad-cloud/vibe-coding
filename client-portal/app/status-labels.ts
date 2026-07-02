// Single source of truth for project status labels and RAG health badge styles.
// Shared by the portal, project detail, dashboard, and the health <select> so
// the labels/colors can't silently fork across pages.

// Human-readable label for each project lifecycle status.
// Keys match the DB CHECK constraint on projects.status.
export const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Tailwind classes for a project's RAG health badge/control.
// Keys match the DB CHECK constraint on projects.health.
export const HEALTH_STYLES: Record<string, string> = {
  green: "border-green-500 bg-green-50 text-green-700",
  amber: "border-amber-500 bg-amber-50 text-amber-700",
  red: "border-red-500 bg-red-50 text-red-700",
};
