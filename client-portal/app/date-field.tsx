"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { parseDate, localDateStr, formatFull } from "@/app/format";

// A calendar date picker that stands in for a native <input type="date"> inside
// an uncontrolled form. It keeps a hidden input in sync with the chosen day so
// server actions read the same "YYYY-MM-DD" value they always did — the raw
// browser date control is gone, the data contract is unchanged.
export function DateField({
  name,
  defaultValue = "",
  required = false,
  id,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  id?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const selected = value ? parseDate(value) : undefined;

  return (
    <div>
      <input type="hidden" name={name} value={value} required={required} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          className="flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-sm transition-colors outline-none hover:border-slate focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:border-ring"
        >
          <span className={value ? "text-ink" : "text-muted-foreground"}>
            {value ? formatFull(value) : "Pick a date"}
          </span>
          <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(day) => {
              if (day) setValue(localDateStr(day));
              setOpen(false);
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
