import { db } from "@/lib/db";
import { weekStart, dayStartIso, daysBetween } from "@/lib/date";
import { pornStatus, gymRule } from "@/lib/queries/habits";
import { weekWorkSessions } from "@/lib/queries/work";
import { pingBreakdown } from "@/lib/queries/pings";

export type WeekSummary = {
  from: string;
  gym: { sessions: number; bestPullups: number };
  weed: { count: number; longestGapDays: number };
  porn: { current: number | null; best: number };
  gymRule: { kept: boolean; message: string };
  closedTickets: { key: string; summary: string }[];
  pings: { answer: string; count: number }[];
};

export function weekSummary(from: string = weekStart()): WeekSummary {
  const sinceIso = dayStartIso(from);

  const gymSessions = (
    db.prepare(`SELECT COUNT(*) AS c FROM gym_sessions WHERE session_date >= ?`).get(from) as {
      c: number;
    }
  ).c;

  const bestPullups = (
    db
      .prepare(
        `SELECT COALESCE(MAX(st.reps), 0) AS r
           FROM gym_sets st JOIN gym_sessions gs ON gs.id = st.session_id
          WHERE gs.session_date >= ? AND LOWER(st.exercise) LIKE '%pull%'`,
      )
      .get(from) as { r: number }
  ).r;

  const weedRows = db
    .prepare(`SELECT logged_at FROM weed_logs WHERE logged_at >= ? ORDER BY logged_at ASC`)
    .all(sinceIso) as { logged_at: string }[];
  let longestGapDays = 0;
  for (let i = 1; i < weedRows.length; i++) {
    const g = daysBetween(weedRows[i].logged_at, weedRows[i - 1].logged_at);
    if (g > longestGapDays) longestGapDays = g;
  }

  const porn = pornStatus();
  const rule = gymRule();

  // Dedupe closed tickets across the week's work sessions (latest summary wins).
  const byKey = new Map<string, string>();
  for (const s of weekWorkSessions(from)) {
    for (const t of s.tickets) byKey.set(t.ticket_key, t.ticket_summary);
  }
  const closedTickets = [...byKey.entries()].map(([key, summary]) => ({ key, summary }));

  return {
    from,
    gym: { sessions: gymSessions, bestPullups },
    weed: { count: weedRows.length, longestGapDays },
    porn: { current: porn.currentStreakDays, best: porn.bestStreakDays },
    gymRule: { kept: rule.state !== "broken", message: rule.message },
    closedTickets,
    pings: pingBreakdown(sinceIso),
  };
}

/** Standup-style summary text built from the week's closed work. */
export function standupText(s: WeekSummary): string {
  const lines: string[] = [];
  if (s.closedTickets.length) {
    lines.push("This week:");
    for (const t of s.closedTickets) lines.push(`• ${t.key} — ${t.summary}`);
  } else {
    lines.push("This week: no tickets stamped yet.");
  }
  return lines.join("\n");
}
