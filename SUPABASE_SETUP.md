# Playtest Tracker — activate live sync (one-time, ~2 min)

The app is wired for live two-way sync with Supabase, but the table it uses
doesn't exist yet. Create it once and live sync turns on automatically.

## Step 1 — run this SQL
Supabase dashboard (project `liiivtbyyawueboeavmw`) → **SQL Editor** → New query →
paste → **Run**:

```sql
create table if not exists playtest_games (
  name text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table playtest_games enable row level security;
create policy "public read"   on playtest_games for select using (true);
create policy "public write"  on playtest_games for insert with check (true);
create policy "public update" on playtest_games for update using (true) with check (true);
alter publication supabase_realtime add table playtest_games;
```

## Step 2 — that's it
Open the app. It will read/write this table directly and subscribe to Realtime.
Claude seeds the table from the git `data/*.json` files on the next chat.

## How the two directions work after that
- **You → Claude:** anything you mark/type in the app upserts to `playtest_games`
  automatically. Claude reads it from a chat with a REST GET.
- **Claude → you:** when Claude upserts a row from a chat, Supabase Realtime pushes
  it to your open app within ~1s — no refresh.

## Notes
- The publishable key in `index.html` is browser-safe (RLS is enabled).
- This table is isolated; its open policy can't touch `user_progress` /
  `user_entitlements` (RLS is per-table).
- To use a separate Supabase project instead, run the SQL there and change
  `SB_URL` / `SB_KEY` at the top of the `<script>` in `index.html`.
- Git `data/*.json` files remain a backup and the offline fallback.
