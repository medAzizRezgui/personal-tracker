import { db } from "@/lib/db";
import { dayStartIso, dayStr } from "@/lib/date";

export type PingBreakdown = { answer: string; count: number };

/** Ping counts by answer since a given ISO instant (default: start of today). */
export function pingBreakdown(sinceIso: string = dayStartIso(dayStr())): PingBreakdown[] {
  return db
    .prepare(
      `SELECT answer, COUNT(*) AS count FROM time_pings
        WHERE pinged_at >= ?
        GROUP BY answer ORDER BY count DESC`,
    )
    .all(sinceIso) as PingBreakdown[];
}

export type Ping = { id: number; pinged_at: string; answer: string };

export function recentPings(limit = 50): Ping[] {
  return db
    .prepare(`SELECT id, pinged_at, answer FROM time_pings ORDER BY pinged_at DESC LIMIT ?`)
    .all(limit) as Ping[];
}
