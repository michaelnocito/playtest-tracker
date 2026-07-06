# Claude Feedback Action Logging

When you capture feedback (bugs, ideas, strengths, notes) in the playtest tracker, Claude can log actions taken on each item. This creates a complete history of what happened to each piece of feedback.

## Feedback Item Structure

Each inbox item now has an `actions` array that tracks what Claude did:

```json
{
  "id": "abc123",
  "text": "The dodge feels really satisfying",
  "tag": "strength",
  "status": "roadmap",
  "date": "2026-07-05T20:00:00.000Z",
  "note": "Noted during playtest",
  "actions": [
    {
      "type": "noted",
      "note": "This is a confirmed strength — prioritize building on it",
      "at": "2026-07-05T20:15:00.000Z"
    },
    {
      "type": "incorporated",
      "ref": "JF-#043",
      "note": "Planned as the focus of the next sprint: extend dodge combos",
      "at": "2026-07-05T20:30:00.000Z"
    }
  ]
}
```

## Action Types

- **`filed`** — Logged as a task/issue. Set `ref` to a build #, GitHub issue, or commit SHA.
  - Use for: bugs turned into work items, ideas added to a sprint
  - Example: `{ "type": "filed", "ref": "JF-#042", "note": "Added to backlog as JF-#042" }`

- **`incorporated`** — Built into a release or sprint plan.
  - Use for: features you're adding to the next build, bugs you're fixing
  - Example: `{ "type": "incorporated", "ref": "JF-#043", "note": "Planned as core focus of next sprint" }`

- **`noted`** — Acknowledged and logged, but no immediate action. Useful for context.
  - Use for: observations, player feedback, design insights that don't require immediate work
  - Example: `{ "type": "noted", "note": "Confirmed player expectation mismatch on difficulty curve" }`

- **`deferred`** — Intentionally parked for later (e.g., "nice-to-have", post-launch).
  - Use for: good ideas that don't fit the current scope
  - Example: `{ "type": "deferred", "note": "Great idea, but deferring to a post-launch balance pass" }`

- **`duplicate`** — Merged with another item (reference the duplicate in `ref` or `note`).
  - Use for: when two feedback items describe the same issue
  - Example: `{ "type": "duplicate", "note": "Same as the screen-shake issue logged in JF-#039" }`

- **`fixed`** — A bug was fixed and deployed. Same action as in test-result fixes.
  - Use for: bugs that are resolved
  - Example: `{ "type": "fixed", "ref": "JF-#041", "note": "Fixed in JF-#041: dodge window now 60ms" }`

## When Claude Logs Actions

Claude logs an action when:

1. **You ask Claude to act on feedback** ("can you incorporate this into the roadmap?", "log this as a bug")
2. **Claude independently decides to act** (e.g., during a planning session, Claude decides something is a feature for the next sprint)
3. **Feedback gets resolved** (a bug is fixed, an idea is shipped, a strength is built upon)

Claude updates `data/<game>.json` in the same commit as any code changes, so when you sync, you see the action history alongside the current status.

## How to Read the Inbox View

Each feedback item now shows a timeline under the text:

```
👍 strength
roadmapped | 7/5/2026
The dodge feels really satisfying

noted · Confirmed strength, prioritize building on it · 7/5
incorporated · JF-#043 · Planned as core focus of next sprint · 7/5

[→ 🌱 Build on it]  [✓ Fixed]  [Dismiss]
```

**Color key:**
- 🔵 **filed** — Blue (info): task opened
- 🟢 **incorporated** — Green (good): now in the plan
- 🟠 **noted** — Orange (warm): acknowledged
- ⚫ **deferred** — Gray (muted): parked

## Example Flow

**Mike captures feedback:** "dodge combos feel really good"
- Tagged as strength
- Status: new

**Claude in chat:** "I see this is a key strength. Let me plan the next sprint around building it out."
- Claude adds action: `{ "type": "incorporated", "ref": "JF-#043", "note": "Focus of next sprint: extend combos and add juice" }`
- Updates `data/jade-fist.json` and commits

**Mike syncs the app:**
- Strength item shows a timeline: `incorporated · JF-#043 · Focus of next sprint: extend combos and add juice · 7/5`
- Status changes to "roadmapped" (Claude acted on it)
- Mike can now see exactly what Claude plans to do

**Two weeks later, Claude ships the work:**
- Adds action: `{ "type": "fixed", "ref": "JF-#043", "note": "Shipped in JF-#043: 3 new dodge combos, screen juice, combo counter" }`
- Status changes to "fixed"
- Mike sees the full journey: capture → incorporation → delivery

---

**For Mike:** This gives you a complete audit trail of what happened to every piece of feedback. You can see which ideas Claude acted on, which are deferred, which are duplicates, and which are built and shipped.

**For Claude (future chats):** When you handle feedback from the tracker, add an action to the item in `data/<game>.json`. Include what you did, when, and any reference (build #, issue link, commit). This keeps Mike in the loop and builds a searchable history.
