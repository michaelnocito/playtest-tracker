// Adds the Analyst Prep Kit learning apps to the tracker alongside the games.
// Shared "every kit" suite mirrors TESTING_CHECKLIST.md's 6 lenses; each kit
// also gets its own kit-specific check(s) from that doc, plus a 🎯 SPRINT
// group for any outstanding retest items called out in TESTING_RUN_LOG.md.
// Run: `node seed-kits.js`. Safe to re-run (idempotent, overwrites kit files only).
const fs = require('fs');

const SHARED_SUITE = [
  { pass: '1. 🔥 Smoke — every build', items: [
    { t: 'Loads clean', h: 'Open the kit URL with the browser console open (F12). Page should render with no red console errors.' },
  ]},
  { pass: '2. 🎯 Happy path — every build', items: [
    { t: 'Every top-nav view loads', h: 'Click every top-nav button once. Every view should load — no blank panel.' },
    { t: 'Lesson 1 → Quick Check → Practice this', h: 'Open Lesson 1, answer the Quick Check, click "Practice this". Visual should show, quiz marks green on correct, and it flows into a drill.' },
  ]},
  { pass: '3. ♻️ Regression — every build', items: [
    { t: 'Wrong/right drill feedback', h: 'In any drill, tap a wrong choice then a right choice. Wrong = red, right = green + advances. No typing box anywhere.' },
  ]},
  { pass: '4. 💾 State — every build', items: [
    { t: 'Progress + theme persist', h: 'Complete a lesson, then reload — it should still show done. Toggle theme, reload — theme should persist.' },
  ]},
  { pass: '5. 📐 Non-functional — every build', items: [
    { t: 'Responsive + light mode', h: 'Shrink the window narrow and flip to light mode. Layout should hold, text readable, nothing cut off.' },
  ]},
  { pass: '6. Did a fix break anything? — after fixing bugs', items: [
    { t: 'Re-tested around the fix', h: 'Re-check everything near what you changed, not only the one bug you were chasing.' },
    { t: 'Re-ran the smoke + happy path passes', h: 'Do passes 1–2 again fully. A fix that breaks the basics is worse than the bug it fixed.' },
  ]},
];

// kit-specific pass, straight from TESTING_CHECKLIST.md's "Kit-specific top-level item(s)"
const KIT_SPECIFIC = {
  excel: { t: 'Pivot Lab updates on drag', h: 'Drag a field into Rows/Values in Pivot Lab — the table should update.' },
  sql: { t: 'Result-table visuals render', h: 'Open 2 lessons — the result-table visual should render in each.' },
  python: { t: 'Output-block visuals render', h: 'Open 2 lessons — the output-block visual should render in each.' },
  tableau: { t: 'Viz Builder + Workspace + L20 dual-axis', h: 'Viz Builder: drag fields onto shelves, a chart should draw. Workspace: Tour explains a panel, Find-it scores a tap. L20 dual-axis chart actually renders (Chart.js).' },
  stats: { t: 'Charts render (canvas-timing risk)', h: 'Open 2-3 lessons — charts should render, NOT blank. Known Chart.js canvas-timing risk here specifically.' },
  powerbi: { t: 'DAX Lab + Workspace + routing', h: 'DAX Lab opens; Workspace works; nav routes cleanly (this kit uses a different router under the hood than the others).' },
  interview: { t: 'Behavioral question flow', h: 'Answer one behavioral question — the rate-the-answer / multiple-choice flow should work end to end.' },
  simulator: { t: 'Live manager review', h: 'Paste your API key, submit — a manager review should come back (this hits the live Claude API, costs a call).' },
  final: { t: 'Exam + Study Guide', h: 'Start the exam, answer, submit a section — score shows. Study Guide sections expand, each with its own "📺 See it" visual.' },
  forecasting: { t: 'Lesson 1 flow (new kit)', h: 'Lesson 1 "What forecasting is (and isn\'t)" → Quick Check → Practice this. Visual shows, quiz green on correct, flows into a drill.' },
  'chart-literacy': { t: 'Chart literacy drills render', h: 'Open a couple of the CL lessons — the chart visuals should render, drills should mark correctly.' },
};

// outstanding items pulled from TESTING_RUN_LOG.md (June 12, 2026 run) that were
// still ☐ (untested) or ⚠️/❌→🔧 (fixed, needs retest) as of that log.
const SPRINTS = {
  sql: [{
    pass: '🎯 Sprint check — SQL Lab retest (JOIN/Agg labs)', custom: true,
    sprintLabel: 'SQL Lab progressive hints + tabs', addedDate: '2026-06-12T00:00:00.000Z', retired: false,
    items: [
      { t: 'Repeated-wrong progressive fill (2nd/3rd try)', h: 'In JOIN Lab, run a wrong query, then wrong again, then a 3rd time. 2nd try should fill the first half of the answer into the editor; 3rd try should fill the full answer.' },
      { t: 'Correct query celebration', h: 'Run the correct query — should show "✓ Correct — N rows" in green plus a celebration.' },
      { t: 'Show Answer is last resort, readable both themes', h: 'With a wrong/empty query, click Show Answer. It should only appear as a last resort, and be readable in both dark and light mode.' },
      { t: 'Aggregation Lab / Free Lab tabs', h: 'Click the Aggregation Lab tab, then the Free Lab tab. Each should load its own panel with no blank, and the nav map should highlight the active tab.' },
    ],
  }],
  excel: [{
    pass: '🎯 Sprint check — fill-in-the-blank retest (v1.53.1)', custom: true,
    sprintLabel: 'Excel fill-in progressive auto-fill', addedDate: '2026-06-12T00:00:00.000Z', retired: false,
    items: [
      { t: 'Progressive auto-fill on repeated miss', h: 'Miss a fill-in-the-blank drill a couple times — it should progressively auto-fill on repeated misses (same pattern as other drills).' },
      { t: 'Blank sized to missing text', h: 'Check the "___" blank in a fill-in-the-blank question — it should be sized to the actual missing text, not a fixed generic width.' },
    ],
  }],
};

const KITS = Object.keys(KIT_SPECIFIC);

function buildSuite(kit) {
  const suite = SHARED_SUITE.map(p => ({ pass: p.pass, items: p.items.map(i => ({ ...i })) }));
  // insert the kit-specific check into pass 2 (happy path) so it's part of the "every build" flow
  suite[1].items.push(KIT_SPECIFIC[kit]);
  return [...suite, ...(SPRINTS[kit] || [])];
}

const dataDir = `${__dirname}/data`;
const existingIndex = JSON.parse(fs.readFileSync(`${dataDir}/index.json`, 'utf8'));

for (const kit of KITS) {
  const filePath = `${dataDir}/${kit}.json`;
  const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
  const runs = existing?.runs || [];
  const inbox = existing?.inbox || [];
  fs.writeFileSync(filePath, JSON.stringify({ suite: buildSuite(kit), runs, inbox }, null, 2) + '\n');
}

const merged = Array.from(new Set([...existingIndex, ...KITS]));
fs.writeFileSync(`${dataDir}/index.json`, JSON.stringify(merged) + '\n');

console.log('seeded', KITS.length, 'kits:', KITS.join(', '));
console.log('index now:', merged.join(', '));
