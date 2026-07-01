import { db } from "@/lib/db";
import { dayStr, weekStart } from "@/lib/date";

export type WorkTicket = { ticket_key: string; ticket_summary: string };
export type WorkSession = {
  id: number;
  work_date: string;
  stopped_at: string;
  tickets: WorkTicket[];
};

function withTickets(sessions: Omit<WorkSession, "tickets">[]): WorkSession[] {
  const getTickets = db.prepare(
    `SELECT ticket_key, ticket_summary FROM work_session_tickets WHERE work_session_id = ?`,
  );
  return sessions.map((s) => ({ ...s, tickets: getTickets.all(s.id) as WorkTicket[] }));
}

export function todaysWorkSession(day: string = dayStr()): WorkSession | null {
  const s = db
    .prepare(`SELECT id, work_date, stopped_at FROM work_sessions WHERE work_date = ? ORDER BY id DESC LIMIT 1`)
    .get(day) as Omit<WorkSession, "tickets"> | undefined;
  return s ? withTickets([s])[0] : null;
}

export function weekWorkSessions(from: string = weekStart()): WorkSession[] {
  const sessions = db
    .prepare(
      `SELECT id, work_date, stopped_at FROM work_sessions WHERE work_date >= ? ORDER BY work_date ASC, id ASC`,
    )
    .all(from) as Omit<WorkSession, "tickets">[];
  return withTickets(sessions);
}
