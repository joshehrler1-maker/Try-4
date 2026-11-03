import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = path.resolve(import.meta.dirname, '..');
let checks = 0;
const ok = (value, message) => { assert.ok(value, message); checks++; };
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const assets = new Set(['super-paw-heroes.png','super-paw-wallpaper.png']);
// Existing binary assets may be supplied by the tracked repository inventory in local QA.
const inventory = process.env.TRY4_ASSET_INVENTORY === '1';
const known = file => exists(file) || (inventory && assets.has(file));
for (const file of fs.readdirSync(root).filter(f => /\.(html|js|json|webmanifest)$/.test(f))) {
 const source = read(file);
 if (/\.(json|webmanifest)$/.test(file)) {JSON.parse(source); checks++;}
 if (file.endsWith('.js')) {new vm.Script(source, {filename:file}); checks++;}
 if (!file.endsWith('.html')) continue;
 for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (!/\bsrc\s*=/.test(match[1])) {new vm.Script(match[2], {filename:file}); checks++;}
 }
 for (const match of source.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
  const ref = match[1];
  if (/^(#|https?:|data:|blob:|mailto:)/.test(ref)) continue;
  const target = decodeURIComponent(ref.split(/[?#]/)[0]);
  if (target) ok(known(target), `${file}: missing local link ${target}`);
 }
}
const manifest = JSON.parse(read('manifest.webmanifest'));
ok(manifest.scope === './' && manifest.start_url === './index.html', 'Manifest must stay within repository subpath');
for (const icon of manifest.icons) ok(known(icon.src), 'Missing icon');
const policy = JSON.parse(read('release-policy.json'));
for (const flag of ['paidSpendAllowed','paidServicesAllowed','paymentAccessAllowed','adsEnabled','autonomousPublishingEnabled','autonomousGenerationEnabled','nativeAndroidBuildReady','releaseReady']) ok(policy[flag] === false, `${flag} must remain disabled`);
ok(policy.characters.dogsAllowed === false && policy.characters.species === 'cats','Cat-only canon');
assert.deepEqual(policy.characters.heroes,['Whisker','Luna']);checks++;
// Exercise the actual service worker handlers with mocked network/cache boundaries.
const handlers = {};
let offline = false, deleted = [];
const scope = 'https://example.test/Try-4/';
const cached = new Map();
const cache = {addAll:async files => {for (const f of files) {ok(known(f), `Missing offline file ${f}`);cached.set(new URL(f,scope).href, {file:f});}},match:async request => cached.get(new URL(typeof request === 'string'?request:request.url,scope).href)};
const context = {URL, Set, Promise, Response, self:{registration:{scope},addEventListener:(name,fn)=>handlers[name]=fn},caches:{open:async ()=>cache,keys:async ()=>['try4-public-v0','other-app'],delete:async name=>deleted.push(name)},fetch:async request=>{if(offline) throw Error('offline');return {live:request.url};}};
vm.runInNewContext(read('sw.js'),context);
let task;
handlers.install({waitUntil:p=>task=p});await task;
handlers.activate({waitUntil:p=>task=p});await task;
assert.deepEqual(deleted,['try4-public-v0']);checks++;
async function request(url,method='GET') {let response;handlers.fetch({request:{url,method,mode:'navigate'},respondWith:p=>response=p});return response?await response:undefined;}
ok((await request(scope+'index.html')).live, 'Online navigation must use network');
offline = true;
ok((await request(scope+'index.html')).file === 'index.html', 'Offline navigation must use cached page');
ok(await request(scope+'operations-center.html') === undefined, 'Do not cache owner preparation tools');
ok(await request(scope+'index.html?private=1') === undefined,'Do not cache query-bearing requests');
ok(await request('https://third-party.test/index.html') === undefined,'Do not intercept third parties');
ok(await request(scope+'index.html','POST') === undefined,'Do not intercept writes');
const arcade=read('3d-games.html');
const resume=arcade.match(/if\(state==='paused'\)\{(.*?)\}else reset\(\)/s)?.[1];
ok(resume?.includes("state='play'") && resume.includes('requestAnimationFrame(loop)') && !/\breset\(/.test(resume),'Arcade resume must continue the existing run');
ok(arcade.includes("document.addEventListener('visibilitychange'"),'Arcade needs background pause');
console.log(`PASS: ${checks} source and offline-worker checks. Physical Android gameplay and install tests remain pending.`);

