"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logPing } from "@/lib/actions/pings";
import { PING_ANSWERS, type PingAnswer } from "@/lib/pings";

// Stochastic sampling: fire on a randomized interval so the cadence can't be
// tuned out. Mean ~40 min. v1 only fires while a tab is open.
const MIN_MS = 25 * 60_000;
const MAX_MS = 55 * 60_000;
const STORAGE_KEY = "ping:nextAt";

function nextDelay() {
  return MIN_MS + Math.random() * (MAX_MS - MIN_MS);
}

function chime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch {
    /* audio may be blocked before first interaction; the prompt still shows */
  }
}

const ANSWER_COLOR: Record<PingAnswer, string> = {
  Work: "var(--info)",
  Nothing: "var(--faint)",
  Scroll: "var(--warn)",
  Play: "var(--accent)",
};

export default function PingController() {
  const [prompting, setPrompting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback(() => {
    setPrompting(true);
    chime();
  }, []);

  const schedule = useCallback(
    (delay: number) => {
      if (timer.current) clearTimeout(timer.current);
      const nextAt = Date.now() + delay;
      localStorage.setItem(STORAGE_KEY, String(nextAt));
      timer.current = setTimeout(fire, delay);
    },
    [fire],
  );

  useEffect(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (!stored || Number.isNaN(stored)) {
      schedule(nextDelay());
    } else {
      const remaining = stored - Date.now();
      // If it was due while the tab was closed, wait a short beat then fire.
      schedule(remaining > 0 ? remaining : 3000);
    }
    return () => void (timer.current && clearTimeout(timer.current));
  }, [schedule]);

  async function answer(a: PingAnswer) {
    setPrompting(false);
    schedule(nextDelay());
    await logPing(a);
  }

  function skip() {
    setPrompting(false);
    schedule(nextDelay());
  }

  if (!prompting) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/50 backdrop-blur-sm p-4">
      <div className="card w-full max-w-sm p-5" style={{ background: "var(--surface-2)" }}>
        <h2 className="text-lg font-semibold">What are you doing right now?</h2>
        <p className="text-sm text-faint mt-1 mb-4">One tap. Sampling where time goes.</p>
        <div className="grid grid-cols-2 gap-3">
          {PING_ANSWERS.map((a) => (
            <button
              key={a}
              className="btn"
              style={{ background: ANSWER_COLOR[a], color: "var(--accent-ink)" }}
              onClick={() => answer(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <button className="text-xs text-faint mt-4 w-full text-center" onClick={skip}>
          skip this one
        </button>
      </div>
    </div>
  );
}
