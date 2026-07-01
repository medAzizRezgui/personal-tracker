"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function addGoal(title: string, why: string) {
  const t = title.trim();
  if (!t) return;
  db.prepare(`INSERT INTO goals (title, why, created_at) VALUES (?, ?, ?)`).run(
    t,
    why.trim(),
    new Date().toISOString(),
  );
  revalidatePath("/goals");
}

export async function archiveGoal(id: number) {
  db.prepare(`UPDATE goals SET archived_at = ? WHERE id = ?`).run(new Date().toISOString(), id);
  revalidatePath("/goals");
}

export async function unarchiveGoal(id: number) {
  db.prepare(`UPDATE goals SET archived_at = NULL WHERE id = ?`).run(id);
  revalidatePath("/goals");
}

export async function deleteGoal(id: number) {
  db.prepare(`DELETE FROM goals WHERE id = ?`).run(id);
  revalidatePath("/goals");
}
