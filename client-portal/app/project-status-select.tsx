"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateProjectStatusAction } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not started" },
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

  // shadcn Select (radix-nova) replacing the old native <select>. Still fully
  // controlled + optimistic: onValueChange fires the update action inside the
  // same useOptimistic/useTransition dance, and the trigger stays disabled for
  // the duration of the transition.
  return (
    <div className="shrink-0">
      <label htmlFor={`status-${projectId}`} className="sr-only">
        Project status
      </label>
      <Select
        value={optimisticStatus}
        disabled={isPending}
        onValueChange={(next) => {
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
      >
        <SelectTrigger id={`status-${projectId}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
