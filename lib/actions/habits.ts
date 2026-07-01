"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { dayStr } from "@/lib/date";

export async function logWeed() {
  db.prepare(`INSERT INTO weed_logs (logged_at) VALUES (?)`).run(new Date().toISOString());
  revalidatePath("/");
}

/** Undo the most recent weed log (fat-finger guard). */
export async function undoLastWeed() {
  const last = db.prepare(`SELECT id FROM weed_logs ORDER BY logged_at DESC LIMIT 1`).get() as
    | { id: number }
    | undefined;
  if (last) db.prepare(`DELETE FROM weed_logs WHERE id = ?`).run(last.id);
  revalidatePath("/");
}

export async function resetPorn() {
  db.prepare(`INSERT INTO porn_resets (reset_at) VALUES (?)`).run(new Date().toISOString());
  revalidatePath("/");
}

export type SetInput = { exercise: string; weight: number | null; reps: number | null };

export async function createGymSession(input: {
  title: string;
  date: string;
  notes: string;
  sets: SetInput[];
}) {
  const date = input.date || dayStr();
  const insertSession = db.prepare(
    `INSERT INTO gym_sessions (session_date, title, notes, created_at) VALUES (?, ?, ?, ?)`,
  );
  const insertSet = db.prepare(
    `INSERT INTO gym_sets (session_id, exercise, weight, reps, position) VALUES (?, ?, ?, ?, ?)`,
  );
  const tx = db.transaction(() => {
    const { lastInsertRowid } = insertSession.run(
      date,
      input.title.trim(),
      input.notes.trim(),
      new Date().toISOString(),
    );
    const sessionId = Number(lastInsertRowid);
    input.sets
      .filter((s) => s.exercise.trim() !== "")
      .forEach((s, i) => insertSet.run(sessionId, s.exercise.trim(), s.weight, s.reps, i));
  });
  tx();
  revalidatePath("/gym");
  revalidatePath("/");
  revalidatePath("/week");
}

export async function deleteGymSession(id: number) {
  db.prepare(`DELETE FROM gym_sessions WHERE id = ?`).run(id);
  revalidatePath("/gym");
  revalidatePath("/");
  revalidatePath("/week");
}
