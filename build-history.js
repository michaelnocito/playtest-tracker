// One-off: builds data/jade-fist.json historical runs from the facts recorded
// in play-area/jade-fist/JADE_FIST_DEV_NOTES.md (validation sections) and the
// ROADMAP. Run once with `node build-history.js`; safe to re-run (regenerates).
const fs = require('fs');

const SUITE = JSON.parse(fs.readFileSync('data/jade-fist.json', 'utf8')).suite;

// helper: results keyed "passIdx:itemIdx"
const R = (pairs) => {
  const o = {};
  for (const [k, status, note] of pairs) o[k] = { status, note: note || '' };
  return o;
};

const runs = [
  {
    id: 'hist-jf026', build: 'JF-#026', date: '2026-07-03T14:00:00.000Z',
    results: R([
      ['0:2','pass','Bot fairness suite (?bot=3&react=12, ~200ms reaction): 12/12 wins, avg wave 5.0'],
      ['0:5','pass','Zero hits taken across 12 runs; no livelock after bot fixes (no longer pokes brutes/bosses, waits on body-block, dismisses S_END)'],
      ['3:1','pass','No unreactable telegraphs at normal reaction speed. Stress ?bot=2&react=18 (300ms): 8/8 wins, 4 hits all intended (late vipers 267ms floor + 1 allowed late pincer diff>6)'],
    ]),
    bugs: [], debrief: { q1:'', q2:'', q3:'', q4:'Perfect-play bot wins 20/20 — difficulty leans gentle at optimal play; viper floor is 16f (267ms) if late-game ever feels cheap.', q5:'' },
  },
  {
    id: 'hist-jf028', build: 'JF-#028', date: '2026-07-03T16:00:00.000Z',
    results: R([
      ['0:2','pass','Duck/jump dodge axis + spearman throws added; loop still completes'],
      ['3:1','pass','FAIRNESS (?bot=3&react=12): 11/12 wins (was 12/12), avg wave 4.8, 14 hits (13 darts + 1 melee), 0% unreactable, 7% pincer. Harder + still fair.'],
      ['3:0','pass','One legit Rooftop w3 loss (the spear district) — intended difficulty, not a bug'],
    ]),
    bugs: [], debrief: { q1:'', q2:'', q3:'', q4:'Difficulty bump per Mike "campaign too easy": dBase 1/3/5/7/9, boss hp 3/4/5/5/6.', q5:'' },
  },
  {
    id: 'hist-jf029', build: 'JF-#029', date: '2026-07-03T18:00:00.000Z',
    results: R([
      ['0:2','pass','Dodge-pose rework (pure draw); no regression'],
      ['0:5','pass','startRun clears darts + resets jump/duck + grounds player — no stuck state'],
      ['2:0','pass','FULL TEST BATTERY (headless, 17/17 pass): dodge windows generous, wrong-height correctly fails, 52f telegraph + 18-32f reaction budget (>> human ~12-15f), attack timing (counter/perfect/whiff), spacing constants sane'],
      ['3:1','pass','BOT FAIRNESS re-run (?bot=3&react=12): 12/12 wins, 3 hits (all dodgeable darts), 0% unreactable, 0% pincer'],
    ]),
    bugs: [{ id:'b-jf029-1', title:'Duck pose read as "short", not "crouching"', severity:'Minor', freq:'always',
      repro:'1. Duck during a fight (down/S)\n2. Observe player silhouette', expected:'Clear deep-crouch read', actual:'Uniform squash only read as "short" — FIXED in this batch: rebuilt with explicit horse-stance pose + torsoDrop + ground shadow, verified via canvas-crop render' }],
    debrief: { q1:'', q2:'', q3:'', q4:'', q5:'' },
  },
  {
    id: 'hist-jf034', build: 'JF-#030–#034', date: '2026-07-03T21:00:00.000Z',
    results: R([
      ['0:0','pass','600-frame all-silly smoke (every joke scroll + cosmetic + Butcher boss): no throw/error'],
      ['0:2','pass','Loop completes with all 10 "make it sillier" gags active'],
      ['3:1','pass','bot fairness ?bot=3&react=12 = 12/12 wins, 7 hits all dodgeable throws, 0% unreactable, 0% pincer'],
    ]),
    bugs: [], debrief: { q1:'', q2:'', q3:'', q4:'10 gags all built on existing systems (chatter, gag props, reactive moon, longest-yeet, joke scrolls, cosmetics, bowling STRIKE, hype announcer, boss personalities, cameo).', q5:'' },
  },
  {
    id: 'hist-jf036', build: 'JF-#036', date: '2026-07-04T09:00:00.000Z',
    results: R([
      ['4:0','pass','First CG-guidelines audit — ran GAME_BIBLE Part 1/4 checklist against the code'],
      ['4:2','fail','Portrait mobile was a bare 375x211 letterboxed strip (74% black bars) with no rotate prompt — FIXED this batch'],
      ['5:0','pass','12 fixes applied; bot suite re-run 10/12 wins (duck:jump hit ratio improved ~5:1 → 2:1)'],
    ]),
    bugs: [
      { id:'b-jf036-1', title:'Ad request fired in same tick as gameplayStart()', severity:'Major', freq:'always', repro:'1. Finish run\n2. Start next run when ad due', expected:'gameplayStart only after ad resolves', actual:'SDK saw gameplay "active" during an in-flight ad — FIXED (split startRun/beginRun, interstitial callback-gated)' },
      { id:'b-jf036-2', title:'No rotate prompt on portrait mobile', severity:'Major', freq:'always', repro:'1. Open on phone held portrait', expected:'Prompt to rotate', actual:'Tiny letterboxed strip, no explanation — FIXED (portraitBlock + auto-pause + rotate screen)' },
      { id:'b-jf036-3', title:'Duck dodge window shorter than jump', severity:'Minor', freq:'always', repro:'1. Compare DUCK_DUR (26) vs JUMP_DUR (32)', expected:'Symmetric', actual:'~19% shorter; bot hits skewed to high-windup throws — FIXED (DUCK_DUR→30)' },
    ],
    debrief: { q1:'', q2:'', q3:'', q4:'', q5:'' },
  },
  {
    id: 'hist-jf037', build: 'JF-#037', date: '2026-07-04T11:00:00.000Z',
    results: R([
      ['4:0','pass','Second CG-guidelines audit — turned the same methodology on JF-#036\'s own fixes'],
      ['5:0','pass','12 more fixes; node --check on master + both alt builds; bot suite 11/12 wins, zero console errors'],
      ['5:2','pass','Confirmed live: zero SDK-throttle console errors (a compressed bot run had produced 56 before the debounce fix)'],
    ]),
    bugs: [
      { id:'b-jf037-1', title:'Shared SDK debounce silently ate happytime() on every win', severity:'Critical', freq:'always', repro:'1. Win a district (gameplayStop + happytime fire same tick)', expected:'Both fire', actual:'Shared gate treated happytime as a repeat of stop — FIXED (independent gpLast.start/stop/happy)' },
      { id:'b-jf037-2', title:'GM/GD alt-build stubs used old ad-callback signature', severity:'Critical', freq:'always', repro:'1. Build for GameMonetize/GameDistribution\n2. Trigger first ad', expected:'Run continues after ad', actual:'startRun waits on a callback the stub never called → soft-locked menu. FIXED (stubs accept + invoke cb)' },
      { id:'b-jf037-3', title:'First interstitial could fire on run #2', severity:'Major', freq:'always', repro:'1. Start a session\n2. Finish run 1, start run 2', expected:'No ad before a real 3-min wait', actual:'adT started at 0 so cooldown was already satisfied — FIXED (adT = session load time)' },
      { id:'b-jf037-4', title:'Mute button clickable while hidden under pause overlay', severity:'Minor', freq:'always', repro:'1. Pause\n2. Tap top-right corner', expected:'Resume (tap anywhere)', actual:'Silently toggled mute — FIXED (draw mute after overlay)' },
    ],
    debrief: { q1:'', q2:'Several of these were regressions introduced by JF-#036 — the audit turned on its own prior fixes.', q3:'', q4:'', q5:'' },
  },
  {
    id: 'hist-jf038', build: 'JF-#038', date: '2026-07-04T14:00:00.000Z',
    results: R([
      ['0:0','pass','node --check on master + both regenerated alt builds; bot suite 12/12 wins, zero console errors'],
      ['0:2','pass','Combat rebalance: normal/fast/spear enemies now take 2+ hits, wide screen-clearing throw gated behind combo≥4 (FINISH_AT). Loop completes.'],
      ['5:1','pass','Verified via direct function calls in preview (hp decrement/stagger/lethal/empowered paths, brute shove-chain unaffected)'],
    ]),
    bugs: [{ id:'b-jf038-1', title:'Counter-throw was OP — real fighting was skippable', severity:'Major', freq:'always', repro:'1. Counter early and often\n2. Watch crowds clear instantly', expected:'Crowd-clear is an earned payoff', actual:'Every counter auto-cleared neighbors — FIXED (gate the wide throw/SWEEP/STRIKE behind combo≥4; below that a kill fells one enemy). Enemy density cut ~30-40%.' }],
    debrief: { q1:'', q2:'Mike playtest should sanity-check feel/difficulty before QA.', q3:'', q4:'', q5:'' },
  },
];

// newest first (app sorts by date desc on merge, but keep the file tidy)
runs.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync('data/jade-fist.json', JSON.stringify({ suite: SUITE, runs }, null, 2));
console.log('wrote', runs.length, 'historical runs +', runs.reduce((n,r)=>n+r.bugs.length,0), 'bug records');
