"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateProjectSummaryAction,
  type CreateClientState,
} from "./actions";
import { Button } from "@/components/ui/button";

// Textarea styled to match the app's Input component (same border/rounded/focus
// tokens as the native selects in risk-row / new-risk-form).
const textareaClass =
  "min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

const initialState: CreateClientState = {};

// One labeled view subsection: its text, or a muted fallback when empty.
function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-graphite">
        {label}
      </h3>
      {value ? (
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {value}
        </p>
      ) : (
        <p className="mt-1.5 text-sm text-slate">Nothing recorded</p>
      )}
    </div>
  );
}

export function ExecSummary({
  projectId,
  projectPath,
  summary,
  asks,
  issues,
  readOnly = false,
}: {
  projectId: string;
  projectPath: string;
  summary: string | null;
  asks: string | null;
  issues: string | null;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateProjectSummaryAction,
    initialState
  );

  // Leave edit mode once a save succeeds and the page revalidates.
  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state]);

  // Admin edit form. Gated behind !readOnly so viewers can never reach it.
  if (editing && !readOnly) {
    return (
      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="id" value={projectId} />
        <input type="hidden" name="project_path" value={projectPath} />
        <div className="space-y-1.5">
          <label htmlFor="exec-summary" className="text-sm font-medium">
            Summary
          </label>
          <textarea
            id="exec-summary"
            name="summary"
            defaultValue={summary ?? ""}
            className={textareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="exec-asks" className="text-sm font-medium">
            The asks
          </label>
          <textarea
            id="exec-asks"
            name="asks"
            defaultValue={asks ?? ""}
            className={textareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="exec-issues" className="text-sm font-medium">
            Issues
          </label>
          <textarea
            id="exec-issues"
            name="issues"
            defaultValue={issues ?? ""}
            className={textareaClass}
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
    <div className="mt-4 space-y-4">
      {!readOnly ? (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        </div>
      ) : null}
      <Field label="Summary" value={summary} />
      <Field label="The asks" value={asks} />
      <Field label="Issues" value={issues} />
    </div>
  );
}
