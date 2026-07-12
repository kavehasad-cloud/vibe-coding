"use client";

import { useActionState, useEffect, useRef } from "react";
import { createMilestoneAction, type CreateMilestoneState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateField } from "@/app/date-field";

const initialState: CreateMilestoneState = {};

export function NewMilestoneForm({
  projectId,
  projectPath,
}: {
  projectId: string;
  projectPath: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createMilestoneAction,
    initialState
  );

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="project_path" value={projectPath} />
      <div className="flex-1 space-y-1.5">
        <label htmlFor="milestone-name" className="text-sm font-medium">
          Milestone
        </label>
        <Input
          id="milestone-name"
          name="name"
          required
          placeholder="Design sign-off"
        />
      </div>
      <div className="space-y-1.5 sm:w-40">
        <label htmlFor="milestone-start" className="text-sm font-medium">
          Start date
        </label>
        <DateField id="milestone-start" name="start_date" required />
      </div>
      <div className="space-y-1.5 sm:w-40">
        <label htmlFor="milestone-due" className="text-sm font-medium">
          Due date
        </label>
        <DateField id="milestone-due" name="due_date" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add milestone"}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive sm:basis-full">{state.error}</p>
      ) : null}
    </form>
  );
}
