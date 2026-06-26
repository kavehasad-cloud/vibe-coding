"use client";

import { useActionState, useEffect, useRef } from "react";
import { createClientAction, type CreateClientState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: CreateClientState = {};

export function NewClientForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createClientAction,
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
      <div className="flex-1 space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input id="name" name="name" required placeholder="Acme Inc." />
      </div>
      <div className="flex-1 space-y-1.5">
        <label htmlFor="contact_email" className="text-sm font-medium">
          Contact email
        </label>
        <Input
          id="contact_email"
          name="contact_email"
          type="email"
          placeholder="hello@acme.com"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add client"}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive sm:basis-full">{state.error}</p>
      ) : null}
    </form>
  );
}
