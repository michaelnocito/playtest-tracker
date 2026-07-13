# Playtest Tracker

A simple, reusable place to track playtesting and QA for all the games — one test
suite per game, a run per build, and a bug list. Styled to match the Analyst Prep Kit
(the "Grain" design system). Live: https://michaelnocito.github.io/playtest-tracker/

## The one thing to understand: how it syncs

**The app is your dashboard. Chat is how you give input.**

- **Claude → you:** When you ask Claude (in a chat) to log some feedback, it writes it
  into `data/<game>.json` here and pushes to GitHub. In the app, click
  **"Get updates from Claude"** (or just reload) and it appears.
- **You → Claude:** Played something and want it tracked? Just tell Claude in chat, in
  plain words ("jade fist — the mute button didn't work on my phone"). That's it.
  Or, if you clicked around in the app yourself, hit **"Copy for Claude"** on a test and
  paste that into chat.

Why not fully automatic both ways? A public web page can't safely hold a GitHub password/
token, so it can only *read* from the repo, never *write*. That's why input goes through
chat. In practice this is actually less work than checking boxes — you just talk.

**Screenshots:** any feedback item or bug can carry screenshots. Take one (Win+Shift+S),
then Ctrl+V into the capture bar or the bug form — or on any already-submitted item use
📎 (browse your computer) / 📋 (one-click paste). Each attach also auto-saves a JPEG copy
to your Downloads folder. Images upload to a Supabase Storage bucket (one-time SQL in
SUPABASE_SETUP.md); until that bucket exists they're stored inline and still work.

The **backup ▾** menu (Save/Load JSON) is only there if you ever want a file copy. Normal
use never needs it.

## What's in a test

Each game has a **suite** of checks grouped into 6 passes, ordered from "do every build"
to "only before you submit". Every check has a plain-English "how to test it" line so you
never have to decode QA jargon. Mark each **pass / fail / blocked** (click the button to
cycle), jot a note, log bugs with a severity, and answer a short debrief.

## Sprint-specific checks (importing custom test steps)

The 6-pass suite above is generic and stays the same for every game. On top of it you can
say, in chat, something like **"upload testing to playtest for jade-fist — test the new
dodge-cancel window and the screen shake"** and Claude will:

1. Look at what actually changed (recent commits / `<GAME>_DEV_NOTES.md`) and turn it into
   concrete, plain-English test steps.
2. Add them as a new group in that game's suite, tagged so the app renders it as a
   **🎯 SPRINT** block — a distinct blue-bordered section, shown *above* the general
   6 passes, clearly separate from them.
3. Commit + push (and/or push to Supabase) the same way any other tracker update does.

The shape Claude writes into `data/<game>.json` (`games[name].suite`):
```json
{ "pass": "🎯 Sprint check — JF-#040 dodge cancel", "custom": true,
  "sprintLabel": "JF-#040 dodge cancel", "addedDate": "2026-07-05T00:00:00.000Z",
  "retired": false, "items": [ { "t": "...", "h": "..." } ] }
```
These sprint checks **persist across builds until every item in the group passes** — same
untested/pass/fail/blocked cycle as anything else, re-tested each new run. Once they all
show pass, the app quietly marks the group `retired` (no more splicing, item ids never
shift) and folds it into a small "✓ Completed sprint checks" line at the bottom, so the
checklist goes back to just the general passes. You can also hit **retire** on a sprint
group manually if a feature gets descoped before it's fully tested.

## Logging actions on all feedback (Claude → tracker)

Everything you capture — bugs, ideas, strengths, notes — gets tracked with a full action history. When Claude acts on feedback, it logs exactly what was done and when.

**Test-result fixes** (fail/blocked items in a test run):
- Claude fixes the code and marks the result as `"claude": { "state": "fixed", "note": "…" }`
- You retest and verdict is final

**Feedback inbox items** (bugs, ideas, strengths, notes):
- Claude can log actions like `filed` (opened a task), `incorporated` (added to sprint), `noted` (acknowledged), `deferred` (parked), `fixed` (deployed), `duplicate` (merged)
- Each action includes a note + optional reference (build #, issue link, commit)
- You see a timeline of what Claude did

**Example feedback flow:**
1. You capture: "the dodge combos feel really good" (tagged as strength)
2. Claude: logs action `incorporated · JF-#043 · Planning sprint around extending combos`
3. You sync → item shows a timeline and status updates to "roadmapped"
4. Later, Claude: logs action `fixed · JF-#043 · Shipped 3 new combos + juice`
5. You see the full journey: idea → plan → shipped

Hit **⭯ Sync now** after any chat to pull Claude's actions and see the full history of every item.

See **CLAUDE_FEEDBACK_LOG.md** for the action types and format, and **CLAUDE_WORKFLOW.md** for test-result fixes specifically.

## Files

- `index.html` — the whole app (single file, no build step)
- `data/index.json` — list of games
- `data/<game>.json` — that game's suite + all its test runs
- `seed-data.js` — regenerates the data files (friendly suite + imported history);
  run `node seed-data.js`

Companion: `play-area/PLAYTEST_CHECKLIST.md` is the written methodology the suite came from,
and `play-area/GAME_BIBLE.md` is the CrazyGames standard the "ready for the store" pass checks
against.
