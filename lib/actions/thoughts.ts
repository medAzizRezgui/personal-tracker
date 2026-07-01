"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function addThought(body: string) {
  const trimmed = body.trim();
  if (!trimmed) return;
  db.prepare(`INSERT INTO thoughts (created_at, body) VALUES (?, ?)`).run(
    new Date().toISOString(),
    trimmed,
  );
  revalidatePath("/thoughts");
}

export async function deleteThought(id: number) {
  db.prepare(`DELETE FROM thoughts WHERE id = ?`).run(id);
  revalidatePath("/thoughts");
}
