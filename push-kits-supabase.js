// One-time push of the new analyst-prep-kit rows into the same Supabase table
// the live app reads (playtest_games), using the same browser-safe publishable
// key the app itself embeds (RLS-protected). Run: node push-kits-supabase.js
const fs = require('fs');
const https = require('https');

const SB_URL = 'https://liiivtbyyawueboeavmw.supabase.co';
const SB_KEY = 'sb_publishable_O-6hDpC3l1KdDtHpcv6JVw_O5dSJQor';
const SB_TABLE = 'playtest_games';

const KITS = ['excel','sql','python','tableau','stats','powerbi','interview','simulator','final','forecasting','chart-literacy'];

function upsert(name, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify([{ name, data, updated_at: new Date().toISOString() }]);
    const req = https.request(`${SB_URL}/rest/v1/${SB_TABLE}?on_conflict=name`, {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let chunks = '';
      res.on('data', c => chunks += c);
      res.on('end', () => resolve({ status: res.statusCode, body: chunks }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const kit of KITS) {
    const data = JSON.parse(fs.readFileSync(`${__dirname}/data/${kit}.json`, 'utf8'));
    const res = await upsert(kit, data);
    console.log(kit, res.status, res.body.slice(0, 200));
  }
})();
