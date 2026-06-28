"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProjectAction, type CreateProjectState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: CreateProjectState = {};

export function NewProjectForm({ clientId }: { clientId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createProjectAction,
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
      <input type="hidden" name="client_id" value={clientId} />
      <div className="flex-1 space-y-1.5">
        <label htmlFor="project-name" className="text-sm font-medium">
          Project name
        </label>
        <Input
          id="project-name"
          name="name"
          required
          placeholder="Website redesign"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add project"}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive sm:basis-full">{state.error}</p>
      ) : null}
    </form>
  );
}
