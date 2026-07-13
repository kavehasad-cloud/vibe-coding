// Shared, quiet footer — echoes the nav bar's frame (full-width, one hairline
// divider, slim, no shadow; DESIGN §4.6/§1). One row: copyright left, legal
// labels right. The legal items are plain text for now (not links) — they become
// real links at launch, so no href yet to avoid dead 404 targets.
export function Footer() {
  return (
    <footer className="flex w-full flex-wrap items-center justify-between gap-2 border-t px-6 py-4 text-xs text-graphite">
      <span>© 2026 EDON Partners Oy</span>
      <span className="text-muted-foreground">Privacy · Terms · GDPR</span>
    </footer>
  );
}
