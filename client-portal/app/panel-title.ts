// §4.7 — the ONE panel-title treatment, applied to every CardTitle across the
// app with zero variation: small uppercase tracked Graphite Manrope SemiBold.
// Single source of truth so every panel reads as one system.
export const PANEL_TITLE =
  "text-[11px] font-semibold uppercase tracking-wider text-graphite";

// One card language everywhere (DESIGN §4.7): hairline platinum outline, one
// radius, no ring, no shadow. PANEL_HEADER adds the hairline divider under each
// title band, separating the tracked-caps title from content without weight.
export const PANEL = "rounded-lg border ring-0";
export const PANEL_HEADER = "border-b !pb-3";
