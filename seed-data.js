// Regenerates every data/<game>.json from scratch: the beginner-friendly suite
// (kept identical to DEFAULT_SUITE in index.html) for all games, plus imported
// historical test runs for the games that already had validation recorded in
// their play-area dev notes. Run: `node seed-data.js`. Safe to re-run.
const fs = require('fs');

// --- friendly suite (title + plain "how to check"), mirrors index.html ------
const SUITE = [
  { pass: '1. Quick check — do this every build', items: [
    { t: 'Nothing is broken when it opens', h: 'Open the game. It should show up normally — no error pop-ups, no blank/black screen.' },
    { t: 'You get to play fast', h: 'From the page loading, it should take one click or tap (or none) to actually be playing. No menus in the way.' },
    { t: 'You can finish one whole round', h: 'Play a complete run/level/match from start to finish without getting stuck.' },
    { t: 'Starting over works', h: 'After you finish or lose, you can cleanly start again.' },
    { t: 'Sound plays and mute works', h: 'You can hear audio, and pressing mute actually silences it.' },
    { t: 'Nothing freezes or traps you', h: 'No hanging, no forever-loading, no screen you can’t get out of.' },
  ]},
  { pass: '2. First-timer test — do this when something is new', items: [
    { t: 'Playable with zero instructions', h: 'Pretend you’ve never seen it. Can you work out what to do just by looking at the screen?' },
    { t: 'No “wait… what do I do?” moments', h: 'Write down anywhere you got confused. That’s a spot to fix — it’s not you being slow.' },
    { t: 'It survives weird inputs', h: 'Try things it might not expect — spam buttons, tap random spots. It shouldn’t break.' },
    { t: 'You always know where you are', h: 'At any moment you can tell: what to do now, what you just did, and what’s coming next.' },
  ]},
  { pass: '3. Check every feature — the thorough pass', items: [
    { t: 'Every button does what it says', h: 'Click each button/menu item. It should do exactly what its label promises.' },
    { t: 'All the control types work', h: 'Try keyboard, mouse/touch, and controller (if supported). Each should reach every action.' },
    { t: 'Points/coins/progress add up right', h: 'Earn some, spend some. Check the numbers change correctly and don’t glitch.' },
    { t: 'Your progress saves', h: 'Close the game and reopen it. Whatever you unlocked or earned should still be there.' },
    { t: 'The extremes behave', h: 'Check the edges: having zero of something, the maximum, and the very first time vs. later times.' },
    { t: 'Looks right at any size', h: 'Resize the window and try a phone-shaped screen. Nothing should overflow or get cut off.' },
  ]},
  { pass: '4. Is it fun and fair? — play a few rounds', items: [
    { t: 'Played a few rounds back to back', h: 'Do 3–5 full sessions in a row so you feel the real rhythm, not just one lucky or unlucky run.' },
    { t: 'Difficulty feels fair', h: 'Note any moment that felt cheap or unfairly hard, and roughly where it happened.' },
    { t: 'It never got boring', h: 'Note any stretch that dragged or felt repetitive. Boredom counts as a real problem here.' },
    { t: 'You’d actually play again', h: 'Would you start a 4th or 5th round? Jot down why or why not — that answer matters most.' },
    { t: 'Quick gut rating (1–5)', h: 'Rate fun / fair / clear / would-recommend, each 1–5. Do it each build so you can see the trend.' },
  ]},
  { pass: '5. Ready for the store — do this before you submit', items: [
    { t: 'Meets the platform’s rules', h: 'Run the platform’s own checklist. For CrazyGames that’s GAME_BIBLE.md in the play-area repo.' },
    { t: 'Tested on real devices', h: 'Not just your desktop browser — try it on an actual phone and/or tablet.' },
    { t: 'Handles bad conditions', h: 'Try it with an ad-blocker on, slow internet, a backgrounded tab, and rotating the phone.' },
  ]},
  { pass: '6. Did a fix break anything? — do this after fixing bugs', items: [
    { t: 'Re-tested around the fix', h: 'Re-check everything near what you changed, not only the one bug you were chasing.' },
    { t: 'Re-ran the quick check', h: 'Do pass 1 again fully. A fix that breaks the basics is worse than the bug it fixed.' },
    { t: 'Checked things that share code', h: 'If you changed something lots of features rely on, test all of those features, not just one.' },
  ]},
];

const R = (pairs) => { const o = {}; for (const [k, s, n] of pairs) o[k] = { status: s, note: n || '' }; return o; };

