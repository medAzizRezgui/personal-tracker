"use client";

import { useState, useTransition } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { doneForDay } from "@/lib/actions/work";
import type { JiraTicket } from "@/lib/jira";

export default function TicketPicker({
  tickets,
  preselected,
}: {
  tickets: JiraTicket[];
  preselected: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(preselected));
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function finish() {
    const chosen = tickets
      .filter((t) => selected.has(t.key))
      .map((t) => ({ key: t.key, summary: t.summary }));
    start(async () => {
      await doneForDay(chosen);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {tickets.map((t) => {
          const on = selected.has(t.key);
          return (
            <li key={t.key}>
              <button
                className="card w-full p-3 flex items-start gap-3 text-left"
                onClick={() => toggle(t.key)}
                style={{ borderColor: on ? "var(--accent)" : "var(--border)" }}
              >
                <span
                  className="grid h-5 w-5 place-items-center rounded border shrink-0 mt-0.5"
                  style={{
                    borderColor: on ? "var(--accent)" : "var(--border)",
                    background: on ? "var(--accent)" : "transparent",
                    color: "var(--accent-ink)",
                  }}
                >
                  {on && <Check size={13} strokeWidth={3} />}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-info tabular-nums">{t.key}</span>
                    <span className="text-[10px] uppercase tracking-wide text-faint">{t.status}</span>
                  </div>
                  <div className="text-sm mt-0.5">{t.summary}</div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <button className="btn btn-accent w-full" onClick={finish} disabled={pending}>
        {done ? (
          <>
            <CheckCircle2 size={18} /> Stamped
          </>
        ) : (
          <>Done for the day{selected.size ? ` · ${selected.size}` : ""}</>
        )}
      </button>
    </div>
  );
}
