"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAllocationAction, type CreateAllocationState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: CreateAllocationState = {};

export function NewAllocationForm({
  projectId,
  projectPath,
}: {
  projectId: string;
  projectPath: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createAllocationAction,
    initialState
  );

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-6 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="project_path" value={projectPath} />

      <div className="space-y-1.5">
        <label htmlFor="allocation-month" className="text-sm font-medium">
          Month
        </label>
        <Input id="allocation-month" name="month" type="month" required />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="allocation-planned" className="text-sm font-medium">
          Planned FTE
        </label>
        <Input
          id="allocation-planned"
          name="planned_fte"
          type="number"
          min="0"
          step="0.1"
          placeholder="0"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="allocation-actual" className="text-sm font-medium">
          Actual FTE
        </label>
        <Input
          id="allocation-actual"
          name="actual_fte"
          type="number"
          min="0"
          step="0.1"
          placeholder="0"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add month"}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive sm:basis-full">{state.error}</p>
      ) : null}
    </form>
  );
}
