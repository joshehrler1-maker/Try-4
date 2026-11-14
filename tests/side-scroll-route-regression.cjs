// Run: node tests/side-scroll-route-regression.cjs
// Zero-dependency static checks; browser gameplay tests are still required.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'pawcade-side-scroll-no-badges-v2.js'), 'utf8');
function readArray(name) {
  const pos = src.indexOf('const ' + name + '=[');
  assert(pos >= 0, 'Missing ' + name);
  const begin = src.indexOf('[', pos);
  let depth = 0, end = -1;
  for (let i = begin; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']' && --depth === 0) { end = i; break; }
  }
  assert(end > begin, 'Unclosed ' + name);
  const literal = src.slice(begin, end + 1);
  assert(/^[\s\[\],\d'a-z-]+$/i.test(literal), 'Nonliteral data: ' + name);
  return Function('return (' + literal + ')')();
}
const routes = readArray('signatureRoutes');
const beats = readArray('worldBeatOrders');
const palettes = readArray('worldMechanicPalettes');
const kinds = new Set(['floor','shelf','lift','spring','belt','barrel','pogo','ice','current','rail']);
for (const [name, rows] of [['routes', routes], ['beats', beats], ['palettes', palettes]])
  assert.equal(rows.length, 25, name + ' must have 25 entries');
for (let game = 0; game < 25; game++) {
  assert.equal(routes[game].length, 3, 'Three route landings per game ' + game);
  let previous = -1;
  for (const [x,y,w,kind] of routes[game]) {
    assert(x > previous && x >= 0, 'Route ordering game ' + game);
    assert(y >= 85 && y <= 310 && w >= 70 && w <= 310, 'Route geometry game ' + game);
    assert(kinds.has(kind), 'Unknown route surface game ' + game);
    previous = x;
  }
  assert.deepEqual([...beats[game]].sort(), [0,1,2,3,4], 'Beat permutation game ' + game);
  assert.equal(palettes[game].length, 5, 'Palette size game ' + game);
  for (const kind of palettes[game]) assert(kinds.has(kind), 'Unknown palette surface game ' + game);
}
assert.equal(new Set(routes.map(JSON.stringify)).size, 25, 'Route layouts must be distinct');
assert.equal(new Set(palettes.map(JSON.stringify)).size, 25, 'Mechanic palettes must be distinct');
assert(src.includes('if(sx+width>start+stageWidths[stage]-75) continue;'), 'Missing stage boundary guard');
// Animation safety checks: each game's visual-only cue must stay gated by
// its own course index; do not silently share motions across counterparts.
const isolatedCues = [
  ['seedLeap',4],['waterfallDive',5],['lanternFloat',6],
  ['polarityTurn',7],['stagePulse',8],['quarryBrace',9],
  ['windBank',10],['cloudPursuit',11],['thunderCharge',12],
  ['autumnHop',13],['observatoryFlip',14],['bambooSwoop',15],
  ['steamPulse',16],['snowBrace',17],['canyonPatrol',18],
  ['submarineFin',19],['neonDash',20],['marbleWeight',21],
  ['swampBob',22],['sunflowerBank',23],['cargoLatch',24]
];
for (const [cue, game] of isolatedCues) {
  const declaration = src.match(new RegExp('const\\s+' + cue + '\\s*=([^;]+);'));
  assert(declaration, 'Missing animation cue ' + cue);
  assert(new RegExp('index\\s*===\\s*' + game + '(?!\\d)').test(declaration[1]),
    'Animation cue ' + cue + ' must be restricted to game ' + game);
  assert(src.includes(cue + (cue === 'seedLeap' ? '?' : '')) || src.includes('+' + cue),
    'Animation cue ' + cue + ' is never used');
}
// Mobile pause/resume safety: stale animation samples must reset velocity
// and landing state rather than extrapolating from suspended-frame timing.
assert(src.includes('const motionDt=stableMotionSample?Math.min(.05,elapsed):0;'),
  'Stale horizontal samples must not advance animation springs');
assert(src.includes('foe._bodyVelocity=stableMotionSample'),
  'Stale horizontal samples must clear visual body velocity');
assert(src.includes('foe._lastVerticalSpeed=stableVerticalSample?verticalSpeed:0;'),
  'Stale vertical samples must clear landing velocity');
console.log('PASS: mobile enemy animation resume guards');
console.log('PASS: 21 individual enemy motion cues remain scoped to their own games');
console.log('PASS: 25 distinct platform routes, palettes, beats and bounds');
