"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateProjectFinancialsAction,
  type CreateClientState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Native <select> styled to match the Input component (mirrors risk-row).
const selectClass =
  "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

// Same green/amber/red badge classes used for project health / risk RAG.
const RESOURCING_STYLES: Record<string, string> = {
  staffed: "border-green-500 bg-green-50 text-green-700",
  stretched: "border-amber-500 bg-amber-50 text-amber-700",
  bottlenecked: "border-red-500 bg-red-50 text-red-700",
};

const initialState: CreateClientState = {};

// Whole-dollar currency, e.g. "$120,000". Fractional cents are rounded away.
function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

// Variance = actual − budget. Positive means over budget (bad, red); zero or
// negative means on/under budget (good, green). Percentage is of budget.
function Variance({ budget, actual }: { budget: number; actual: number }) {
  const diff = actual - budget;
  const overBudget = diff > 0;
  const sign = overBudget ? "+" : "-";
  const magnitude = formatCurrency(Math.abs(diff));
  // Guard divide-by-zero when budget is 0.
  const pct = budget !== 0 ? Math.round((Math.abs(diff) / budget) * 100) : 0;
  const label = overBudget ? "over budget" : "under budget";

  return (
    <span className={overBudget ? "text-red-700" : "text-green-700"}>
      {sign}
      {magnitude} ({pct}% {label})
    </span>
  );
}

export function Financials({
  projectId,
  projectPath,
  budget,
  actualSpend,
  resourcing,
  readOnly = false,
}: {
  projectId: string;
  projectPath: string;
  budget: number | null;
  actualSpend: number | null;
  resourcing: string | null;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateProjectFinancialsAction,
    initialState
  );

  // Leave edit mode once a save succeeds and the page revalidates.
  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state]);

  // Admin edit form. Gated behind !readOnly so viewers can never reach it.
  if (editing && !readOnly) {
    return (
      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="id" value={projectId} />
        <input type="hidden" name="project_path" value={projectPath} />
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="fin-budget" className="text-sm font-medium">
              Budget
            </label>
            <Input
              id="fin-budget"
              name="budget"
              type="number"
              step="any"
              placeholder="120000"
              defaultValue={budget ?? ""}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label htmlFor="fin-actual" className="text-sm font-medium">
              Actual spend
            </label>
            <Input
              id="fin-actual"
              name="actual_spend"
              type="number"
              step="any"
              placeholder="125000"
              defaultValue={actualSpend ?? ""}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fin-resourcing" className="text-sm font-medium">
            Resourcing
          </label>
          <select
            id="fin-resourcing"
            name="resourcing"
            defaultValue={resourcing ?? ""}
            className={selectClass}
          >
            <option value="">—</option>
            <option value="staffed">Staffed</option>
            <option value="stretched">Stretched</option>
            <option value="bottlenecked">Bottlenecked</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
      </form>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {!readOnly ? (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Budget">
          {budget !== null ? (
            formatCurrency(budget)
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Stat>
        <Stat label="Actual spend">
          {actualSpend !== null ? (
            formatCurrency(actualSpend)
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Stat>
        <Stat label="Variance">
          {budget !== null && actualSpend !== null ? (
            <Variance budget={budget} actual={actualSpend} />
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Stat>
        <Stat label="Resourcing">
          {resourcing ? (
            <span
              className={`inline-block rounded-md border px-2 py-1 text-xs capitalize ${
                RESOURCING_STYLES[resourcing] ?? ""
              }`}
            >
              {resourcing}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </Stat>
      </div>
    </div>
  );
}
