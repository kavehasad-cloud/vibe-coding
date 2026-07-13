import Link from "next/link";

// The ONE page-header treatment for the simple pages (dashboard, client, portal).
// Covers the union of what they need: an optional back-link above the title, a
// title, an optional subtitle, and an optional right-side slot (e.g. a status
// badge) that sits opposite the title. Standardizes the previously-divergent
// subtitle/back-link styles. The scorecard keeps its own in-card title and does
// NOT use this.
export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  rightSlot,
}: {
  title: string;
  subtitle?: string | null;
  backHref?: string;
  backLabel?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div>
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-graphite transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> {backLabel}
        </Link>
      ) : null}
      <div
        className={`flex items-start justify-between gap-3 ${
          backHref ? "mt-4" : ""
        }`}
      >
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {rightSlot ?? null}
      </div>
      {subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}
