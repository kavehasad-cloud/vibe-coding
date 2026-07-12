"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Month picker that replaces a native <input type="month">. Emits "YYYY-MM"
// through a hidden input so the allocation action keeps parsing it unchanged.
// A quiet year stepper over a 3×4 month grid — same calm register as the
// calendar date picker, no OS control leaking into the design.
export function MonthField({
  name,
  defaultValue = "",
  required = false,
  id,
  fallbackYear,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  id?: string;
  // Passed in from the server (parents can't call Date at render). Used only as
  // the initial year to show when nothing is selected yet.
  fallbackYear: number;
}) {
  const [value, setValue] = useState(defaultValue); // "YYYY-MM" | ""
  const [open, setOpen] = useState(false);
  const [selYear, selMonth] = value
    ? value.split("-").map(Number)
    : [fallbackYear, 0];
  const [viewYear, setViewYear] = useState(selYear);

  const label = value ? `${MONTHS[selMonth - 1]} ${selYear}` : "Pick a month";

  return (
    <div>
      <input type="hidden" name={name} value={value} required={required} />
      <Popover
        open={open}
        onOpenChange={(o) => {
          if (o) setViewYear(value ? selYear : fallbackYear);
          setOpen(o);
        }}
      >
        <PopoverTrigger
          id={id}
          className="flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-sm transition-colors outline-none hover:border-slate focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:border-ring"
        >
          <span className={value ? "text-ink" : "text-muted-foreground"}>
            {label}
          </span>
          <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-3">
          <div className="mb-3 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous year"
              onClick={() => setViewYear((y) => y - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <span className="text-sm font-semibold tabular-nums text-ink">
              {viewYear}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next year"
              onClick={() => setViewYear((y) => y + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((m, i) => {
              const isSel = value === `${viewYear}-${String(i + 1).padStart(2, "0")}`;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setValue(`${viewYear}-${String(i + 1).padStart(2, "0")}`);
                    setOpen(false);
                  }}
                  className={`rounded-md px-2 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                    isSel
                      ? "bg-primary text-primary-foreground"
                      : "text-ink hover:bg-muted"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
