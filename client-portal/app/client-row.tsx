"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateClientAction,
  deleteClientAction,
  type CreateClientState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Client = {
  id: string;
  name: string;
  contact_email: string | null;
};

const initialState: CreateClientState = {};

export function ClientRow({ client }: { client: Client }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateClientAction,
    initialState
  );

  // Leave edit mode once a save succeeds.
  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state]);

  if (editing) {
    return (
      <li className="px-4 py-3">
        <form
          action={formAction}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="id" value={client.id} />
          <Input
            name="name"
            required
            defaultValue={client.name}
            placeholder="Name"
            className="flex-1"
          />
          <Input
            name="contact_email"
            type="email"
            defaultValue={client.contact_email ?? ""}
            placeholder="Contact email"
            className="flex-1"
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
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium">{client.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {client.contact_email}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <form action={deleteClientAction}>
          <input type="hidden" name="id" value={client.id} />
          <Button size="sm" variant="outline" type="submit">
            Delete
          </Button>
        </form>
      </div>
    </li>
  );
}
