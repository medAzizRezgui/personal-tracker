import { db } from "@/lib/db";

export type Thought = { id: number; created_at: string; body: string };

export function listThoughts(search = "", limit = 200): Thought[] {
  const q = search.trim();
  if (q) {
    return db
      .prepare(
        `SELECT id, created_at, body FROM thoughts
          WHERE body LIKE ? COLLATE NOCASE
          ORDER BY created_at DESC LIMIT ?`,
      )
      .all(`%${q}%`, limit) as Thought[];
  }
  return db
    .prepare(`SELECT id, created_at, body FROM thoughts ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as Thought[];
}
