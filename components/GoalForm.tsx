"use client";

import { useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { addGoal } from "@/lib/actions/goals";

export default function GoalForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button className="btn btn-accent w-full" onClick={() => setOpen(true)}>
        <Plus size={18} /> Add a goal
      </button>
    );
  }

  return (
    <div className="card p-4 flex flex-col gap-3">
      <input
        autoFocus
        className="input"
        placeholder="The goal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="input"
        rows={2}
        placeholder="Why it matters"
        value={why}
        onChange={(e) => setWhy(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          className="btn btn-accent flex-1"
          disabled={pending || !title.trim()}
          onClick={() =>
            start(async () => {
              await addGoal(title, why);
              setTitle("");
              setWhy("");
              setOpen(false);
            })
          }
        >
          <Check size={16} /> Save
        </button>
        <button className="btn btn-surface" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </button>
      </div>
    </div>
  );
}
