import Link from "next/link";
import {
  parseDate,
  localDateStr,
  formatMonth,
  todayMidnight,
} from "@/app/format";

type Project = {
  id: string;
  name: string;
  status: string;
  health: string;
};

type Milestone = {
  id: string;
  project_id: string;
  start_date: string | null;
  due_date: string | null;
};

type Allocation = {
  project_id: string;
  month: string;
  planned_fte: number | null;
  actual_fte: number | null;
};

// Solid RAG fills for the roadmap bars — distinct from the exported HEALTH_STYLES
// (bordered badges), same idea as the dashboard's HEALTH_DOT. not_started or an
// unknown health falls back to neutral gray.
const BAR_FILL: Record<string, string> = {
  green: "bg-rag-green",
  amber: "bg-rag-amber",
  red: "bg-rag-red",
};

function barFill(project: Project): string {
  if (project.status === "not_started") return "bg-rag-neutral";
  return BAR_FILL[project.health] ?? "bg-rag-neutral";
}

// FTE with at most one decimal ("2", "1.5") — mirrors the dashboard's formatFte.
function fmtFte(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

// Round to 2 decimals before deciding variance sign, so float artifacts don't
// flip the color (mirrors the scorecard grid's round()).
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Variance color, mirroring the scorecard AllocationGrid: actual over planned
// (positive) is red, under planned (negative) is green, on-plan is muted.
function varianceClass(v: number): string {
  const r = round2(v);
  if (r > 0) return "text-rag-red";
  if (r < 0) return "text-rag-green";
  return "text-muted-foreground";
}

// Month index (year*12 + month) for cheap month-granularity comparisons.
function monthIndex(d: Date): number {
  return d.getFullYear() * 12 + d.getMonth();
}

export function FteRoadmap({
  clientId,
  projects,
  milestones,
  allocations,
  monthsBefore = 1,
  monthsAfter = 2,
}: {
  clientId: string;
  projects: Project[];
  milestones: Milestone[];
  allocations: Allocation[];
  monthsBefore?: number;
  monthsAfter?: number;
}) {
  // Per-project span: earliest milestone start → latest milestone due, falling
  // back to start when a milestone has no due yet so it still contributes.
  const spans = new Map<string, { start: Date; end: Date }>();
  for (const m of milestones) {
    if (!m.start_date) continue;
    const start = parseDate(m.start_date);
    const end = parseDate(m.due_date ?? m.start_date);
    const cur = spans.get(m.project_id);
    if (!cur) {
      spans.set(m.project_id, { start, end });
    } else {
      if (start.getTime() < cur.start.getTime()) cur.start = start;
      if (end.getTime() > cur.end.getTime()) cur.end = end;
    }
  }

  // No dated milestones anywhere → no derivable timeline. Degrade to a plain
  // linked list so the client can still reach each scorecard.
  if (spans.size === 0) {
    return (
      <div className="mt-4">
        <ul className="divide-y rounded-lg border">
          {projects.map((p) => (
            <li key={p.id} className="px-4 py-3">
              <Link
                href={`/clients/${clientId}/projects/${p.id}`}
                className="font-medium hover:underline"
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          No scheduled milestones yet, so there&apos;s no timeline to show.
        </p>
      </div>
    );
  }

  // Month window anchored on today, sized by monthsBefore/monthsAfter (default
  // 1 before + 2 after = the client portal's 4-month view). Keys via
  // localDateStr on the 1st of each month so they match allocations.month.
  const base = todayMidnight();
  const months: { key: string; label: string; index: number }[] = [];
  for (let i = -monthsBefore; i <= monthsAfter; i++) {
    const first = new Date(base.getFullYear(), base.getMonth() + i, 1);
    const key = localDateStr(first);
    months.push({ key, label: formatMonth(key), index: monthIndex(first) });
  }
  const windowStart = months[0].index;
  const windowEnd = months[months.length - 1].index;

  // Keep only projects whose (month-granular) bar span overlaps the window.
  const visible: { project: Project; startIdx: number; endIdx: number }[] = [];
  for (const project of projects) {
    const span = spans.get(project.id);
    if (!span) continue;
    const startIdx = monthIndex(
      new Date(span.start.getFullYear(), span.start.getMonth(), 1)
    );
    const endIdx = monthIndex(
      new Date(span.end.getFullYear(), span.end.getMonth(), 1)
    );
    if (startIdx > windowEnd || endIdx < windowStart) continue; // no overlap
    visible.push({ project, startIdx, endIdx });
  }

  // Dated milestones exist, but none land in the 4-month window.
  if (visible.length === 0) {
    return (
      <p className="mt-4 text-muted-foreground">
        No projects are scheduled between {months[0].label} and{" "}
        {months[months.length - 1].label}.
      </p>
    );
  }

  // Planned-FTE cell lookup + per-month totals across all projects (visible
  // months only). Totals feed the three summary rows.
  const monthKeys = new Set(months.map((m) => m.key));
  const plannedByCell = new Map<string, number>();
  const totals = new Map<string, { planned: number; actual: number }>();
  for (const a of allocations) {
    const planned = a.planned_fte ?? 0;
    const actual = a.actual_fte ?? 0;
    plannedByCell.set(`${a.project_id}|${a.month}`, planned);
    if (monthKeys.has(a.month)) {
      const t = totals.get(a.month) ?? { planned: 0, actual: 0 };
      t.planned += planned;
      t.actual += actual;
      totals.set(a.month, t);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">Project</th>
              {months.map((m) => (
                <th
                  key={m.key}
                  className="whitespace-nowrap px-3 py-2 text-center font-medium"
                >
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {visible.map(({ project, startIdx, endIdx }) => {
              const fill = barFill(project);
              return (
                <tr key={project.id}>
                  <td className="whitespace-nowrap px-4 py-2 align-middle">
                    <Link
                      href={`/clients/${clientId}/projects/${project.id}`}
                      className="font-medium hover:underline"
                    >
                      {project.name}
                    </Link>
                  </td>
                  {months.map((m) => {
                    const covered = m.index >= startIdx && m.index <= endIdx;
                    if (!covered) {
                      return <td key={m.key} className="px-1 py-2" />;
                    }

                    const planned = plannedByCell.get(`${project.id}|${m.key}`);
                    // Round the bar only at the project's true start/end; a span
                    // running past the window stays square there (reads as
                    // continuing off-screen).
                    const rounded = `${
                      m.index === startIdx ? "rounded-l-md" : ""
                    } ${m.index === endIdx ? "rounded-r-md" : ""}`;

                    return (
                      <td key={m.key} className="px-0.5 py-2">
                        <div
                          className={`flex h-7 items-center justify-center px-1 text-center text-xs font-medium tabular-nums text-white ${fill} ${rounded}`}
                          title={project.name}
                        >
                          {planned !== undefined ? fmtFte(planned) : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Summary: planned / actual / variance FTE per month, summed across
                all projects over the visible months. */}
            <tr className="border-t-2 bg-muted/30 font-medium">
              <td className="px-4 py-2">Planned (FTE)</td>
              {months.map((m) => {
                const t = totals.get(m.key);
                return (
                  <td key={m.key} className="px-3 py-2 text-center tabular-nums">
                    {t ? fmtFte(t.planned) : ""}
                  </td>
                );
              })}
            </tr>
            <tr className="bg-muted/30 font-medium">
              <td className="px-4 py-2">Actual (FTE)</td>
              {months.map((m) => {
                const t = totals.get(m.key);
                return (
                  <td key={m.key} className="px-3 py-2 text-center tabular-nums">
                    {t ? fmtFte(t.actual) : ""}
                  </td>
                );
              })}
            </tr>
            <tr className="bg-muted/30 font-medium">
              <td className="px-4 py-2">Variance (FTE)</td>
              {months.map((m) => {
                const t = totals.get(m.key);
                if (!t) {
                  return (
                    <td
                      key={m.key}
                      className="px-3 py-2 text-center tabular-nums"
                    />
                  );
                }
                const v = t.actual - t.planned;
                return (
                  <td
                    key={m.key}
                    className={`px-3 py-2 text-center tabular-nums ${varianceClass(v)}`}
                  >
                    {fmtFte(v)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Bars span each project&apos;s milestone timeline (clipped to this
        window); cells show planned FTE for the month.
      </p>
    </div>
  );
}
