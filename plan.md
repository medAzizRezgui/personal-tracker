# Personal Manager — build spec

A local personal manager app. Single user (me), no auth, runs locally for now. Must work on mobile view (responsive). Prioritize friction-light logging over feature completeness — everything loggable in one tap/keystroke, or it won't get used.

Framework is open, but I work in Next.js day to day so lean that way unless there's a reason not to. Local persistence — SQLite or a local file is fine; whatever's simplest to run locally and back up.

## Screens

### 1. Today (default screen)
The "wake up knowing what to do" view. One glance, no scrolling on mobile. Shows:
- Today's routine / plan
- Today's habit status (the three below) at-a-glance
- Today's work tickets (pulled from Jira, see Work)

### 2. Weekly look-back (must-have)
The most important screen. Surfaces the progress that's invisible day to day — not a stats dashboard, a "here's what actually moved" view. Shows week-over-week:
- Gym sessions logged + progression toward pull-ups
- Habit deltas: longest weed gap, current/best porn streak, gym rule kept or broken
- What work got closed
  Should be able to feed / half-write my standup (I already draft standups from Jira + Slack, so don't make this a second chore next to that).

## Work tracking
- Pull today's tickets from Jira instead of manual entry. Project **DB** (Development Board), site **spendnetwork.atlassian.net**. Jira creds/cloudId go in local env config, not hardcoded.
- The real gap I'm solving: not knowing when to stop or what's next. So this is a session log, not a pomodoro timer. Pick today's tickets, work, hit **"Done for the day"** — it stamps what I closed and when I stopped. Over a week that becomes the weekly look-back.

## Time tracking (stochastic / ping-based)
- In-app random-interval ping. While the app tab is open, fire a chime on a randomized interval (~40 min, jittered so I don't tune it out) and pop a one-tap prompt: **What are you doing right now?** → Work / Nothing / Scroll / Play.
- Sampling, not a live timer — no start/stop, no memory burden. Builds a statistical map of where time actually goes, especially the scroll/nothing time I'd "forget" to log.
- In-app only for v1 (tab must be open). Real background/phone notifications are a possible v2, don't build it now.

## Habits (three, modeled differently — do NOT force into one checkbox row)

**Weed** — counter with a delay target. Log each one, show gap-since-last. Win = fewer / longer gaps, not abstinence. No shaming language.

**Porn** — streak with a reset button. Current streak + best streak. Reset is just data, not a failure screen.

**Gym** — two parts:
- Rule tracker: "no 2 dark days." Green if safe, yellow/nag if today is the second dark day. This is the one that should actively nag.
- Session log: I run a structured back/biceps dumbbell program with a pull-up goal. Log *which* session + actual lifts (weight/reps), so progression toward pull-ups is visible. This is the part that keeps me opening it.

## Goals
Plain list, each with a "why" attached. Keep v1 simple — no fake progress percentages. A holding pen for far-off goals so they stop rattling in my head.

## Thoughts
Timestamped dump. No structure, no tagging burden — one box, catch the thought, done. Searchable later. Doubles as a catch for writing ideas (I want to write about internet subcultures eventually), so search matters.

## v1 scope discipline
Build: Today, Weekly look-back, Work (Jira pull + done-for-day), Time ping, the three habits, Goals (simple), Thoughts.
Defer to v2: background/phone notifications, richer goal progression tracking, anything fancy.

## Non-negotiables
- One-tap logging everywhere.
- Mobile responsive.
- Runs fully local, no auth.
- Habits modeled per their real shape, not a uniform checklist.