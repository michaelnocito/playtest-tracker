# Claude Fix-Logging Workflow

When you ask Claude to fix items you've listed in the tracker, here's what Claude does:

## 1. You copy feedback from a run

Click **"Copy for Claude"** on a test run in the app. You'll get something like:

```
Game: jade-fist  ·  Build: JF-#040

Failed:
- Screen shake on critical hit — happens every time
- Dodge-cancel window off by 10ms

Bugs I logged:
- [Major] Screen shake jank on high refresh rate
```

## 2. Claude fixes the code

Claude reads your feedback, identifies the issues, makes the fixes, and commits to the repo.

## 3. Claude marks items as fixed in the tracker

When Claude commits the fix, it also updates `data/<game>.json` to mark those items as handled. 

**The format:** Claude will update the run's `results` object. For each item Claude fixed:

```json
"results": {
  "1:0": {
    "status": "fail",
    "note": "Screen shake on critical hit — happens every time",
    "claude": {
      "state": "fixed",
      "note": "Changed hit-stop from 6 to 4 frames, removed double-trigger in hitReg",
      "at": "2026-07-05T20:30:00.000Z"
    }
  },
  "1:1": {
    "status": "fail",
    "note": "Dodge-cancel window off by 10ms",
    "claude": {
      "state": "fixed",
      "note": "Dodge input now samples at frame boundary, -10ms drift fixed",
      "at": "2026-07-05T20:30:00.000Z"
    }
  }
}
```

Claude may also mark items as `"state": "working"` if the fix is in progress, or `"state": "need-info"` if more details are needed.

## 4. You sync and retest

In the app, click **⭯ Sync now** (or reload). Items Claude touched now show:

**↳ Claude fixed it — retest**

You then re-test each one and mark it pass or fail. Your verdict is the final truth — if it still fails after Claude's fix, that shows up as a retest item for Claude to tackle again.

## States Claude can set

- **`fixed`** — "I've made a change; please retest to confirm it works."
- **`working`** — "This is on my plate; I'm actively looking at it."
- **`need-info`** — "I need a detail before I can fix this (e.g., exact repro steps, platform, frequency)."
- **`roadmap`** — "This is a feature request or design change, not a bug fix — parked for later."

## What Claude includes in the commit

The commit message will reference which items were fixed:

```
Fix dodge-cancel window timing and screen shake jank

- JF-#040 Dodge-cancel window off by 10ms: changed input sampling to frame boundary
- JF-#040 Screen shake on critical hit: tuned hit-stop duration (6→4 frames)

Updates: data/jade-fist.json with fix-log for build JF-#040
```

Then Claude pushes both the code change AND the updated `data/<game>.json` in a single commit.

---

**For Mike:** You don't need to do anything special. Just copy your feedback to Claude like always, Claude handles the rest. The tracker stays in sync automatically.

**For Claude (future chats):** When you fix items from the tracker, update `data/<game>.json` directly in your commit. Use the format above — the app will parse and display it as "Claude fixed it — retest" badges.
