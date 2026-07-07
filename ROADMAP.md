# Playtest Tracker — Roadmap

Backlog for the tracker app itself. Triage decisions from the tracker's own
feedback inbox land here so they survive outside Supabase.

## Backlog

### PT-B1 — Lower-friction GitHub repo association (HIGH, research first)
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
