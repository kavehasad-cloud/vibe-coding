"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateProjectStatusAction } from "./actions";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function ProjectStatusSelect({
  projectId,
  clientId,
  currentStatus,
}: {
  projectId: string;
  clientId: string;
  currentStatus: string;
}) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="shrink-0">
      <label htmlFor={`status-${projectId}`} className="sr-only">
        Project status
      </label>
      <select
        id={`status-${projectId}`}
        value={optimisticStatus}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value;
          setError(null);
          startTransition(async () => {
            setOptimisticStatus(next);
            const result = await updateProjectStatusAction(
              projectId,
              clientId,
              next
            );
            if (result?.error) setError(result.error);
          });
        }}
        className="rounded-md border bg-background px-2 py-1 text-sm disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
