"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateProjectHealthAction } from "./actions";
import { HEALTH_STYLES } from "@/app/status-labels";

const HEALTH_OPTIONS = [
  { value: "green", label: "Green" },
  { value: "amber", label: "Amber" },
  { value: "red", label: "Red" },
] as const;

export function ProjectHealthSelect({
  projectId,
  clientId,
  currentHealth,
}: {
  projectId: string;
  clientId: string;
  currentHealth: string;
}) {
  const [optimisticHealth, setOptimisticHealth] = useOptimistic(currentHealth);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="shrink-0">
      <label htmlFor={`health-${projectId}`} className="sr-only">
        Project health
      </label>
      <select
        id={`health-${projectId}`}
        value={optimisticHealth}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value;
          setError(null);
          startTransition(async () => {
            setOptimisticHealth(next);
            const result = await updateProjectHealthAction(
              projectId,
              clientId,
              next
            );
            if (result?.error) setError(result.error);
          });
        }}
        className={`rounded-md border px-2 py-1 text-sm disabled:opacity-50 ${
          HEALTH_STYLES[optimisticHealth] ?? ""
        }`}
      >
        {HEALTH_OPTIONS.map((option) => (
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
