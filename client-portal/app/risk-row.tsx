"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  updateRiskAction,
  deleteRiskAction,
  type CreateRiskState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { riskRag } from "./risk-rag";

type Risk = {
  id: string;
  description: string;
  likelihood: string;
  impact: string;
  mitigation: string | null;
};

// Same green/amber/red badge classes used for project health.
const RAG_STYLES: Record<string, string> = {
  green: "border-green-500 bg-green-50 text-green-700",
  amber: "border-amber-500 bg-amber-50 text-amber-700",
  red: "border-red-500 bg-red-50 text-red-700",
};

// Native <select> styled to match the Input component (mirrors new-risk-form).
const selectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

const initialState: CreateRiskState = {};

export function RiskRow({
  risk,
  projectPath,
  readOnly = false,
}: {
  risk: Risk;
  projectPath: string;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState(
    updateRiskAction,
    initialState
  );

  // Leave edit mode once a save succeeds.
  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state]);

  // Severity is always derived from the row's current likelihood + impact, so
  // it updates automatically after an edit saves and the page revalidates.
  const rag = riskRag(risk.likelihood, risk.impact);

  // Inline edit form fills the whole row via a single full-width cell — a
  // <form> can't wrap <td>s directly. Only admins ever reach this branch.
  if (editing) {
    return (
      <tr>
        <td colSpan={4} className="px-4 py-3">
          <form action={formAction} className="flex flex-col gap-2">
            <input type="hidden" name="id" value={risk.id} />
            <input type="hidden" name="project_path" value={projectPath} />
            <Input
              name="description"
              required
              defaultValue={risk.description}
              placeholder="Risk description"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex flex-1 items-center gap-2 text-sm">
                <span className="text-muted-foreground">Likelihood</span>
                <select
                  name="likelihood"
                  defaultValue={risk.likelihood}
                  className={selectClass}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="flex flex-1 items-center gap-2 text-sm">
                <span className="text-muted-foreground">Impact</span>
                <select
                  name="impact"
                  defaultValue={risk.impact}
                  className={selectClass}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
            <Input
              name="mitigation"
              defaultValue={risk.mitigation ?? ""}
              placeholder="Mitigation (optional)"
            />
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
          </form>
          {state.error ? (
            <p className="mt-2 text-sm text-destructive">{state.error}</p>
          ) : null}
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="px-4 py-3 align-top font-medium">{risk.description}</td>
      <td className="px-4 py-3 align-top">
        <span
          className={`inline-block rounded-md border px-2 py-1 text-xs capitalize ${
            RAG_STYLES[rag] ?? ""
          }`}
        >
          {rag}
        </span>
      </td>
      <td className="px-4 py-3 align-top text-muted-foreground">
        {risk.mitigation ? risk.mitigation : "—"}
      </td>
      {!readOnly ? (
        <td className="px-4 py-3 align-top">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await deleteRiskAction(risk.id, projectPath);
                });
              }}
            >
              Delete
            </Button>
          </div>
        </td>
      ) : null}
    </tr>
  );
}
