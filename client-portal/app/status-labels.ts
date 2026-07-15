// Single source of truth for project status labels and RAG health badge styles.
// Shared by the portal, project detail, dashboard, and the health <select> so
// the labels/colors can't silently fork across pages.

import {
  CircleDashed,
  Activity,
  PauseCircle,
  CheckCircle2,
  XCircle,
  Circle,
  type LucideIcon,
} from "lucide-react";

// Human-readable label for each project lifecycle status.
// Keys match the DB CHECK constraint on projects.status.
export const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Monochrome status glyphs — colour stays reserved for the RAG health dot
// (DESIGN §6), so lifecycle is carried by icon shape + neutral ink, never hue.
// Every projects.status value maps here; unknown values fall back to
// STATUS_ICON_FALLBACK. Shared by the scorecard header and the dashboard rows.
export const STATUS_ICONS: Record<string, LucideIcon> = {
  not_started: CircleDashed,
  active: Activity,
  on_hold: PauseCircle,
  completed: CheckCircle2,
  cancelled: XCircle,
};

// Fallback glyph for any unknown status value.
export const STATUS_ICON_FALLBACK: LucideIcon = Circle;

// Tailwind classes for a project's RAG health badge/control.
// Keys match the DB CHECK constraint on projects.health.
export const HEALTH_STYLES: Record<string, string> = {
  green: "border-green-500 bg-green-50 text-green-700",
  amber: "border-amber-500 bg-amber-50 text-amber-700",
  red: "border-red-500 bg-red-50 text-red-700",
};

// Human-readable RAG health labels — the meaning behind the colour, so the
// signal reads without relying on colour alone (accessibility + calm register).
// Keys match the DB CHECK constraint on projects.health.
export const HEALTH_LABELS: Record<string, string> = {
  green: "On track",
  amber: "At risk",
  red: "Off track",
};