// --- Jade Fist: full history (from JADE_FIST_DEV_NOTES validation sections) --
const jadeFistRuns = [
  { id:'hist-jf026', build:'JF-#026', date:'2026-07-03T14:00:00.000Z', results:R([
      ['0:2','pass','Bot fairness suite (?bot=3&react=12, ~200ms reaction): 12/12 wins, avg wave 5.0'],
      ['0:5','pass','Zero hits across 12 runs; no livelock after bot fixes (no longer pokes brutes/bosses, waits on body-block, dismisses ending)'],
      ['3:1','pass','No unreactable telegraphs at normal speed. Stress ?bot=2&react=18 (300ms): 8/8 wins, 4 hits all intended'] ]),
    bugs:[], debrief:{q1:'',q2:'',q3:'',q4:'Perfect-play bot wins 20/20 — difficulty leans gentle at optimal play; viper floor is 16f (267ms) if late-game ever feels cheap.',q5:''} },
  { id:'hist-jf028', build:'JF-#028', date:'2026-07-03T16:00:00.000Z', results:R([
      ['0:2','pass','Duck/jump dodge axis + spearman throws added; loop still completes'],
      ['3:1','pass','FAIRNESS (?bot=3&react=12): 11/12 wins, 14 hits (13 darts + 1 melee), 0% unreactable, 7% pincer. Harder + still fair.'],
      ['3:0','pass','One legit Rooftop w3 loss (the spear district) — intended difficulty, not a bug'] ]),
    bugs:[], debrief:{q1:'',q2:'',q3:'',q4:'Difficulty bump per Mike "campaign too easy": dBase 1/3/5/7/9, boss hp 3/4/5/5/6.',q5:''} },
  { id:'hist-jf029', build:'JF-#029', date:'2026-07-03T18:00:00.000Z', results:R([
      ['0:2','pass','Dodge-pose rework (pure draw); no regression'],
      ['0:5','pass','startRun clears darts + resets jump/duck + grounds player — no stuck state'],
      ['2:0','pass','FULL TEST BATTERY (headless, 17/17): dodge windows generous, wrong-height fails correctly, 52f telegraph + 18-32f reaction budget, attack timing, spacing sane'],
      ['3:1','pass','BOT FAIRNESS re-run: 12/12 wins, 3 hits (all dodgeable darts), 0% unreactable, 0% pincer'] ]),
    bugs:[{id:'b-jf029-1',title:'Duck pose read as "short", not "crouching"',severity:'Minor',freq:'always',repro:'1. Duck during a fight\n2. Look at the player',expected:'Clear deep-crouch read',actual:'Uniform squash only read as "short" — FIXED: explicit horse-stance pose + torsoDrop + ground shadow'}],
    debrief:{q1:'',q2:'',q3:'',q4:'',q5:''} },
  { id:'hist-jf034', build:'JF-#030–#034', date:'2026-07-03T21:00:00.000Z', results:R([
      ['0:0','pass','600-frame all-silly smoke (every joke scroll + cosmetic + Butcher boss): no error'],
      ['0:2','pass','Loop completes with all 10 "make it sillier" gags active'],
      ['3:1','pass','bot fairness = 12/12 wins, 7 hits all dodgeable throws, 0% unreactable, 0% pincer'] ]),
    bugs:[], debrief:{q1:'',q2:'',q3:'',q4:'10 gags all built on existing systems.',q5:''} },
  { id:'hist-jf036', build:'JF-#036', date:'2026-07-04T09:00:00.000Z', results:R([
      ['4:0','pass','First CG-guidelines audit — ran GAME_BIBLE checklist against the code'],
      ['4:2','fail','Portrait mobile was a bare 375x211 letterboxed strip (74% black bars) with no rotate prompt — FIXED this batch'],
      ['5:0','pass','12 fixes applied; bot suite 10/12 wins (duck:jump hit ratio improved ~5:1 → 2:1)'] ]),
    bugs:[
      {id:'b-jf036-1',title:'Ad request fired in same tick as gameplayStart()',severity:'Major',freq:'always',repro:'1. Finish run\n2. Start next when ad due',expected:'gameplayStart only after ad resolves',actual:'SDK saw gameplay "active" during an in-flight ad — FIXED'},
      {id:'b-jf036-2',title:'No rotate prompt on portrait mobile',severity:'Major',freq:'always',repro:'1. Open on phone held portrait',expected:'Prompt to rotate',actual:'Tiny letterboxed strip, no explanation — FIXED'},
      {id:'b-jf036-3',title:'Duck dodge window shorter than jump',severity:'Minor',freq:'always',repro:'1. Compare DUCK_DUR (26) vs JUMP_DUR (32)',expected:'Symmetric',actual:'~19% shorter — FIXED (DUCK_DUR→30)'} ],
    debrief:{q1:'',q2:'',q3:'',q4:'',q5:''} },
  { id:'hist-jf037', build:'JF-#037', date:'2026-07-04T11:00:00.000Z', results:R([
      ['4:0','pass','Second CG-guidelines audit — turned the same methodology on #036\'s own fixes'],
      ['5:0','pass','12 more fixes; node --check on master + both alt builds; bot suite 11/12 wins, zero console errors'],
      ['5:2','pass','Live: zero SDK-throttle console errors (a compressed bot run had produced 56 before the debounce fix)'] ]),
    bugs:[
      {id:'b-jf037-1',title:'Shared SDK debounce silently ate happytime() on every win',severity:'Critical',freq:'always',repro:'1. Win a district',expected:'Both gameplayStop + happytime fire',actual:'Shared gate treated happytime as a repeat — FIXED (independent timestamps)'},
      {id:'b-jf037-2',title:'GM/GD alt-build stubs used old ad-callback signature',severity:'Critical',freq:'always',repro:'1. Build for GameMonetize/GameDistribution\n2. Trigger first ad',expected:'Run continues after ad',actual:'startRun waited on a callback the stub never called → soft-lock. FIXED'},
      {id:'b-jf037-3',title:'First interstitial could fire on run #2',severity:'Major',freq:'always',repro:'1. Start session\n2. Finish run 1, start run 2',expected:'No ad before a real 3-min wait',actual:'adT started at 0 — FIXED (adT = session load time)'},
      {id:'b-jf037-4',title:'Mute button clickable while hidden under pause overlay',severity:'Minor',freq:'always',repro:'1. Pause\n2. Tap top-right',expected:'Resume (tap anywhere)',actual:'Silently toggled mute — FIXED'} ],
    debrief:{q1:'',q2:'Several of these were regressions introduced by JF-#036 — the audit turned on its own prior fixes.',q3:'',q4:'',q5:''} },
  { id:'hist-jf038', build:'JF-#038', date:'2026-07-04T14:00:00.000Z', results:R([
      ['0:0','pass','node --check on master + both regenerated alt builds; bot suite 12/12 wins, zero console errors'],
      ['0:2','pass','Combat rebalance: normal/fast/spear enemies take 2+ hits, wide clear gated behind combo≥4. Loop completes.'],
      ['5:1','pass','Verified via direct function calls in preview (hp decrement/stagger/lethal/empowered, brute shove-chain unaffected)'] ]),
    bugs:[{id:'b-jf038-1',title:'Counter-throw was OP — real fighting was skippable',severity:'Major',freq:'always',repro:'1. Counter early and often',expected:'Crowd-clear is an earned payoff',actual:'Every counter auto-cleared neighbors — FIXED (gate wide throw behind combo≥4; density cut ~30-40%)'}],
    debrief:{q1:'',q2:'Mike playtest should sanity-check feel/difficulty before QA.',q3:'',q4:'',q5:''} },
];

