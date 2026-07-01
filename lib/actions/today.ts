"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { dayStr } from "@/lib/date";

export async function toggleRoutine(itemId: number, day: string, checked: boolean) {
  if (checked) {
    db.prepare(
      `INSERT OR IGNORE INTO routine_checks (routine_item_id, day, checked_at) VALUES (?, ?, ?)`,
    ).run(itemId, day, new Date().toISOString());
  } else {
    db.prepare(`DELETE FROM routine_checks WHERE routine_item_id = ? AND day = ?`).run(itemId, day);
  }
  revalidatePath("/");
}

export async function addRoutineItem(label: string) {
  const trimmed = label.trim();
  if (!trimmed) return;
  const max = db.prepare(`SELECT COALESCE(MAX(position), 0) AS m FROM routine_items`).get() as {
    m: number;
  };
  db.prepare(`INSERT INTO routine_items (label, position, active) VALUES (?, ?, 1)`).run(
    trimmed,
    max.m + 1,
  );
  revalidatePath("/");
}

export async function deleteRoutineItem(id: number) {
  // Soft-remove from the daily list; keep history of past checks intact.
  db.prepare(`UPDATE routine_items SET active = 0 WHERE id = ?`).run(id);
  revalidatePath("/");
}

export async function saveDailyNote(day: string, body: string) {
  db.prepare(
    `INSERT INTO daily_notes (day, body) VALUES (?, ?)
       ON CONFLICT(day) DO UPDATE SET body = excluded.body`,
  ).run(day || dayStr(), body);
  revalidatePath("/");
}
