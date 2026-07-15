"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  updateRiskAction,
  deleteRiskAction,
  type CreateRiskState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RagDot } from "./rag";
import { LevelSelect, SEVERITY_LABEL } from "./risk-fields";
import { riskRag } from "./risk-rag";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Risk = {
  id: string;
  description: string;
  likelihood: string;
  impact: string;
  mitigation: string | null;
};

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
                <span className="text-graphite">Likelihood</span>
                <LevelSelect name="likelihood" defaultValue={risk.likelihood} />
              </label>
              <label className="flex flex-1 items-center gap-2 text-sm">
                <span className="text-graphite">Impact</span>
                <LevelSelect name="impact" defaultValue={risk.impact} />
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
    <tr className="group/row align-top">
      <td className="px-4 py-3 font-medium text-ink">{risk.description}</td>
      <td className="px-4 py-3">
        {/* Severity as a bigger traffic-light circle; label on hover.
            role=img + aria-label carry the name (the dot is aria-hidden). */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              role="img"
              aria-label={SEVERITY_LABEL[rag] ?? rag}
              className="inline-flex"
            >
              <RagDot rag={rag} className="size-2.5" />
            </span>
          </TooltipTrigger>
          <TooltipContent>{SEVERITY_LABEL[rag] ?? rag}</TooltipContent>
        </Tooltip>
      </td>
      <td className="px-4 py-3 text-graphite">
        {risk.mitigation ? risk.mitigation : "—"}
      </td>
      {!readOnly ? (
        <td className="px-4 py-3 text-right">
          <div className="flex justify-end gap-1.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              disabled={isPending}
              className="text-graphite hover:text-destructive"
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
