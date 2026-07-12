// The ONE functional-status treatment for the whole app (DESIGN §6).
//
// RAG health is the only place non-brand colour is allowed, and it stays calm:
// colour lands on a small dot, never on a fill or the text. A quiet uppercase
// micro-label carries the meaning in neutral ink. Used for project health, risk
// severity, and anywhere else a red/amber/green signal appears — one component
// so the signal can never fork across screens.

const DOT: Record<string, string> = {
  green: "bg-rag-green",
  amber: "bg-rag-amber",
  red: "bg-rag-red",
  neutral: "bg-rag-neutral",
};

// Bare dot — for tight spots (table cells, the Gantt) where the label is
// redundant or lives elsewhere. Any unknown value falls back to neutral.
export function RagDot({ rag }: { rag: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-1.5 shrink-0 rounded-full ${DOT[rag] ?? DOT.neutral}`}
    />
  );
}

// Dot + tracked micro-caps label. The default status affordance across the app.
export function RagBadge({
  rag,
  label,
}: {
  rag: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <RagDot rag={rag} />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink">
        {label}
      </span>
    </span>
  );
}
