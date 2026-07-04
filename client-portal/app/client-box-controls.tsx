"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateClientAction,
  deleteClientAction,
  type CreateClientState,
} from "./actions";
import { confirmDeleteClient } from "./confirm-delete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Client = {
  id: string;
  name: string;
  contact_email: string | null;
};

const initialState: CreateClientState = {};

// Compact Edit + Delete controls that sit beside a dashboard client-box's name.
// Reuses updateClientAction / deleteClientAction (no forked write logic) and the
// shared delete confirm. Editing swaps in an inline name/email form; because the
// box header is a flex-wrap row, `basis-full` drops the form onto its own line
// under the (still-visible) large name anchor.
export function ClientBoxControls({
  client,
  projectCount,
}: {
  client: Client;
  projectCount: number;
}) {
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
      <form
        action={formAction}
        className="basis-full space-y-2 rounded-lg border p-3"
      >
        <input type="hidden" name="id" value={client.id} />
        <div className="flex flex-col gap-2 sm:flex-row">
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
    <div className="flex shrink-0 items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
        Edit
      </Button>
      <form
        action={deleteClientAction}
        onSubmit={(e) => {
          if (!confirmDeleteClient(client.name, projectCount)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={client.id} />
        <Button size="sm" variant="outline" type="submit">
          Delete
        </Button>
      </form>
    </div>
  );
}
