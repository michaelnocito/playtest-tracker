# Playtest Tracker — Roadmap

Backlog for the tracker app itself. Triage decisions from the tracker's own
feedback inbox land here so they survive outside Supabase.

## Backlog

### PT-B4 — Fluid layout, no manual window-resizing — ✅ SHIPPED 2026-07-15
*From Mike's feedback:* "Optimize this whole thing so I don't have to do a lot of
resizing." Reworked the app shell to be responsive so it reads well on a phone /
second screen and on a wide desktop without touching the browser size:
- Below **760px** the fixed `280px + 1fr` grid collapses to a single column and
  the whole page becomes a normal top-to-bottom scroll (`body` height/overflow
  auto, `#app` height auto + `min-height:100dvh`). The topbar/howstrip/sidebar
  `grid-column:1/3` spans are collapsed to `1/2` so nothing forces a squished
  second column; the sidebar stacks above main with a capped, scrollable height.
- The quick-capture row, `.grid2` bug fields and `.tabs` now wrap / scroll
  instead of overflowing; `#buildInput` goes fluid; 16px capture input avoids
  iOS zoom-on-focus. Extra tightening under 460px.
- Verified at 375px, 760-ish, 1280px and 1600px in both modes: zero horizontal
  overflow in every case.

### PT-B3 — Quick-capture is the prominent primary experience — ✅ SHIPPED 2026-07-15
*From Mike's feedback:* the note/bug/feedback capture is what he uses most
("phone/2nd computer → go to the project → drop a quick note → tell Claude
'triage' → repeat"), so it should be front-and-centre and the other QA features
tucked away until called for.
- **Default view is now quick-capture + inbox** (`mainView` defaults to `inbox`;
  `renderMain` forces the inbox view whenever full-test mode is off). The capture
  bar is restyled into a prominent hero card (title + hint + bigger input/Add).
- **Full-test mode is opt-in** behind a new `🧪 Full test` topbar toggle
  (persisted in `localStorage['ptt_fulltest']`). Off by default → the QA sidebar
  (run list), the Start-New-Test build controls (`#runControls`) and the run
  view (checklist / bugs / debrief) are hidden and the capture + inbox go full
  width (`#app.mode-capture`). Toggle on → the full workflow returns, capture bar
  still pinned on top. Nothing was removed; backup/export stays in its menu.
- Preserved: the game/project switcher, live-sync status, and the untriaged
  count — now also surfaced as an always-on `N untriaged` badge in the topbar.
- No changes to the Supabase sync, data model, or SB_* config.

### PT-B2 — Stop losing Claude's triage state on merge — ✅ SHIPPED 2026-07-09
A run present on both the local browser and the cloud was merged by taking the
local copy **wholesale**, which silently dropped `results[id].claude` (the
fixed / working / roadmap / need-info badge) whenever it had arrived via a
cloud pull — the recurring "claude fields re-lost again" symptom seen in
Deadroot's DR-#043 notes. Fixed in `mergeGame`: same-id runs now merge
per-result — the human's `status`/`note` wins (unless still untested, in which
case the cloud verdict fills in), and the `claude` field is carried by newest
`.at` so a badge can never vanish on sync. Bugs merged by id, debrief field-wise.

### PT-B1 — Lower-friction GitHub repo association — ✅ SHIPPED 2026-07-07
Research outcome: GitHub's OAuth device flow and token endpoints are
CORS-blocked from browsers, so real OAuth needs a relay server — wrong fit for
a static GH-Pages app. Built instead:
- **Root-cause fix for "won't save source"**: `mergeGame` used
  `local.roadmap || incoming.roadmap`, so every client's back-filled default
  shadowed the value saved in the cloud. Saved sources now carry `editedAt`
  and the newest explicit edit wins the merge.
- **📂 Load my repos**: unauthenticated GitHub REST fills a datalist on the
  Repo box (owner taken from the box, defaults to michaelnocito).
- **📁 Load folders**: lists the repo's top-level folders; empty folder now
  means repo root (Pull no longer silently keeps the old path).

Original item, kept for history:

#### (was) Lower-friction GitHub repo association (HIGH, research first)
*From inbox item `mr9v90iln99bl` (2026-07, Mike):* typing Repo (owner/repo) +
Folder on a new project doesn't stick as a saved source; associating a new
project with the right repo is too manual.

Decision (2026-07-07): roadmapped, research-first before building. Options to
evaluate:
- GitHub OAuth **device flow** (no server needed, works from a static page) to
  list the user's repos in a picker instead of free-typing owner/repo.
- Fine-grained **PAT** stored in localStorage (simplest, but manual token setup).
- No-auth fallback: unauthenticated GitHub API repo search scoped to
  `user:michaelnocito` (public repos only, zero setup) + fix the save bug so a
  typed repo/folder actually persists.

First step next tracker session: reproduce and fix the "will not save source"
bug, then prototype the no-auth repo picker; only add OAuth if private repos
are needed.
