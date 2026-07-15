"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateProjectDetailsAction,
  type CreateClientState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  STATUS_LABELS,
  HEALTH_LABELS,
  STATUS_ICONS,
  STATUS_ICON_FALLBACK,
} from "@/app/status-labels";

const initialState: CreateClientState = {};

// The header band's RAG circle — the one place colour lands (DESIGN §6). These
// are the app's single rag-* colour tokens (same source as <RagDot>); only the
// size differs, so the signal reads at header scale without forking the palette.
const HEALTH_DOT: Record<string, string> = {
  green: "bg-rag-green",
  amber: "bg-rag-amber",
  red: "bg-rag-red",
  neutral: "bg-rag-neutral",
};

// One PM/Sponsor cell on the details row: quiet graphite label, ink value,
// a muted em-dash when unset (reads cleaner than a sentence on a one-liner).
function DetailCell({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="text-graphite">{label}: </span>
      <span className="text-ink">{value ?? "—"}</span>
    </div>
  );
}

export function StatusPulseDetails({
  projectId,
  projectPath,
  name,
  status,
  health,
  code,
  pm,
  sponsor,
  readOnly = false,
}: {
  projectId: string;
  projectPath: string;
  name: string;
  status: string;
  health: string;
  code: string | null;
  pm: string | null;
  sponsor: string | null;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateProjectDetailsAction,
    initialState
  );

  // Leave edit mode once a save succeeds and the page revalidates.
  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state]);

  // Admin edit form. Gated behind !readOnly so viewers can never reach it.
  // Code stays editable here even though it now displays up in the title.
  if (editing && !readOnly) {
    return (
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={projectId} />
        <input type="hidden" name="project_path" value={projectPath} />
        <div className="space-y-1.5">
          <label htmlFor="details-code" className="text-sm font-medium">
            Code
          </label>
          <Input id="details-code" name="code" defaultValue={code ?? ""} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="details-pm" className="text-sm font-medium">
            PM
          </label>
          <Input id="details-pm" name="pm" defaultValue={pm ?? ""} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="details-sponsor" className="text-sm font-medium">
            Sponsor
          </label>
          <Input
            id="details-sponsor"
            name="sponsor"
            defaultValue={sponsor ?? ""}
          />
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
        </div>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
      </form>
    );
  }

  const statusLabel = STATUS_LABELS[status] ?? status;
  const StatusIcon = STATUS_ICONS[status] ?? STATUS_ICON_FALLBACK;
  // Health is only meaningful while a project is live (unchanged gating).
  const showHealth = status === "active" || status === "on_hold";

  return (
    <div>
      {/* Row 1 — identity (name + code) on the left, the status/health signal
          as two icon-above-label units on the right. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl leading-tight font-semibold tracking-tight text-ink">
            {name}
            {code ? ` (${code})` : ""}
          </h1>
          {!readOnly ? (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-8">
          {/* Status unit — larger neutral glyph over a tracked micro-caps label.
              Kept graphite (no hue) so colour stays reserved for health. */}
          <div className="flex flex-col items-center gap-1.5">
            <StatusIcon className="size-5 shrink-0 text-graphite" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-graphite">
              {statusLabel}
            </span>
          </div>
          {/* Health unit — the one colour in the band: a larger RAG circle over
              an ink label. Only shown while the project is live. */}
          {showHealth ? (
            <div className="flex flex-col items-center gap-1.5">
              <span className="flex size-5 items-center justify-center">
                <span
                  aria-hidden
                  className={`size-3 rounded-full ${HEALTH_DOT[health] ?? HEALTH_DOT.neutral}`}
                />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink">
                {HEALTH_LABELS[health] ?? health}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Row 2 — PM & Sponsor on one line, under a hairline divider */}
      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-1.5 border-t pt-4 text-sm">
        <DetailCell label="PM" value={pm} />
        <DetailCell label="Sponsor" value={sponsor} />
      </div>
    </div>
  );
}
