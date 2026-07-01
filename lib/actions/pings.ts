"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PING_ANSWERS, type PingAnswer } from "@/lib/pings";

export async function logPing(answer: PingAnswer) {
  if (!PING_ANSWERS.includes(answer)) return;
  db.prepare(`INSERT INTO time_pings (pinged_at, answer) VALUES (?, ?)`).run(
    new Date().toISOString(),
    answer,
  );
  revalidatePath("/pings");
  revalidatePath("/week");
}
