# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`).

- `pnpm dev` — start the dev server at http://localhost:3000
- `pnpm build` — production build
- `pnpm start` — serve the production build
- `pnpm lint` — run ESLint

There is no test runner configured yet.

`better-sqlite3` is a native module; its build script is approved in `pnpm-workspace.yaml` (`onlyBuiltDependencies`). After a fresh `pnpm install`, run `pnpm rebuild better-sqlite3` if the native binary is missing.

Jira integration reads local env from `.env.local` (gitignored): `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT`. Without them, `/work` renders a setup card instead of failing.

## MCP

The `next-devtools` MCP server is configured in `.mcp.json`. Use it for Next.js-specific work — debugging build/runtime errors, inspecting routes and server/client component behavior, and questions about Next.js 16 App Router APIs — rather than relying on memory, since it reflects the installed Next.js version.

## Architecture

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. A local, single-user, no-auth personal manager (habits, work, thoughts) — mobile-first, one-tap logging. See `plan.md` for the product spec.

**Data flow** — everything is local. `lib/db.ts` opens a `better-sqlite3` singleton (cached on `globalThis` to survive HMR) against `data/tracker.db`, creating the full schema (`CREATE TABLE IF NOT EXISTS`) on first import. The file `data/tracker.db` *is* the backup unit — copy it. Pattern:

- **Reads** live in `lib/queries/*.ts`, called directly from Server Components. Habit metrics (weed gap, porn streak, gym "no 2 dark days" rule, pull-up progression) are *derived* in these queries, not stored.
- **Writes** live in `lib/actions/*.ts` (`"use server"`), called from client components. Each action mutates then `revalidatePath(...)`. Note: a `"use server"` file may only export async functions — shared constants/types go in a plain module (e.g. `lib/pings.ts`).
- Dates are **local-calendar** throughout via `lib/date.ts` (`dayStr`, `dayStartIso`, `weekStart`, etc.); "day" means the user's local day, never UTC.

**Screens** (`app/`): `/` Today (routine checklist + daily note + habit cards + today's stamped work), `/week` look-back (habit deltas, gym progression, closed tickets, copyable standup), `/work` (Jira pull → pick tickets → "Done for the day" snapshot), `/gym` (freeform session logger + progression), `/goals`, `/thoughts` (searchable), `/pings`, `/more`.

**Time-ping** — `components/PingController.tsx` is mounted once in the root layout: a client component that fires a jittered ~40-min chime + one-tap prompt while a tab is open, persisting the next-fire time in `localStorage`.

- **Root layout** (`app/layout.tsx`): full-height flex column, centered `max-w-xl` main, sticky `BottomNav`, plus `PingController`. Reusable primitives (`.card`, `.btn`, `.input`) and design tokens live in `app/globals.css` (`@theme inline`, dark-first with a light `prefers-color-scheme` block) — there is no `tailwind.config.js`.
- **Imports**: `@/*` maps to the repo root (`tsconfig.json` paths). TypeScript is `strict`.
- **Mobile note**: two-column card grids use `min-w-0` on items so they clamp on narrow screens. Verify real mobile layout with Chrome CDP device-metrics emulation, not `--window-size` (the latter misreports layout width for viewports below the CSS `max-width`).