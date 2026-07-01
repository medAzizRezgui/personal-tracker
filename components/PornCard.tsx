"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { resetPorn } from "@/lib/actions/habits";
import type { PornStatus } from "@/lib/queries/habits";

export default function PornCard({ status }: { status: PornStatus }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="card p-4 min-w-0">
      <div className="flex items-center justify-between gap-1">
        <span className="text-sm font-medium text-muted">Porn</span>
        <span className="text-xs text-faint whitespace-nowrap">best {status.bestStreakDays}d</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2 flex-wrap">
        <span className="text-2xl font-semibold tabular-nums">
          {status.currentStreakDays === null ? "—" : `${status.currentStreakDays}d`}
        </span>
        <span className="text-xs text-faint">current streak</span>
      </div>
      <div className="mt-3">
        {confirm ? (
          <div className="flex gap-2">
            <button
              className="btn btn-surface flex-1"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await resetPorn();
                  setConfirm(false);
                })
              }
            >
              Confirm reset
            </button>
            <button className="btn btn-surface" onClick={() => setConfirm(false)} disabled={pending}>
              No
            </button>
          </div>
        ) : (
          <button className="btn btn-surface w-full" onClick={() => setConfirm(true)}>
            <RotateCcw size={16} /> Reset streak
          </button>
        )}
      </div>
    </div>
  );
}
