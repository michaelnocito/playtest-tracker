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

The **backup ▾** menu (Save/Load JSON) is only there if you ever want a file copy. Normal
use never needs it.

## What's in a test

Each game has a **suite** of checks grouped into 6 passes, ordered from "do every build"
to "only before you submit". Every check has a plain-English "how to test it" line so you
never have to decode QA jargon. Mark each **pass / fail / blocked** (click the button to
cycle), jot a note, log bugs with a severity, and answer a short debrief.

## Files

- `index.html` — the whole app (single file, no build step)
- `data/index.json` — list of games
- `data/<game>.json` — that game's suite + all its test runs
- `seed-data.js` — regenerates the data files (friendly suite + imported history);
  run `node seed-data.js`

Companion: `play-area/PLAYTEST_CHECKLIST.md` is the written methodology the suite came from,
and `play-area/GAME_BIBLE.md` is the CrazyGames standard the "ready for the store" pass checks
against.
