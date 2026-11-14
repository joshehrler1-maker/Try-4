'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const engine=fs.readFileSync(path.join(root,'assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
const page=fs.readFileSync(path.join(root,'pawcade-side-scroll.html'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/pawcade-side-scroll.css'),'utf8');

test('mobile lifecycle suspends play and releases touch input',()=>{
 for(const event of ['visibilitychange','blur','pagehide','freeze'])
  assert.ok(engine.includes(`addEventListener('${event}'`),`missing ${event} handler`);
 assert.match(engine,/addEventListener\('orientationchange',clearInput\)/);
 assert.match(engine,/function clearInput\(\)\s*\{[\s\S]*?mobile\.clear\(\)/);
 assert.match(engine,/function togglePause\(\)\s*\{[\s\S]*?cancelAnimationFrame\(frame\)/);
});

test('fixed-step simulation has a bounded catch-up budget',()=>{
 assert.match(engine,/const tick\s*=\s*1\s*\/\s*120/);
 assert.match(engine,/const maxSteps\s*=\s*5/);
 assert.match(engine,/steps\s*<\s*maxSteps/);
 assert.match(engine,/steps===maxSteps\s*&&\s*accumulator>=tick/);
});

test('all 25 games load the versioned shared engine and mobile controls',()=>{
 assert.match(page,/pawcade-side-scroll-no-badges-v2\.js\?v=[^"\s]+/);
 assert.match(page,/pawcade-side-scroll\.css\?v=[^"\s]+/);
 assert.match(page,/id="touch-stick"/);
 for(const control of ['action','technique','jump'])
  assert.ok(page.includes(`data-control="${control}"`),`missing ${control}`);
 assert.match(css,/orientation:landscape/);
 assert.match(css,/\.side-action-buttons/);
});
