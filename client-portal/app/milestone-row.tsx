"use client";

import { useState, useTransition } from "react";
import { toggleMilestoneAction, deleteMilestoneAction } from "./actions";
import { Button } from "@/components/ui/button";

type Milestone = {
  id: string;
  name: string;
  due_date: string | null;
  is_done: boolean;
};

// due_date is a date-only string (YYYY-MM-DD). Format from its parts so a
// UTC-midnight parse can't shift it a day in the local timezone.
function formatDueDate(due: string): string {
  const [year, month, day] = due.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MilestoneRow({
  milestone,
  projectPath,
  readOnly = false,
}: {
  milestone: Milestone;
  projectPath: string;
  readOnly?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Client-role viewers get a plain, non-interactive row: static done
  // indicator + name + date, no toggle and no delete.
  if (readOnly) {
    return (
      <li className="flex items-center gap-3 px-4 py-3">
        <span
          aria-hidden
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-xs ${
            milestone.is_done
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-muted-foreground/40 text-transparent"
          }`}
        >
          ✓
        </span>
        <span
          className={`min-w-0 flex-1 truncate font-medium ${
            milestone.is_done ? "text-muted-foreground line-through" : ""
          }`}
        >
          {milestone.name}
        </span>
        {milestone.due_date ? (
          <span className="shrink-0 text-sm text-muted-foreground">
            {formatDueDate(milestone.due_date)}
          </span>
        ) : null}
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        aria-pressed={milestone.is_done}
        aria-label={milestone.is_done ? "Mark as not done" : "Mark as done"}
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await toggleMilestoneAction(
              milestone.id,
              !milestone.is_done,
              projectPath
            );
            if (result?.error) setError(result.error);
          });
        }}
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-xs disabled:opacity-50 ${
          milestone.is_done
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-muted-foreground/40 text-transparent hover:border-muted-foreground"
        }`}
      >
        ✓
      </button>
      <span
        className={`min-w-0 flex-1 truncate font-medium ${
          milestone.is_done ? "text-muted-foreground line-through" : ""
        }`}
      >
        {milestone.name}
      </span>
      {milestone.due_date ? (
        <span className="shrink-0 text-sm text-muted-foreground">
          {formatDueDate(milestone.due_date)}
        </span>
      ) : null}
      <Button
        size="sm"
        variant="outline"
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await deleteMilestoneAction(milestone.id, projectPath);
          });
        }}
      >
        Delete
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </li>
  );
}
