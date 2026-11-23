
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import test from 'node:test';
import {runInNewContext} from 'node:vm';

const workerSource = await readFile(new URL('../pawtopia-online/worker.js',import.meta.url),'utf8');
const {default:worker} = await import('data:text/javascript;base64,'+Buffer.from(workerSource).toString('base64'));
const schema = await readFile(new URL('../pawtopia-online/schema.sql',import.meta.url),'utf8');
const origin = 'https://joshehrler1-maker.github.io';

async function setup(t) {
  const sqlite = new DatabaseSync(':memory:');
  t.after(()=>sqlite.close());
  sqlite.exec(schema);
  const players = ['a','b','c'].map(letter=>({id:letter,alias:'Paw-'+letter,key:letter.repeat(64)}));
  for (const player of players) {
    const digest = await crypto.subtle.digest('SHA-256',Buffer.from(player.key));
    sqlite.prepare('INSERT INTO player(id,token_hash,alias) VALUES(?,?,?)')
      .run(player.id,Buffer.from(digest).toString('hex'),player.alias);
  }
  const env = {PAWTOPIA_ORIGIN:origin,TURNSTILE_SECRET:'test-only',DB:{
    async batch(queries) {
      sqlite.exec('BEGIN');
      try {
        const result = queries.map(query=>query.runSync());
        sqlite.exec('COMMIT');
        return result;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
    prepare(sql) {
    const statement = sqlite.prepare(sql);
    return {bind(...args) { return {
      async first() { return statement.get(...args) ?? null; },
      async all() { return {results:statement.all(...args)}; },
      runSync() { return {meta:statement.run(...args)}; },
      async run() { return this.runSync(); }
    }; }};
  }}};
  return async (player,path,body) => {
    const headers = {Origin:origin};
    if (player) headers.Authorization = 'Bearer '+(players.find(entry=>entry.id===player)?.key ?? player);
    const request = new Request('https://worker.test'+path, {headers,method:body ? 'POST' : 'GET',
      body:body ? JSON.stringify(body) : undefined});
    const response = await worker.fetch(request,env);
    return {status:response.status,body:await response.json()};
  };
}
const root = '/arena-duel';
const pet = (breed,stats={}) => ({breed,name:breed+' test cat',
  stats:{level:10,strength:2,defence:2,movement:2,endurance:2,intelligence:2,...stats}});
const begin = call => call('a',root+'/create',pet('Bengal'));
const move = (call,who,code,round,pick) => call(who,root+'/move',{code,round,move:pick});

test('duel invites require accounts, approved breeds, and independent players',async t=>{
  const call = await setup(t);
  assert.equal((await call(null,root+'/status')).status,401);
  assert.equal((await call('a',root+'/status')).body.enabled,true);
  assert.equal((await call('a',root+'/create',pet('Fake Cat'))).status,400);
  assert.equal((await call('a',root+'/create',{breed:'Bengal'})).status,400);
  const started = await begin(call);
  assert.equal(started.status,201);
  const {code} = started.body;
  assert.match(code,/^[0-9a-f]{12}$/);
  assert.equal((await begin(call)).status,409);
  assert.equal((await call('a',root+'/hosted')).body.duel.code,code);
  assert.equal((await call('c',root+'?code='+code)).status,404);
  assert.equal((await call('a',root+'/join',{...pet('Ragdoll'),code})).status,400);
  const joined = await call('b',root+'/join',{...pet('Sphynx'),code});
  assert.equal(joined.body.phase,'active');
  assert.deepEqual(joined.body.fighters.map(({breed,hp})=>[breed,hp]),[['Bengal',40],['Sphynx',40]]);
  assert.equal((await call('c',root+'/join',{...pet('Ragdoll'),code})).status,409);
  assert.equal((await call('c',root+'/leave',{code})).status,404);
});

test('private choices resolve once with guard, cooldown, replay and stale retries',async t=>{
  const call = await setup(t);
  const {code} = (await begin(call)).body;
  await call('b',root+'/join',{...pet('Siamese'),code});
  assert.equal((await move(call,'a',code,1,'ultimate')).status,400);
  assert.equal((await move(call,'a',code,1,'constructor')).status,400);
  const pending = await move(call,'a',code,1,'signature');
  assert.equal(pending.body.submitted,true);
  const waiting = (await call('b',root+'?code='+code)).body;
  assert.equal(waiting.submitted,false);
  assert.deepEqual(waiting.history,[]);
  assert.equal(waiting.choices,undefined);
  assert.equal(waiting.host_id,undefined);
  assert.equal((await move(call,'a',code,1,'swipe')).body.submitted,true);
  const next = (await move(call,'b',code,1,'guard')).body;
  assert.deepEqual(next.history[0],{round:1,moves:['signature','guard'],damage:[3,0],
    hpBefore:[40,40],hpAfter:[40,37]});
  assert.equal(next.round,2);
  assert.equal((await move(call,'b',code,1,'guard')).body.history.length,1);
  assert.equal((await move(call,'a',code,2,'signature')).status,400);
  let responses = await Promise.all([move(call,'a',code,2,'swipe'),move(call,'b',code,2,'swipe')]);
  if (responses[0].status === 409) await move(call,'a',code,2,'swipe');
  if (responses[1].status === 409) await move(call,'b',code,2,'swipe');
  assert.equal((await call('a',root+'?code='+code)).body.history.length,2);
  await move(call,'a',code,3,'swipe');
  await move(call,'b',code,3,'swipe');
  const ultimate = await move(call,'a',code,4,'ultimate');
  assert.equal(ultimate.body.submitted,true);
  await move(call,'b',code,4,'guard');
  assert.equal((await move(call,'a',code,5,'ultimate')).status,400);
  const finished = await call('b',root+'/leave',{code});
  assert.equal(finished.body.phase,'finished');
  assert.equal(finished.body.winner,0);
  assert.equal((await begin(call)).status,201);
});

test('a simultaneous knockout is a draw and guard-only duels stop after 15 rounds',async t=>{
  const call = await setup(t);
  for (const attack of ['swipe','guard']) {
    const {code} = (await begin(call)).body;
    await call('b',root+'/join',{...pet('Siamese'),code});
    let duel;
    for (let round=1;round<=(attack==='swipe'?6:15);round++) {
      await move(call,'a',code,round,attack);
      duel = (await move(call,'b',code,round,attack)).body;
    }
    assert.equal(duel.phase,'finished');
    assert.equal(duel.winner,null);
    assert.equal(duel.reason,attack==='swipe'?'knockout':'round-limit');
  }
});

test('specific cats retain their trained stats, private names and level unlocks',async t=>{
  const call = await setup(t);
  const host = {...pet('Bengal',{level:12,strength:30,defence:6,movement:4,endurance:15,intelligence:18}),name:'Mochi'};
  const guest = {...pet('Bengal',{level:2,strength:2,defence:8,movement:24,endurance:3,intelligence:2}),name:'Poppy'};
  const invite = await call('a',root+'/create',host);
  assert.equal(invite.body.fighters[0].maxHp,83);
  assert.equal(invite.body.fighters[0].name,'Mochi');
  const {code} = invite.body;
  const joined = await call('b',root+'/join',{...guest,code});
  assert.equal(joined.body.fighters[0].name,undefined);
  assert.equal(joined.body.fighters[1].name,'Poppy');
  assert.equal(joined.body.fighters[1].maxHp,27);
  assert.equal(joined.body.fighters[0].stats.intelligence,18);
  assert.equal((await move(call,'b',code,1,'guard')).status,400);
  assert.equal((await move(call,'b',code,1,'signature')).status,400);
  assert.equal((await move(call,'b',code,1,'swipe')).status,200);
  const result = (await move(call,'a',code,1,'signature')).body;
  assert.deepEqual(result.history[0].damage,[50,2]);
  assert.deepEqual(result.history[0].hpAfter,[81,0]);
  assert.equal(result.winner,0);
});

test('ranked matchmaking claims both real players and scores a result once',async t=>{
  const call = await setup(t);
  const first = await call('a','/arena-ranked/queue',pet('Bengal'));
  assert.equal(first.body.queued,true);
  assert.equal(first.body.duel,null);
  const queued = await call('b','/arena-ranked/queue',pet('Siamese'));
  assert.equal(queued.body.duel.ranked,true);
  assert.equal(queued.body.duel.bot,false);
  const {code} = queued.body.duel;
  const rival = (await call('a','/arena-ranked')).body;
  assert.equal(rival.duel.code,code);
  assert.notEqual(rival.duel.side,queued.body.duel.side);
  assert.equal((await call('c','/arena-duel?code='+code+'&ranked=1')).status,404);
  await call('a','/arena-duel/move',{code,round:1,move:'signature',ranked:true});
  const played = await call('b','/arena-duel/move',{code,round:1,move:'guard',ranked:true});
  assert.equal(played.body.history.length,1);
  await call('a','/arena-duel/leave',{code,ranked:true});
  await call('a','/arena-duel/leave',{code,ranked:true});
  const [winner,loser] = await Promise.all([call('b','/arena-ranked'),call('a','/arena-ranked')]);
  assert.deepEqual([winner.body.rating,winner.body.wins,loser.body.rating,loser.body.losses],[1020,1,980,1]);
});

test('bot fallback waits, makes two mistakes, and leaves rating unchanged',async t=>{
  let now = Date.now();
  t.mock.method(Date,'now',()=>now);
  const call = await setup(t);
  await call('a','/arena-ranked/queue',pet('Bengal',{strength:600,intelligence:600,endurance:0}));
  now += 11999;
  assert.equal((await call('a','/arena-ranked/poll',{})).body.duel,null);
  now += 1;
  const {code,bot,fighters} = (await call('a','/arena-ranked/poll',{})).body.duel;
  assert.equal(bot,true);
  assert.equal(fighters[1].alias,'Arena Bot');
  const one = await call('a','/arena-duel/move',{code,round:1,move:'signature',ranked:true});
  assert.equal(one.body.phase,'active');
  const two = await call('a','/arena-duel/move',{code,round:2,move:'swipe',ranked:true});
  assert.deepEqual(two.body.history.map(r=>r.moves[1]),['fumble','fumble']);
  assert.equal(two.body.winner,0);
  const profile = (await call('a','/arena-ranked')).body;
  assert.deepEqual([profile.rating,profile.wins,profile.losses],[1000,0,0]);
});

test('an overlapping poll cannot put a player in two matches, and cancel removes a search',async t=>{
  const call = await setup(t);
  await call('a','/arena-ranked/queue',pet('Bengal'));
  await Promise.all([call('b','/arena-ranked/queue',pet('Siamese')),call('c','/arena-ranked/queue',pet('Ragdoll'))]);
  const statuses = await Promise.all(['a','b','c'].map(id=>call(id,'/arena-ranked')));
  assert.equal(new Set(statuses.map(r=>r.body.duel?.code).filter(Boolean)).size,1);
  assert.equal(statuses.filter(r=>r.body.duel).length,2);
  const waiting = ['a','b','c'][statuses.findIndex(r=>r.body.queued)];
  assert.equal((await call(waiting,'/arena-ranked/cancel',{})).body.queued,false);
});

const arenaScript = await readFile(new URL('../assets/pawtopia-arena-duels.js',import.meta.url),'utf8');
const arenaHtml = await readFile(new URL('../pawtopia-battle-arena.html',import.meta.url),'utf8');

function browserArena(call, player) {
  const listeners = new Map(), timers = new Map(), windowListeners = new Map(), cache = new Map();
  let timerId = 0, paints = 0;
  let pets = [{breed:'Bengal',name:'First cat',battleId:'first'},{breed:'Bengal',name:'Second cat',battleId:'second'}];
  const controls = new Map([...arenaHtml.matchAll(/id="(duel-[^"]+)"/g)].map(([,id])=>[id,{
    id,value:'',textContent:'',hidden:false,disabled:false,
    addEventListener(type,handler) { listeners.set(id+' '+type,handler); },
    replaceChildren(...options) { this.value = options[0]?.value || ''; },
    querySelectorAll() { return []; },
    classList:{toggle(){},remove(){}}
  }]));
  const document = {hidden:false,getElementById:id=>id === 'arena-duels' ? {scrollIntoView(){}} : controls.get(id),
    addEventListener(type,handler) { listeners.set(type,handler); }};
  const window = {
    PawtopiaOnline:{
      key:()=>player,
      async call(path,method,body) {
        const response = await call(player,path,body);
        if (response.status >= 400) throw Object.assign(new Error(response.body.error),{status:response.status});
        return response.body;
      }
    },
    PawtopiaSave:{read:()=>({companion:pets[0],otherCompanions:pets.slice(1)})},
    PawtopiaBattleData:{breeds:['Bengal'],kitFor:()=>({signature:'Signature',ultimate:'Ultimate'})},
    PawtopiaBattleCharacterArt:{paintFighter(){paints++;}},
    PawtopiaBattleEngine:{level:()=>10,training:()=>pet('Bengal').stats},
    matchMedia:()=>({matches:true}),confirm:()=>true,
    addEventListener(type,handler) { windowListeners.set(type,handler); }
  };
  const context = {
    window,document,URL,location:{href:'https://example.test/pawtopia-battle-arena.html',hash:''},
    localStorage:{getItem:key=>cache.get(key),setItem:(key,value)=>cache.set(key,value),removeItem:key=>cache.delete(key)},
    Option:class {constructor(label,value){this.label=label;this.value=value;}},
    setTimeout(handler,ms){const id=++timerId;timers.set(id,{handler,ms});return id;},
    clearTimeout:id=>timers.delete(id)
  };
  runInNewContext(arenaScript,context);
  const flush = async()=>{for(let i=0;i<5;i++) await new Promise(resolve=>setImmediate(resolve));};
  return {
    flush,control:id=>controls.get('duel-'+id),
    async click(id) { await listeners.get('duel-'+id+' click')(); await flush(); },
    async tick(ms) {
      const task = [...timers].find(([,timer])=>timer.ms === ms);
      assert.ok(task,'Expected the '+ms+' ms refresh timer');
      timers.delete(task[0]); await task[1].handler(); await flush();
    },
    reversePets() { pets.reverse(); windowListeners.get('pawtopia-save-changed')(); },
    paints:()=>paints
  };
}

