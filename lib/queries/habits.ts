import { db } from "@/lib/db";
import { dayStr, dayStartIso, dayDiff, daysBetween, ago } from "@/lib/date";

// ---------- Weed: counter with a delay target (win = longer gaps) ----------

export type WeedStatus = {
  lastAt: string | null;
  gapLabel: string; // "3d 4h" since last, or "—"
  countToday: number;
  longestGapDays: number;
};

export function weedStatus(now: Date = new Date()): WeedStatus {
  const last = db
    .prepare(`SELECT logged_at FROM weed_logs ORDER BY logged_at DESC LIMIT 1`)
    .get() as { logged_at: string } | undefined;

  const countToday = (
    db
      .prepare(`SELECT COUNT(*) AS c FROM weed_logs WHERE logged_at >= ?`)
      .get(dayStartIso(dayStr(now))) as { c: number }
  ).c;

  // Longest gap between consecutive logs, across all history.
  const rows = db
    .prepare(`SELECT logged_at FROM weed_logs ORDER BY logged_at ASC`)
    .all() as { logged_at: string }[];
  let longestGapDays = 0;
  for (let i = 1; i < rows.length; i++) {
    const g = daysBetween(rows[i].logged_at, rows[i - 1].logged_at);
    if (g > longestGapDays) longestGapDays = g;
  }

  return {
    lastAt: last?.logged_at ?? null,
    gapLabel: last ? ago(last.logged_at, now) : "—",
    countToday,
    longestGapDays,
  };
}

// ---------- Porn: streak with a reset (reset is just data) ----------

export type PornStatus = {
  currentStreakDays: number | null; // null = no baseline yet
  bestStreakDays: number;
  lastResetAt: string | null;
};

export function pornStatus(now: Date = new Date()): PornStatus {
  const resets = db
    .prepare(`SELECT reset_at FROM porn_resets ORDER BY reset_at ASC`)
    .all() as { reset_at: string }[];

  if (resets.length === 0) {
    return { currentStreakDays: null, bestStreakDays: 0, lastResetAt: null };
  }

  // Completed streaks = gaps between consecutive resets.
  let best = 0;
  for (let i = 1; i < resets.length; i++) {
    const g = daysBetween(resets[i].reset_at, resets[i - 1].reset_at);
    if (g > best) best = g;
  }
  const lastReset = resets[resets.length - 1].reset_at;
  const current = daysBetween(now.toISOString(), lastReset);
  if (current > best) best = current;

  return { currentStreakDays: current, bestStreakDays: best, lastResetAt: lastReset };
}

// ---------- Gym: "no 2 dark days" rule + freeform session log ----------

export type GymRuleState = "green" | "warn" | "broken" | "none";

export type GymRule = {
  state: GymRuleState;
  message: string;
  lastSessionDate: string | null;
  daysSince: number | null; // 0 = trained today
};

export function gymRule(now: Date = new Date()): GymRule {
  const last = db
    .prepare(`SELECT session_date FROM gym_sessions ORDER BY session_date DESC LIMIT 1`)
    .get() as { session_date: string } | undefined;

  if (!last) {
    return { state: "none", message: "No sessions yet — log one to start", lastSessionDate: null, daysSince: null };
  }

  const daysSince = dayDiff(dayStr(now), last.session_date);
  if (daysSince <= 0) return { state: "green", message: "Trained today", lastSessionDate: last.session_date, daysSince: 0 };
  if (daysSince === 1) return { state: "green", message: "Rest day — safe", lastSessionDate: last.session_date, daysSince };
  if (daysSince === 2) return { state: "warn", message: "2nd dark day — train today", lastSessionDate: last.session_date, daysSince };
  return { state: "broken", message: `${daysSince} dark days — get back in`, lastSessionDate: last.session_date, daysSince };
}

export type GymSet = { id: number; exercise: string; weight: number | null; reps: number | null };
export type GymSession = {
  id: number;
  session_date: string;
  title: string;
  notes: string;
  sets: GymSet[];
};

export function recentSessions(limit = 20): GymSession[] {
  const sessions = db
    .prepare(`SELECT id, session_date, title, notes FROM gym_sessions ORDER BY session_date DESC, id DESC LIMIT ?`)
    .all(limit) as Omit<GymSession, "sets">[];
  const getSets = db.prepare(
    `SELECT id, exercise, weight, reps FROM gym_sets WHERE session_id = ? ORDER BY position ASC, id ASC`,
  );
  return sessions.map((s) => ({ ...s, sets: getSets.all(s.id) as GymSet[] }));
}

/** Best (max reps) pull-up-ish set per session date, oldest→newest. */
export function pullupProgression(): { date: string; reps: number }[] {
  const rows = db
    .prepare(
      `SELECT gs.session_date AS date, MAX(st.reps) AS reps
         FROM gym_sets st JOIN gym_sessions gs ON gs.id = st.session_id
        WHERE LOWER(st.exercise) LIKE '%pull%' AND st.reps IS NOT NULL
        GROUP BY gs.session_date
        ORDER BY gs.session_date ASC`,
    )
    .all() as { date: string; reps: number }[];
  return rows;
}
