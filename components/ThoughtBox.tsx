"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { addThought } from "@/lib/actions/thoughts";

export default function ThoughtBox() {
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    if (!body.trim()) return;
    start(async () => {
      await addThought(body);
      setBody("");
    });
  }

  return (
    <div className="card p-3 flex flex-col gap-2">
      <textarea
        className="input"
        rows={3}
        placeholder="Catch the thought…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
      />
      <button className="btn btn-accent self-end" onClick={submit} disabled={pending}>
        <Send size={16} /> {pending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
