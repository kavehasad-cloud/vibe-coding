"use client";

import { useActionState, useEffect, useRef } from "react";
import { createRiskAction, type CreateRiskState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: CreateRiskState = {};

// Native <select> styled to roughly match the Input component.
const selectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export function NewRiskForm({
  projectId,
  projectPath,
}: {
  projectId: string;
  projectPath: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createRiskAction,
    initialState
  );

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 flex flex-col gap-3 rounded-lg border p-4"
    >
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="project_path" value={projectPath} />

      <div className="space-y-1.5">
        <label htmlFor="risk-description" className="text-sm font-medium">
          Risk
        </label>
        <Input
          id="risk-description"
          name="description"
          required
          placeholder="Key vendor may miss the integration deadline"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="risk-likelihood" className="text-sm font-medium">
            Likelihood
          </label>
          <select
            id="risk-likelihood"
            name="likelihood"
            defaultValue="low"
            className={selectClass}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="flex-1 space-y-1.5">
          <label htmlFor="risk-impact" className="text-sm font-medium">
            Impact
          </label>
          <select
            id="risk-impact"
            name="impact"
            defaultValue="low"
            className={selectClass}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="risk-mitigation" className="text-sm font-medium">
          Mitigation <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="risk-mitigation"
          name="mitigation"
          placeholder="Weekly check-ins; line up a backup vendor"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add risk"}
        </Button>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
      </div>
    </form>
  );
}
