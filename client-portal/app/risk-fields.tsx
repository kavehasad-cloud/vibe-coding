"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Severity (the risk RAG) rendered as words, not colour names — "High/Medium/
// Low" reads without leaning on the dot's colour alone.
export const SEVERITY_LABEL: Record<string, string> = {
  red: "High",
  amber: "Medium",
  green: "Low",
};

const LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// The low/medium/high picker shared by the risk edit row and the add-risk form.
// A shadcn Select (radix-nova) replacing the old native <select>; its `name`
// prop emits a hidden control so server actions read it unchanged.
export function LevelSelect({
  name,
  defaultValue = "low",
  id,
}: {
  name: string;
  defaultValue?: string;
  id?: string;
}) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEVELS.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
