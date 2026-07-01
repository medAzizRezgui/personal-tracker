"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { dayStr } from "@/lib/date";

export type DoneTicket = { key: string; summary: string };

/** "Done for the day": stamp which tickets were worked/closed and when I stopped.
    Re-running for the same day replaces that day's snapshot. */
export async function doneForDay(tickets: DoneTicket[]) {
  const day = dayStr();
  const tx = db.transaction(() => {
    db.prepare(`DELETE FROM work_sessions WHERE work_date = ?`).run(day); // cascades tickets
    const { lastInsertRowid } = db
      .prepare(`INSERT INTO work_sessions (work_date, stopped_at) VALUES (?, ?)`)
      .run(day, new Date().toISOString());
    const sessionId = Number(lastInsertRowid);
    const insertTicket = db.prepare(
      `INSERT INTO work_session_tickets (work_session_id, ticket_key, ticket_summary) VALUES (?, ?, ?)`,
    );
    for (const t of tickets) insertTicket.run(sessionId, t.key, t.summary);
  });
  tx();
  revalidatePath("/work");
  revalidatePath("/");
  revalidatePath("/week");
}

export async function clearTodaysWork() {
  db.prepare(`DELETE FROM work_sessions WHERE work_date = ?`).run(dayStr());
  revalidatePath("/work");
  revalidatePath("/");
  revalidatePath("/week");
}
