"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  updateAllocationAction,
  deleteAllocationAction,
} from "./actions";
import { Input } from "@/components/ui/input";
import { formatMonth } from "@/app/format";

type Allocation = {
  id: string;
  month: string;
  planned_fte: number | null;
  actual_fte: number | null;
};

type Row = {
  id: string;
  month: string;
  planned_fte: number;
  actual_fte: number;
};

// Nullable FTE columns (DB default 0) collapse to 0 for display + math.
function normalize(a: Allocation): Row {
  return {
    id: a.id,
    month: a.month,
    planned_fte: a.planned_fte ?? 0,
    actual_fte: a.actual_fte ?? 0,
  };
}

// Round to 2 decimals so float artifacts (1.1 + 0.2 = 1.3000000000000003)
// never leak into the display or the comparison.
function round(n: number): number {
  return Math.round(n * 100) / 100;
}

// Plain number, no trailing zeros, no currency ("1.5", "2", "0").
function fmt(n: number): string {
  return String(round(n));
}

function varianceClass(v: number): string {
  const r = round(v);
  if (r > 0) return "text-red-600"; // over plan
  if (r < 0) return "text-green-600"; // under plan
  return "text-muted-foreground";
}

// Admin-editable cell: a pill that swaps to a focused input on click. All
// commit logic runs in a single onBlur path (Enter/Esc both blur) so the
// confirm() can't double-fire when it steals focus.
function EditableCell({
  value,
  label,
  onCommit,
}: {
  value: number;
  label: string;
  onCommit: (next: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const cancelRef = useRef(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-md border px-2 py-1 text-sm tabular-nums hover:bg-muted"
      >
        {fmt(value)}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      type="text"
      inputMode="decimal"
      defaultValue={String(round(value))}
      className="h-8 w-20 tabular-nums"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          cancelRef.current = true;
          e.currentTarget.blur();
        }
      }}
      onBlur={(e) => {
        const wasCancel = cancelRef.current;
        cancelRef.current = false;
        const raw = e.currentTarget.value.trim();
        setEditing(false);

        if (wasCancel) return; // Esc — revert, no write

        const num = Number(raw);
        // Invalid (blank, non-numeric, negative) → revert, no write.
        if (raw === "" || !Number.isFinite(num) || num < 0) return;
        // Unchanged → close, no write.
        if (round(num) === round(value)) return;

        if (
          !window.confirm(`Change ${label} from ${fmt(value)} to ${fmt(num)}?`)
        ) {
          return; // Cancel — revert, no write
        }
        onCommit(round(num));
      }}
    />
  );
}

export function AllocationGrid({
  allocations,
  projectPath,
  readOnly = false,
}: {
  allocations: Allocation[];
  projectPath: string;
  readOnly?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(() => allocations.map(normalize));
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Resync to server truth after a revalidation (add / delete / saved edit).
  useEffect(() => {
    setRows(allocations.map(normalize));
  }, [allocations]);

  // Option A: editing one cell writes the whole month's row (both values).
  function saveCell(id: string, field: "planned_fte" | "actual_fte", next: number) {
    const prev = rows.find((r) => r.id === id);
    if (!prev) return;
    const updated = { ...prev, [field]: next };

    setError(null);
    setRows((cur) => cur.map((r) => (r.id === id ? updated : r))); // optimistic

    startTransition(async () => {
      const res = await updateAllocationAction(
        id,
        projectPath,
        updated.planned_fte,
        updated.actual_fte
      );
      if (res?.error) {
        // Revert this cell so the grid never shows a value the DB rejected.
        setRows((cur) => cur.map((r) => (r.id === id ? prev : r)));
        setError(res.error);
      }
    });
  }

  function deleteMonth(row: Row) {
    if (
      !window.confirm(
        `Delete the ${formatMonth(row.month)} allocation? This removes its planned and actual FTE.`
      )
    ) {
      return;
    }
    const prevRows = rows;
    setError(null);
    setRows((cur) => cur.filter((r) => r.id !== row.id)); // optimistic

    startTransition(async () => {
      const res = await deleteAllocationAction(row.id, projectPath);
      if (res?.error) {
        setRows(prevRows); // restore the removed month
        setError(res.error);
      }
    });
  }

  if (rows.length === 0) {
    return <p className="mt-4 text-muted-foreground">No allocations yet</p>;
  }

  const totalPlanned = rows.reduce((s, r) => s + r.planned_fte, 0);
  const totalActual = rows.reduce((s, r) => s + r.actual_fte, 0);
  const totalVariance = totalActual - totalPlanned;

  return (
    <div className="mt-4 space-y-2">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium" />
              {rows.map((row) => (
                <th key={row.id} className="px-4 py-2 text-right font-medium">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{formatMonth(row.month)}</span>
                    {!readOnly ? (
                      <button
                        type="button"
                        aria-label={`Delete ${formatMonth(row.month)} allocation`}
                        onClick={() => deleteMonth(row)}
                        className="leading-none text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                </th>
              ))}
              <th className="px-4 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* Planned FTE */}
            <tr>
              <th className="px-4 py-2 text-left font-medium">Planned FTE</th>
              {rows.map((row) => (
                <td key={row.id} className="px-4 py-2 text-right">
                  {readOnly ? (
                    <span className="tabular-nums">{fmt(row.planned_fte)}</span>
                  ) : (
                    <EditableCell
                      value={row.planned_fte}
                      label={`${formatMonth(row.month)} Planned FTE`}
                      onCommit={(next) =>
                        saveCell(row.id, "planned_fte", next)
                      }
                    />
                  )}
                </td>
              ))}
              <td className="px-4 py-2 text-right font-medium tabular-nums">
                {fmt(totalPlanned)}
              </td>
            </tr>

            {/* Actual FTE */}
            <tr>
              <th className="px-4 py-2 text-left font-medium">Actual FTE</th>
              {rows.map((row) => (
                <td key={row.id} className="px-4 py-2 text-right">
                  {readOnly ? (
                    <span className="tabular-nums">{fmt(row.actual_fte)}</span>
                  ) : (
                    <EditableCell
                      value={row.actual_fte}
                      label={`${formatMonth(row.month)} Actual FTE`}
                      onCommit={(next) => saveCell(row.id, "actual_fte", next)}
                    />
                  )}
                </td>
              ))}
              <td className="px-4 py-2 text-right font-medium tabular-nums">
                {fmt(totalActual)}
              </td>
            </tr>

            {/* Variance (derived, never editable) */}
            <tr>
              <th className="px-4 py-2 text-left font-medium">Variance</th>
              {rows.map((row) => {
                const v = row.actual_fte - row.planned_fte;
                return (
                  <td
                    key={row.id}
                    className={`px-4 py-2 text-right tabular-nums ${varianceClass(v)}`}
                  >
                    {fmt(v)}
                  </td>
                );
              })}
              <td
                className={`px-4 py-2 text-right font-medium tabular-nums ${varianceClass(totalVariance)}`}
              >
                {fmt(totalVariance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
