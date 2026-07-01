"use client";

import { useEffect, useRef, useState } from "react";
import { saveDailyNote } from "@/lib/actions/today";

export default function DailyNote({ day, initial }: { day: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  function onChange(v: string) {
    setValue(v);
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await saveDailyNote(day, v);
      setSaved(true);
    }, 600);
  }

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-muted">Plan for today</h2>
        <span className="text-[11px] text-faint">{saved ? "saved" : "…"}</span>
      </div>
      <textarea
        className="input"
        rows={3}
        placeholder="What matters today?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </section>
  );
}
