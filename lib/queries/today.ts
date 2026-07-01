import { db } from "@/lib/db";
import { dayStr } from "@/lib/date";

export type RoutineItem = { id: number; label: string; checked: boolean };

export function routineForDay(day: string = dayStr()): RoutineItem[] {
  return db
    .prepare(
      `SELECT ri.id, ri.label,
              CASE WHEN rc.id IS NULL THEN 0 ELSE 1 END AS checked
         FROM routine_items ri
         LEFT JOIN routine_checks rc
           ON rc.routine_item_id = ri.id AND rc.day = ?
        WHERE ri.active = 1
        ORDER BY ri.position ASC, ri.id ASC`,
    )
    .all(day)
    .map((r) => {
      const row = r as { id: number; label: string; checked: number };
      return { id: row.id, label: row.label, checked: row.checked === 1 };
    });
}

export function dailyNote(day: string = dayStr()): string {
  const row = db.prepare(`SELECT body FROM daily_notes WHERE day = ?`).get(day) as
    | { body: string }
    | undefined;
  return row?.body ?? "";
}