test('the Arena detects a forfeit before either player moves and restores the result on reload',async t=>{
  const call = await setup(t);
  await call('a','/arena-ranked/queue',pet('Bengal'));
  const ready = await call('b','/arena-ranked/queue',pet('Bengal'));
  const page = browserArena(call,'a');
  await page.flush();
  assert.match(page.control('phase').textContent,/Round 1/);
  const before = page.paints();
  await page.tick(25000);
  assert.equal(page.paints(),before,'An unchanged poll must not redraw the fighters');
  await call('b','/arena-duel/leave',{code:ready.body.duel.code,ranked:true});
  await page.tick(25000);
  assert.match(page.control('phase').textContent,/You won.*opponent forfeited/);
  assert.match(page.control('rank-score').textContent,/Rating 1020/);
  const reopened = browserArena(call,'a');
  await reopened.flush();
  assert.match(reopened.control('phase').textContent,/You won/);
});

test('a rearranged cottage keeps the same cat selected for matchmaking',async t=>{
  const call = await setup(t);
  await call('b','/arena-ranked/queue',pet('Bengal'));
  const page = browserArena(call,'a');
  await page.flush();
  page.control('pet').value = '1';
  page.reversePets();
  assert.equal(page.control('pet').value,'0');
  await page.click('rank-start');
  const result = (await call('a','/arena-ranked')).body.duel;
  assert.equal(result.fighters[result.side].name,'Second cat');
});

