# Playtest Tracker — Roadmap

Backlog for the tracker app itself. Triage decisions from the tracker's own
feedback inbox land here so they survive outside Supabase.

## Backlog

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
