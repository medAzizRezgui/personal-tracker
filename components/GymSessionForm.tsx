"use client";

import { useState, useTransition } from "react";
import { Plus, X, Check } from "lucide-react";
import { createGymSession, type SetInput } from "@/lib/actions/habits";

type Row = { exercise: string; weight: string; reps: string };

const emptyRow = (): Row => ({ exercise: "", weight: "", reps: "" });

export default function GymSessionForm({ today }: { today: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [pending, start] = useTransition();

  function update(i: number, key: keyof Row, val: string) {
    setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: val } : row)));
  }

  function save() {
    const sets: SetInput[] = rows
      .filter((r) => r.exercise.trim() !== "")
      .map((r) => ({
        exercise: r.exercise,
        weight: r.weight === "" ? null : Number(r.weight),
        reps: r.reps === "" ? null : Number(r.reps),
      }));
    if (sets.length === 0) return;
    start(async () => {
      await createGymSession({ title, date, notes, sets });
      setTitle("");
      setNotes("");
      setRows([emptyRow(), emptyRow(), emptyRow()]);
      setDate(today);
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button className="btn btn-accent w-full" onClick={() => setOpen(true)}>
        <Plus size={18} /> Log a session
      </button>
    );
  }

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Session name (e.g. Back/Biceps)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input w-36"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 px-1 text-[11px] uppercase tracking-wide text-faint">
          <span className="flex-1">Exercise</span>
          <span className="w-16 text-center">kg</span>
          <span className="w-14 text-center">reps</span>
          <span className="w-6" />
        </div>
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="input flex-1"
              placeholder="e.g. Pull-ups"
              value={row.exercise}
              onChange={(e) => update(i, "exercise", e.target.value)}
            />
            <input
              className="input w-16 text-center"
              inputMode="decimal"
              placeholder="—"
              value={row.weight}
              onChange={(e) => update(i, "weight", e.target.value)}
            />
            <input
              className="input w-14 text-center"
              inputMode="numeric"
              placeholder="—"
              value={row.reps}
              onChange={(e) => update(i, "reps", e.target.value)}
            />
            <button
              className="w-6 text-faint"
              aria-label="Remove row"
              onClick={() => setRows((r) => (r.length > 1 ? r.filter((_, j) => j !== i) : r))}
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <button
          className="text-sm text-info self-start px-1"
          onClick={() => setRows((r) => [...r, emptyRow()])}
        >
          + add row
        </button>
      </div>

      <textarea
        className="input"
        rows={2}
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex gap-2">
        <button className="btn btn-accent flex-1" onClick={save} disabled={pending}>
          <Check size={18} /> {pending ? "Saving…" : "Save session"}
        </button>
        <button className="btn btn-surface" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </button>
      </div>
    </div>
  );
}
