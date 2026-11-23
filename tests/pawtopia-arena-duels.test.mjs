
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import test from 'node:test';

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
  const env = {PAWTOPIA_ORIGIN:origin,DB:{prepare(sql) {
    const statement = sqlite.prepare(sql);
    return {bind(...args) { return {
      async first() { return statement.get(...args) ?? null; },
      async run() { return {meta:statement.run(...args)}; }
    }; }};
  }}};
  return async (player,path,body) => {
    const headers = {Origin:origin};
    if (player) headers.Authorization = 'Bearer '+players.find(entry=>entry.id===player).key;
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