// --- Rooftop Sprint: headline QA facts from ROOFTOP_SPRINT_DEV_NOTES ---------
const rooftopRuns = [
  { id:'hist-rs-qa', build:'RS deep QA sweep', date:'2026-07-02T12:00:00.000Z', results:R([
      ['0:2','pass','Suite green, campaign winnable end to end'],
      ['0:5','pass','Every borderline "unclearable gap" confirmed trivially clearable at the true edge (bot-timing, not a game bug); verified clean across 10+ seeds'],
      ['5:0','pass','rs_qa_sweep.js run — found + fixed 3 more real bugs on top of the 30 gap-report items'] ]),
    bugs:[{id:'b-rs-1',title:'SDK.data.getItem() throws on a fresh player',severity:'Major',freq:'always',repro:'1. Load with no prior save\n2. Watch the save path',expected:'Graceful empty-save handling',actual:'Threw (no visible error except SDK console.error) — FIXED with a guard'}],
    debrief:{q1:'',q2:'',q3:'',q4:'Next chat = Mike full playtest, then the B7 ship wave.',q5:''} },
];

// --- Deadroot: DR-#001 slice facts from DEADROOT_DEV_NOTES -------------------
const deadrootRuns = [
  { id:'hist-dr-001', build:'DR-#001 slice', date:'2026-07-03T20:00:00.000Z', results:R([
      ['0:2','pass','First playable slice ships; core corpse-mutation tower-defense loop completes'],
      ['2:0','pass','Corpse/tower tap-radius hit tests verified (near-miss hits + far-miss non-hits) via a temporary debug hook'],
      ['5:0','pass','Robustness pass on the new batch'] ]),
    bugs:[
      {id:'b-dr-1',title:'Corpse-tap returned menu unexpectedly null',severity:'Major',freq:'sometimes',repro:'1. Tap a corpse near the edge',expected:'Hits register within a sane radius',actual:'Unbounded hitPad() over-reached — FIXED (capped hitPad at 80px)'},
      {id:'b-dr-2',title:'Dead scaling + spawn-count cap missing in endless',severity:'Major',freq:'always',repro:'1. Reach late endless waves',expected:'Difficulty scales smoothly, spawns capped',actual:'Scaling bug + uncapped spawns — FIXED (endlessWave())'} ],
    debrief:{q1:'',q2:'Next = playtest + tuning.',q3:'',q4:'',q5:''} },
];

const GAMES = {
  'jade-fist': jadeFistRuns,
  'rooftop-sprint': rooftopRuns,
  'deadroot': deadrootRuns,
  'rune-dash': [],
  'flipline': [],
};

for (const [name, runs] of Object.entries(GAMES)){
  runs.sort((a, b) => new Date(b.date) - new Date(a.date));
  fs.writeFileSync(`data/${name}.json`, JSON.stringify({ suite: SUITE, runs, inbox: [] }, null, 2));
}
fs.writeFileSync('data/index.json', JSON.stringify(Object.keys(GAMES)) + '\n');
console.log('seeded', Object.keys(GAMES).length, 'games:',
  Object.entries(GAMES).map(([n,r]) => `${n}(${r.length})`).join(', '));
