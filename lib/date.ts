// Local-time date helpers. The app is single-user and runs on one machine, so
// "day" always means the user's local calendar day, not UTC.

/** Local calendar day as YYYY-MM-DD. */
export function dayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Day string N days before the given day (default today). */
export function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + delta);
  return dayStr(dt);
}

/** Monday-based start of the week containing `d`, as a day string. */
export function weekStart(d: Date = new Date()): string {
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  return addDays(dayStr(d), -dow);
}

/** Local midnight (start) of a day string, as an ISO timestamp. */
export function dayStartIso(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toISOString();
}

/** Whole calendar days between two day strings (a - b). */
export function dayDiff(aDay: string, bDay: string): number {
  const [ay, am, ad] = aDay.split("-").map(Number);
  const [by, bm, bd] = bDay.split("-").map(Number);
  const a = new Date(ay, am - 1, ad).getTime();
  const b = new Date(by, bm - 1, bd).getTime();
  return Math.round((a - b) / 86_400_000);
}

/** Whole days between two ISO timestamps (a - b), floored. */
export function daysBetween(aIso: string, bIso: string): number {
  const ms = new Date(aIso).getTime() - new Date(bIso).getTime();
  return Math.floor(ms / 86_400_000);
}

/** Human "time ago" for a past ISO timestamp, e.g. "3d 4h" or "12m". */
export function ago(iso: string, now: Date = new Date()): string {
  let s = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 1000));
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "just now";
}
