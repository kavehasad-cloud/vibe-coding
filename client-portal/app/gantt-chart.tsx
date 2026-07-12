"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  updateMilestoneAction,
  deleteMilestoneAction,
  toggleMilestoneAction,
  type CreateMilestoneState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateField } from "@/app/date-field";
import { parseDate, isoWeek, todayMidnight } from "@/app/format";

type Task = {
  id: string;
  name: string;
  start_date: string | null;
  due_date: string | null;
  is_done: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_PAD_DAYS = 3;
const NAME_COL = "w-80 shrink-0";

const initialState: CreateMilestoneState = {};

export function GanttChart({
  tasks,
  projectPath,
  readOnly = false,
}: {
  tasks: Task[];
  projectPath: string;
  readOnly?: boolean;
}) {
  if (tasks.length === 0) {
    return <p className="mt-4 text-muted-foreground">No tasks yet</p>;
  }

  // Timeline bounds: earliest start to latest due across all tasks, padded a
  // few days on each side. due_date is the end; fall back to start when a task
  // has no due yet so it still contributes to the range.
  const starts = tasks
    .filter((t) => t.start_date)
    .map((t) => parseDate(t.start_date as string).getTime());
  const ends = tasks
    .map((t) => t.due_date ?? t.start_date)
    .filter(Boolean)
    .map((d) => parseDate(d as string).getTime());

  // Nothing dated yet — render plain name rows, no grid.
  if (starts.length === 0 && ends.length === 0) {
    return (
      <div className="mt-4 divide-y rounded-lg border">
        {tasks.map((task) => (
          <div key={task.id} className="px-4 py-3 font-medium">
            {task.name}
          </div>
        ))}
      </div>
    );
  }

  // Fold today into the bounds so the range always includes it — the today
  // line is then always visible, even when all tasks are in the past/future.
  const today = todayMidnight().getTime();
  const pad = RANGE_PAD_DAYS * DAY_MS;
  const rangeStart = Math.min(...starts, ...ends, today) - pad;
  const rangeEnd = Math.max(...starts, ...ends, today) + pad;
  const total = rangeEnd - rangeStart || DAY_MS;

  const pct = (ms: number) => ((ms - rangeStart) / total) * 100;

  // Weekly boundaries, one every 7 days from the range start.
  const weeks: { left: number; label: string }[] = [];
  for (let t = rangeStart; t <= rangeEnd; t += 7 * DAY_MS) {
    weeks.push({ left: pct(t), label: `W${isoWeek(new Date(t))}` });
  }

  const todayLeft = pct(today);

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border">
      <div className="min-w-[640px]">
        {/* Axis header: week-start labels across the timeline */}
        <div className="flex border-b bg-ocean-tint/40">
          <div className={NAME_COL} />
          <div className="relative h-8 flex-1">
            {weeks.map((w, i) => (
              <span
                key={i}
                className="absolute top-2 -translate-x-1/2 text-[11px] font-medium tracking-wide text-graphite tabular-nums"
                style={{ left: `${w.left}%` }}
              >
                {w.label}
              </span>
            ))}
          </div>
        </div>

        {/* One row per task */}
        <div className="divide-y">
          {tasks.map((task) => (
            <GanttRow
              key={task.id}
              task={task}
              projectPath={projectPath}
              readOnly={readOnly}
              weeks={weeks}
              todayLeft={todayLeft}
              bar={barGeometry(task, pct)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Bar left/width as percentages, or null when the task isn't fully dated.
function barGeometry(
  task: Task,
  pct: (ms: number) => number
): { left: number; width: number } | null {
  if (!task.start_date) return null;
  const start = parseDate(task.start_date).getTime();
  const end = task.due_date ? parseDate(task.due_date).getTime() : start;
  const left = pct(start);
  // Clamp width so a same-day task still shows a visible sliver.
  const width = Math.max(pct(end) - left, 1.5);
  return { left, width };
}

function GanttRow({
  task,
  projectPath,
  readOnly,
  weeks,
  todayLeft,
  bar,
}: {
  task: Task;
  projectPath: string;
  readOnly: boolean;
  weeks: { left: number; label: string }[];
  todayLeft: number;
  bar: { left: number; width: number } | null;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState(
    updateMilestoneAction,
    initialState
  );

  // Leave edit mode once a save succeeds and the page revalidates.
  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state]);

  // Admin inline edit takes over the whole row width.
  if (editing) {
    return (
      <div className="px-4 py-3">
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="project_path" value={projectPath} />
          <Input
            name="name"
            required
            defaultValue={task.name}
            placeholder="Task name"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 text-sm">
              <span className="text-graphite">Start</span>
              <DateField
                name="start_date"
                required
                defaultValue={task.start_date ?? ""}
              />
            </label>
            <label className="flex flex-1 items-center gap-2 text-sm">
              <span className="text-graphite">Due</span>
              <DateField name="due_date" defaultValue={task.due_date ?? ""} />
            </label>
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
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              className="ml-auto"
              onClick={() => {
                startTransition(async () => {
                  await deleteMilestoneAction(task.id, projectPath);
                });
              }}
            >
              Delete
            </Button>
          </div>
        </form>
        {state.error ? (
          <p className="mt-2 text-sm text-destructive">{state.error}</p>
        ) : null}
      </div>
    );
  }

  // Circle: quiet muted-green check when done, empty hairline ring otherwise.
  // Interactive for admins, a static indicator for read-only viewers.
  const circleClass = `flex size-5 shrink-0 items-center justify-center rounded-full border text-xs ${
    task.is_done
      ? "border-rag-green bg-rag-green/10 text-rag-green"
      : "border-platinum text-transparent"
  }`;

  return (
    <div className="group/row flex items-stretch transition-colors hover:bg-ocean-tint/25">
      {/* Toggle + name + admin controls */}
      <div className={`${NAME_COL} flex items-center gap-2 px-4 py-2`}>
        {readOnly ? (
          <span aria-hidden className={circleClass}>
            ✓
          </span>
        ) : (
          <button
            type="button"
            aria-pressed={task.is_done}
            aria-label={task.is_done ? "Mark as not done" : "Mark as done"}
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await toggleMilestoneAction(
                  task.id,
                  !task.is_done,
                  projectPath
                );
              });
            }}
            className={`${circleClass} disabled:opacity-50 ${
              task.is_done ? "" : "hover:border-muted-foreground"
            }`}
          >
            ✓
          </button>
        )}
        <span
          className={`min-w-0 flex-1 truncate text-sm font-medium ${
            task.is_done ? "text-muted-foreground line-through" : ""
          }`}
        >
          {task.name}
        </span>
        {!readOnly ? (
          <div className="flex gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              disabled={isPending}
              className="text-graphite hover:text-destructive"
              onClick={() => {
                startTransition(async () => {
                  await deleteMilestoneAction(task.id, projectPath);
                });
              }}
            >
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      {/* Timeline cell: gridlines + today line + bar */}
      <div className="relative flex-1 py-2.5">
        {weeks.map((w, i) => (
          <div
            key={i}
            className="absolute inset-y-0 border-l border-platinum/50"
            style={{ left: `${w.left}%` }}
          />
        ))}
        {/* Today: a thin ocean marker with a small cap, calm not alarming */}
        <div
          className="absolute inset-y-0 z-10 border-l border-ocean"
          style={{ left: `${todayLeft}%` }}
        >
          <span className="absolute -top-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-ocean" />
        </div>
        {bar ? (
          <div
            className={`absolute top-1/2 h-2.5 -translate-y-1/2 rounded-[3px] ${
              task.is_done ? "bg-sage/70" : "bg-ocean"
            }`}
            style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
            title={task.name}
          />
        ) : null}
      </div>
    </div>
  );
}
