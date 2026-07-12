"use client";

import { useActionState, useEffect, useRef } from "react";
import { createRiskAction, type CreateRiskState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LevelSelect } from "./risk-fields";

const initialState: CreateRiskState = {};

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
      className="flex flex-col gap-3"
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
          <LevelSelect id="risk-likelihood" name="likelihood" />
        </div>
        <div className="flex-1 space-y-1.5">
          <label htmlFor="risk-impact" className="text-sm font-medium">
            Impact
          </label>
          <LevelSelect id="risk-impact" name="impact" />
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