const secret = 'f'.repeat(64);
const newSecret = 'e'.repeat(64);
test('upgrading keeps the existing player, retires its key and allows username sign-in',async t=>{
  const call = await setup(t);
  assert.equal((await call('a','/session')).body.alias,'Paw-a');
  await call('a','/arena-ranked/queue',pet('Bengal'));
  const upgraded = await call('a','/auth/upgrade',{username:'Mochi_12',proof:secret});
  assert.equal(upgraded.status,201);
  assert.match(upgraded.body.recovery,/^[a-f0-9]{64}$/);
  assert.equal((await call('a','/session')).status,401);
  const signedIn = await call(null,'/auth/login',{username:'MOCHI_12',proof:secret});
  assert.equal(signedIn.status,200);
  assert.deepEqual((await call(signedIn.body.key,'/session')).body,{alias:'mochi_12',username:'mochi_12',legacy:false});
  assert.equal((await call(signedIn.body.key,'/arena-ranked')).body.queued,true);
  const duel = await call(signedIn.body.key,root+'/create',pet('Bengal'));
  assert.equal(duel.body.fighters[0].alias,'mochi_12');
  assert.equal((await call(signedIn.body.key,'/auth/logout',{})).status,200);
  assert.equal((await call(signedIn.body.key,'/session')).status,401);
});
test('signup requires Turnstile and duplicate usernames cannot create another player',async t=>{
  const call = await setup(t);
  t.mock.method(globalThis,'fetch',async()=>Response.json({success:true,hostname:'joshehrler1-maker.github.io'}));
  assert.equal((await call(null,'/auth/signup',{username:'shadow',proof:secret})).status,400);
  const once = await call(null,'/auth/signup',{username:'Shadow',proof:secret,challenge:'widget-token'});
  assert.equal(once.status,201);
  assert.equal((await call(null,'/auth/signup',{username:'shadow',proof:newSecret,challenge:'widget-token'})).status,409);
  assert.equal((await call(once.body.key,'/session')).body.username,'shadow');
});
test('password recovery is single-use, rotates the code and revokes every old session',async t=>{
  const call = await setup(t);
  const first = await call('a','/auth/upgrade',{username:'whiskers',proof:secret});
  const another = await call(null,'/auth/login',{username:'whiskers',proof:secret});
  const input = {username:'whiskers',proof:newSecret,recovery:first.body.recovery};
  const attempts = await Promise.all([call(null,'/auth/recover',input),call(null,'/auth/recover',input)]);
  assert.deepEqual(attempts.map(result=>result.status).sort(),[200,401]);
  const recovered = attempts.find(result=>result.status===200).body;
  assert.notEqual(recovered.recovery,first.body.recovery);
  assert.equal((await call(first.body.key,'/session')).status,401);
  assert.equal((await call(another.body.key,'/session')).status,401);
  assert.equal((await call(recovered.key,'/session')).body.username,'whiskers');
  assert.equal((await call(null,'/auth/login',{username:'whiskers',proof:secret})).status,401);
  assert.equal((await call(null,'/auth/login',{username:'whiskers',proof:newSecret})).status,200);
});
test('repeated login failures are throttled and unknown usernames get the same login error',async t=>{
  const call = await setup(t);
  await call('a','/auth/upgrade',{username:'kitty',proof:secret});
  const unknown = await call(null,'/auth/login',{username:'unknown',proof:newSecret});
  for(let i=0;i<8;i++) {
    const denied = await call(null,'/auth/login',{username:'kitty',proof:newSecret});
    assert.deepEqual(denied,unknown);
  }
  assert.equal((await call(null,'/auth/login',{username:'kitty',proof:secret})).status,429);
});

test('town profile, listings and opted-in leaderboard use the public username',async t=>{
  const call = await setup(t);
  const upgraded = await call('a','/auth/upgrade',{username:'mochi',proof:secret});
  const key = upgraded.body.key;
  const town = (await call(key,'/town')).body;
  assert.equal(town.player.alias,'mochi');
  assert.equal((await call(key,'/puzzle',{answer:town.puzzle.first+town.puzzle.second})).status,200);
  const pin = (await call(key,'/town')).body.mine[0];
  assert.equal((await call(key,'/listing',{item:pin.id,price:2,wanted:null})).status,200);
  const before = (await call('b','/town')).body;
  assert.equal(before.market[0].alias,'mochi');
  assert.deepEqual(before.board,[]);
  assert.equal((await call(key,'/profile',{public:true,club:null})).status,200);
  assert.equal((await call('b','/town')).body.board[0].alias,'mochi');
});
