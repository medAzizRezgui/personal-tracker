"use client";

import { useState, useTransition } from "react";
import { Check, Plus, X } from "lucide-react";
import {
  toggleRoutine,
  addRoutineItem,
  deleteRoutineItem,
} from "@/lib/actions/today";
import type { RoutineItem } from "@/lib/queries/today";

export default function RoutineChecklist({
  items,
  day,
}: {
  items: RoutineItem[];
  day: string;
}) {
  const [, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");

  const doneCount = items.filter((i) => i.checked).length;

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-muted">Routine</h2>
        <span className="text-xs text-faint tabular-nums">
          {doneCount}/{items.length}
        </span>
      </div>

      {items.length === 0 && !adding && (
        <p className="text-sm text-faint mb-3">No routine items yet.</p>
      )}

      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 group">
            <button
              className="flex items-center gap-3 flex-1 py-1.5 text-left"
              onClick={() =>
                start(async () => void (await toggleRoutine(item.id, day, !item.checked)))
              }
            >
              <span
                className="grid h-6 w-6 place-items-center rounded-md border shrink-0"
                style={{
                  borderColor: item.checked ? "var(--accent)" : "var(--border)",
                  background: item.checked ? "var(--accent)" : "transparent",
                  color: "var(--accent-ink)",
                }}
              >
                {item.checked && <Check size={15} strokeWidth={3} />}
              </span>
              <span className={item.checked ? "text-faint line-through" : ""}>{item.label}</span>
            </button>
            <button
              className="text-faint opacity-40 p-1"
              aria-label="Remove item"
              onClick={() => start(async () => void (await deleteRoutineItem(item.id)))}
            >
              <X size={15} />
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <form
          className="flex gap-2 mt-3"
          action={() =>
            start(async () => {
              await addRoutineItem(label);
              setLabel("");
              setAdding(false);
            })
          }
        >
          <input
            autoFocus
            className="input flex-1"
            placeholder="New routine item"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button className="btn btn-accent" type="submit">
            <Check size={16} />
          </button>
        </form>
      ) : (
        <button
          className="text-sm text-info mt-3 flex items-center gap-1"
          onClick={() => setAdding(true)}
        >
          <Plus size={15} /> Add item
        </button>
      )}
    </section>
  );
}
