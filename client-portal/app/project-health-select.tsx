"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateProjectHealthAction } from "./actions";
import { RagDot } from "@/app/rag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HEALTH_OPTIONS = [
  { value: "green", label: "Green" },
  { value: "amber", label: "Amber" },
  { value: "red", label: "Red" },
] as const;

// Dot + plain ink label, mirroring the RagBadge treatment in app/rag.tsx. This
// replaces the old full-field RAG tint (HEALTH_STYLES' bg-green-50/text-green-700):
// per DESIGN §6 the colour lands on a small dot, never on a fill. Because each
// SelectItem carries the dot inside its ItemText, radix mirrors the selected
// option — dot and all — into the trigger's <SelectValue />.
function HealthOption({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <RagDot rag={value} />
      <span className="text-ink">{label}</span>
    </span>
  );
}

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

  // shadcn Select (radix-nova) replacing the old native <select>. Still fully
  // controlled + optimistic: onValueChange fires the update action inside the
  // same useOptimistic/useTransition dance, and the trigger stays disabled for
  // the duration of the transition.
  return (
    <div className="shrink-0">
      <label htmlFor={`health-${projectId}`} className="sr-only">
        Project health
      </label>
      <Select
        value={optimisticHealth}
        disabled={isPending}
        onValueChange={(next) => {
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
      >
        <SelectTrigger id={`health-${projectId}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HEALTH_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <HealthOption value={option.value} label={option.label} />
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
