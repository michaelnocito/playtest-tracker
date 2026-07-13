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

## Screenshots on feedback (one more table-free step, ~1 min)

Feedback items and bugs can carry screenshots (paste or browse). They upload to a
public Storage bucket so they sync across devices without bloating the game rows.
Until the bucket exists the app still works — it just stores the image inside the
item itself (bigger rows, so run this when you can).

Supabase dashboard (project `liiivtbyyawueboeavmw`) → **SQL Editor** → New query →
paste → **Run**:

```sql
insert into storage.buckets (id, name, public)
values ('playtest-shots', 'playtest-shots', true)
on conflict (id) do nothing;

create policy "shots public read"  on storage.objects
  for select using (bucket_id = 'playtest-shots');
create policy "shots public write" on storage.objects
  for insert with check (bucket_id = 'playtest-shots');
```

Notes:
- Every attach also auto-downloads a JPEG copy to your Downloads folder (that's
  your local copy, named `<game>-<where>-<timestamp>.jpg`).
- Images are compressed to max 1400px JPEG before upload, so the bucket stays tiny.
