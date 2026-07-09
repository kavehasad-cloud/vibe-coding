// Shared formatting helpers. Single source of truth so formatting can't fork
// across pages (mirrors the status-labels module for labels/health styles).

// Whole-dollar currency, e.g. "$120,000". Fractional cents are rounded away.
export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// Shared date helper: parse a date-only "YYYY-MM-DD" into a LOCAL midnight Date, so a UTC parse can't shift the day.
export function parseDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Shared date helper: local "YYYY-MM-DD" built from local parts (not toISOString, which is UTC and could roll the day).
export function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Shared date helper: short "Jul 10" label (no year) from a Date.
export function formatShort(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Shared date helper: today at local midnight, for clean comparison against parsed date-only values.
export function todayMidnight(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Shared date helper: year-bearing "Jul 10, 2026" from a date-only "YYYY-MM-DD" string.
export function formatFull(date: string): string {
  return parseDate(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Shared date helper: month + year "Jan 2026" from a date-only "YYYY-MM-DD"
// string (allocations store the month as the 1st, e.g. "2026-01-01").
export function formatMonth(date: string): string {
  return parseDate(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

// Shared date helper: ISO 8601 week number (weeks start Monday; week 1 is the
// week containing the year's first Thursday / Jan 4). DST-safe — operates on
// local-parts dates like the rest of this module.
export function isoWeek(date: Date): number {
  // Shift to the Thursday of this ISO week, then count weeks from the year's
  // first Thursday.
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - day + 3); // move to this week's Thursday
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const fDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - fDay + 3);
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000));
}
