import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// Single-user local app: one SQLite file, opened once and cached on the global
// object so Next.js dev HMR doesn't open a new handle on every reload.

const DB_PATH = join(process.cwd(), "data", "tracker.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS routine_items (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  label    TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS routine_checks (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  routine_item_id INTEGER NOT NULL REFERENCES routine_items(id) ON DELETE CASCADE,
  day             TEXT NOT NULL,
  checked_at      TEXT NOT NULL,
  UNIQUE(routine_item_id, day)
);

CREATE TABLE IF NOT EXISTS daily_notes (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  day  TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS weed_logs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  logged_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS porn_resets (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  reset_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gym_sessions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  session_date TEXT NOT NULL,
  title        TEXT NOT NULL DEFAULT '',
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gym_sets (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES gym_sessions(id) ON DELETE CASCADE,
  exercise   TEXT NOT NULL,
  weight     REAL,
  reps       INTEGER,
  position   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS time_pings (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  pinged_at TEXT NOT NULL,
  answer    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  work_date  TEXT NOT NULL,
  stopped_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work_session_tickets (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  work_session_id INTEGER NOT NULL REFERENCES work_sessions(id) ON DELETE CASCADE,
  ticket_key      TEXT NOT NULL,
  ticket_summary  TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS goals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  why         TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL,
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS thoughts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  body       TEXT NOT NULL
);
`;

function open(): Database.Database {
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}

const globalForDb = globalThis as unknown as { __trackerDb?: Database.Database };

export const db: Database.Database = globalForDb.__trackerDb ?? open();
if (process.env.NODE_ENV !== "production") globalForDb.__trackerDb = db;
