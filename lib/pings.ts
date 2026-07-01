// Plain shared constants (importable by client + server; not a "use server" file).
export const PING_ANSWERS = ["Work", "Nothing", "Scroll", "Play"] as const;
export type PingAnswer = (typeof PING_ANSWERS)[number];
