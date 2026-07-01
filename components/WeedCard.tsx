"use client";

import { useTransition } from "react";
import { Plus, Undo2 } from "lucide-react";
import { logWeed, undoLastWeed } from "@/lib/actions/habits";
import type { WeedStatus } from "@/lib/queries/habits";

export default function WeedCard({ status }: { status: WeedStatus }) {
  const [pending, start] = useTransition();
  return (
    <div className="card p-4 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className="text-sm font-medium text-muted">Weed</span>
        <span className="text-xs text-faint whitespace-nowrap">
          {status.countToday > 0 ? `${status.countToday} today` : "none today"}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl font-semibold tabular-nums">{status.gapLabel}</span>
        <span className="text-xs text-faint">since last</span>
      </div>
      <div className="mt-1 text-xs text-faint">Longest gap: {status.longestGapDays}d</div>
      <div className="mt-3 flex gap-2">
        <button
          className="btn btn-surface flex-1"
          disabled={pending}
          onClick={() => start(async () => void (await logWeed()))}
        >
          <Plus size={16} /> Log one
        </button>
        {status.lastAt && (
          <button
            className="btn btn-surface"
            aria-label="Undo last"
            disabled={pending}
            onClick={() => start(async () => void (await undoLastWeed()))}
          >
            <Undo2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
