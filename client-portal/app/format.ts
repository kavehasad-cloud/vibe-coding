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
