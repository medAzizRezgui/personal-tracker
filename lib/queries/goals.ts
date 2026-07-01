import { db } from "@/lib/db";

export type Goal = {
  id: number;
  title: string;
  why: string;
  created_at: string;
  archived_at: string | null;
};

export function listGoals(): { active: Goal[]; archived: Goal[] } {
  const all = db
    .prepare(`SELECT id, title, why, created_at, archived_at FROM goals ORDER BY created_at DESC`)
    .all() as Goal[];
  return {
    active: all.filter((g) => !g.archived_at),
    archived: all.filter((g) => g.archived_at),
  };
}
