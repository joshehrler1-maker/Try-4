
const clubs = ['Scouts', 'Builders', 'Guardians'];
const kinds = ['Lantern pin', 'Glowbell pin', 'Sunbeam pin', 'Crystal pin'];
const tokenFormat = /^[0-9a-f]{64}$/;
const uuidFormat = /^[0-9a-f-]{36}$/;
const randomToken = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2,'0')).join('');
async function hash(text) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))),
    b => b.toString(16).padStart(2,'0')).join('');
}
function fail(message, status = 400) {
  throw Object.assign(new Error(message), {status});
}
async function body(request, limit = 262144) {
  const reader = request.body?.getReader();
  if (!reader) fail('Missing request data.');
  const decoder = new TextDecoder();
  let size = 0, data = '';
  for (;;) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      fail(limit === 262144 ? 'Save exceeds the online size limit. Your local copy is still available.' : 'Arena request is too large.', 413);
    }
    data += decoder.decode(value, {stream:true});
  }
  try {
    const value = JSON.parse(data + decoder.decode());
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch {}
  fail('Invalid request data.');
}

const duelBreeds = new Set(["Maine Coon","Siamese","Bengal","British Shorthair","Ragdoll","Sphynx","Abyssinian","American Bobtail","American Curl","American Shorthair","American Wirehair","Balinese","Birman","Bombay","Burmese","Burmilla","Chartreux","Cornish Rex","Devon Rex","Egyptian Mau","European Shorthair","Exotic Shorthair","Havana Brown","Japanese Bobtail","Khao Manee","Korat","LaPerm","Lykoi","Manx","Nebelung","Norwegian Forest Cat","Ocicat","Oriental Shorthair","Persian","Peterbald","Pixiebob","Ragamuffin","Russian Blue","Savannah","Scottish Fold","Selkirk Rex","Siberian","Singapura","Snowshoe","Somali","Tonkinese","Toyger","Turkish Angora","Turkish Van","York Chocolate","Australian Mist","Cymric","Donskoy","German Rex","Kurilian Bobtail","Sokoke"]);
const duelCode = /^[0-9a-f]{12}$/;
const duelMoves = {swipe:16, guard:0, signature:25, ultimate:34};
const duelDay = 86400000;
const duelUnlocks = {swipe:1, guard:3, signature:6, ultimate:10};
const trainingFields = ['strength','defence','movement','endurance','intelligence'];
const boundedStat = (value, fallback, min, max) =>
  Number.isSafeInteger(value) ? Math.min(max,Math.max(min,value)) : fallback;

function newDuelFighter(alias, input, trained) {
  if (!trained) return {alias,breed:input.breed,hp:100,readyAt:1,ultimateUsed:false};
  const {name,stats:sheet} = input;
  if (typeof name !== 'string' || !name.trim() || name.length > 40 ||
      !sheet || !Number.isSafeInteger(sheet.level) ||
      trainingFields.some(stat=>!Number.isSafeInteger(sheet[stat]))) fail('Choose a cat from your cottage again.');
  const stats = {level:boundedStat(sheet.level,1,1,200)};
  for (const stat of trainingFields) stats[stat] = boundedStat(sheet[stat],2,0,600);
  const maxHp = Math.min(2000,14+stats.endurance*3+stats.level*2);
  return {alias,breed:input.breed,name:name.trim(),stats,maxHp,hp:maxHp,readyAt:1,ultimateUsed:false};
}

function duelDamage(move, source, target, guarding) {
  if (move === 'guard' || move === 'fumble') return 0;
  const {strength,level,intelligence,movement} = source.stats;
  const base = move === 'swipe' ? 3+strength+Math.floor(level/3) :
    move === 'signature' ? 5+strength+intelligence+Math.floor(level/2) :
    10+strength*2+intelligence+level;
  const afterDefence = Math.min(450,Math.max(1,base-Math.floor(target.stats.defence/2)));
  const footwork = Math.min(Math.floor(afterDefence/4),
    Math.max(0,Math.floor((target.stats.movement-movement)/4)));
  const hit = afterDefence-footwork;
  return guarding ? Math.max(0,Math.floor(hit/2)-Math.min(50,2+Math.floor(target.stats.defence/2))) : hit;
}

function duelResponse(row, state, side) {
  const {fighters, choices, round, history, winner, reason} = state;
  const roster = fighters.map(({name,...fighter},i)=>i === side && name ? {...fighter,name} : fighter);
  return {code:row.code, phase:row.phase, side, fighters:roster, round, history,
    ranked:Boolean(state.ranked), bot:Boolean(state.bot),
    winner, reason, submitted:Boolean(choices[side]), opponentSubmitted:Boolean(choices[1-side]),
    movePreview: fighters.length===2 && state.trained && row.phase==='active' ? duelMovePreview(fighters[side],fighters[1-side]) : null,
    expiresAt:row.expires_at};
}
function duelMovePreview(source,target) {
  return {
    attacks: Object.fromEntries(['swipe','signature','ultimate'].map(move=>[move,{
      damage:duelDamage(move,source,target,false),
      guarded:duelDamage(move,source,target,true)
    }])),
    guardBlock:Math.min(50,2+Math.floor(source.stats.defence/2))
  };
}

function validDuelMove(fighter, move, round) {
  return typeof move === 'string' && Object.hasOwn(duelMoves,move) &&
    (!fighter.stats || fighter.stats.level >= duelUnlocks[move]) &&
    (move !== 'signature' || round >= fighter.readyAt) &&
    (move !== 'ultimate' || (round >= 4 && !fighter.ultimateUsed));
}
function resolveDuelRound(state) {
  const {fighters, choices, round} = state;
  const damage = choices.map((move,i) => {
    const guarding = choices[1-i] === 'guard';
    return state.trained ? duelDamage(move,fighters[i],fighters[1-i],guarding) :
      guarding ? Math.floor(duelMoves[move]/2) : duelMoves[move];
  });
  const hpBefore = fighters.map(fighter => fighter.hp);
  fighters.forEach((fighter,i) => {
    fighter.hp = Math.max(0,fighter.hp-damage[1-i]);
    if (choices[i] === 'signature') fighter.readyAt = round+3;
    if (choices[i] === 'ultimate') fighter.ultimateUsed = true;
  });
  state.history.push({round, moves:choices, damage, hpBefore, hpAfter:fighters.map(fighter=>fighter.hp)});
  state.choices = [null,null];
  state.round += 1;
  const [a,b] = fighters.map(fighter=>fighter.hp);
  if (!a || !b || round >= 15) {
    const first = a*(fighters[1].maxHp || 100);
    const second = b*(fighters[0].maxHp || 100);
    state.winner = first === second ? null : first > second ? 0 : 1;
    state.reason = !a || !b ? 'knockout' : 'round-limit';
  }
}

const rankedWait = 12000;
const rankedPresence = 35000;
const rankedWidening = 5000;
const powerFromStats = stats => stats.level*5 + trainingFields.reduce((sum,stat)=>sum+stats[stat],0);
// Use the queued snapshot on both sides so a matching window never changes a cat's battle stats.
const queuedPower = ['level',...trainingFields]
  .map(field=>"json_extract(fighter,'$.stats."+field+"')"+(field==='level'?'*5':'')).join('+');
const eligibleRivals = `WITH candidates AS (
  SELECT player_id,fighter,queued_at,rating,(${queuedPower}) AS power,
    MIN(2,CAST(MIN(?, ?-queued_at)/${rankedWidening} AS INTEGER)) AS widening
  FROM arena_ranked_player
  WHERE player_id<>? AND queued_at IS NOT NULL AND seen_at>? AND match_code IS NULL
  ORDER BY seen_at DESC LIMIT 64
), eligible AS (
  SELECT * FROM candidates WHERE ABS(rating-?)<=125*(1+widening)
    AND ABS(power-?)<=MAX(20,MIN(power,?)/4)*(1+widening)
)`;

function rankedBot(fighter) {
  const bot = newDuelFighter('Arena Bot',{breed:fighter.breed,name:'Arena Bot',stats:fighter.stats},true);
  // An opening signature cannot end the match before the bot's second mistake.
  const opening = 5+fighter.stats.strength+fighter.stats.intelligence+Math.floor(fighter.stats.level/2);
  bot.maxHp = Math.max(bot.maxHp,Math.min(451,opening+1));
  bot.hp = bot.maxHp;
  return bot;
}
function rankedBotMove(state) {
  if (state.round <= 2) return 'fumble';
  return ['ultimate','signature','swipe'].find(move=>validDuelMove(state.fighters[1],move,state.round));
}
async function rankedView(player, db, now) {
  const slot = await db('SELECT * FROM arena_ranked_player WHERE player_id=?',player.id).first();
  const match = slot?.match_code ? await db('SELECT * FROM arena_ranked_match WHERE code=? AND expires_at>?',
    slot.match_code,now).first() : null;
  const queued=Boolean(slot?.queued_at && slot.seen_at > now-rankedPresence);
  return {rating:slot?.rating ?? 1000,wins:slot?.wins ?? 0,losses:slot?.losses ?? 0,draws:slot?.draws ?? 0,
    queued, widened:queued && now-slot.queued_at>=rankedWidening,
    duel:match ? duelResponse(match,JSON.parse(match.state),match.host_id === player.id ? 0 : 1) : null};
}
async function handleRanked(route, request, player, db, json) {
  const now = Date.now(), fresh = now-rankedPresence;
  if (route === 'POST /arena-ranked/queue') {
    const input = await body(request,4096);
    if (!duelBreeds.has(input.breed)) fail('Choose an adopted cat from your cottage.');
    const fighter = JSON.stringify(newDuelFighter(player.alias,input,true));
    await db(`INSERT INTO arena_ranked_player(player_id,queued_at,seen_at,fighter) VALUES(?,?,?,?)
      ON CONFLICT(player_id) DO UPDATE SET queued_at=excluded.queued_at,seen_at=excluded.seen_at,
      fighter=excluded.fighter,match_code=NULL
      WHERE (arena_ranked_player.queued_at IS NULL OR arena_ranked_player.seen_at<=?)
      AND NOT EXISTS(SELECT 1 FROM arena_ranked_match WHERE code=arena_ranked_player.match_code
        AND phase='active' AND expires_at>?)`,player.id,now,now,fighter,fresh,now).run();
  } else if (route === 'POST /arena-ranked/cancel') {
    await db('UPDATE arena_ranked_player SET queued_at=NULL,seen_at=NULL,fighter=NULL WHERE player_id=? AND match_code IS NULL',player.id).run();
    return json(await rankedView(player,db,now));
  } else if (route === 'POST /arena-ranked/poll') {
    await db('UPDATE arena_ranked_player SET seen_at=? WHERE player_id=? AND queued_at IS NOT NULL AND seen_at>? AND match_code IS NULL',
      now,player.id,fresh).run();
  } else if (route === 'GET /arena-ranked') return json(await rankedView(player,db,now));
  else fail('Unknown ranked arena action.',404);

  const own = await db('SELECT * FROM arena_ranked_player WHERE player_id=? AND queued_at IS NOT NULL AND seen_at>? AND match_code IS NULL',
    player.id,fresh).first();
  if (!own) return json(await rankedView(player,db,now));
  const first = JSON.parse(own.fighter);
  const power = powerFromStats(first.stats);
  const rivalArgs = [now-own.queued_at,now,player.id,fresh,own.rating,power,power];
  const rival = await db(`${eligibleRivals} SELECT * FROM eligible ORDER BY RANDOM() LIMIT 1`,...rivalArgs).first();
  if (!rival && now-own.queued_at < rankedWait) return json(await rankedView(player,db,now));
  const state = {ranked:true,bot:!rival,trained:true,
    fighters:[first,rival ? JSON.parse(rival.fighter) : rankedBot(first)],
    choices:[null,null],round:1,history:[],winner:null,reason:null};
  const code = randomToken().slice(0,12), expiresAt = now+duelDay;
  const ownStillQueued = 'host.player_id=? AND host.queued_at=? AND host.seen_at>? AND host.match_code IS NULL';
  if (rival) {
    await db(`INSERT INTO arena_ranked_match(code,host_id,guest_id,state,phase,expires_at)
      SELECT ?,host.player_id,guest.player_id,?,'active',?
      FROM arena_ranked_player host JOIN arena_ranked_player guest ON guest.player_id=?
      WHERE ${ownStillQueued} AND guest.queued_at=? AND guest.seen_at>? AND guest.match_code IS NULL`,
      code,JSON.stringify(state),expiresAt,rival.player_id,player.id,own.queued_at,fresh,rival.queued_at,fresh).run();
  } else {
    // Recheck availability in the same write. The assignment trigger claims both seats atomically.
    await db(`${eligibleRivals} INSERT INTO arena_ranked_match(code,host_id,state,phase,expires_at)
      SELECT ?,host.player_id,?,'active',? FROM arena_ranked_player host WHERE ${ownStillQueued}
      AND NOT EXISTS(SELECT 1 FROM eligible)`,
      ...rivalArgs,code,JSON.stringify(state),expiresAt,player.id,own.queued_at,fresh).run();
  }
  return json(await rankedView(player,db,now));
}

async function handleDuel(route, request, player, db, json) {
  const now = Date.now();
  if (route === 'GET /arena-duel/status') {
    await db('SELECT code FROM arena_duel LIMIT 1').first();
    return json({enabled:true,trainedPets:true,ranked:true});
  }
  const creating = route === 'POST /arena-duel/create';
  const input = request.method === 'POST' ? await body(request,4096) : null;
  if (creating || route === 'POST /arena-duel/join') {
    if (!duelBreeds.has(input.breed)) fail('Choose an adopted cat from your cottage.');
  }
  if (creating) {
    const code = randomToken().slice(0,12);
    const state = {trained:true,fighters:[newDuelFighter(player.alias,input,true)],choices:[null,null],
      round:1,history:[],winner:null,reason:null};
    const result = await db(`INSERT INTO arena_duel(code,host_id,state,phase,expires_at)
      VALUES(?,?,?,'waiting',?)
      ON CONFLICT(host_id) DO UPDATE SET code=excluded.code, guest_id=NULL,
      state=excluded.state, phase='waiting', revision=0, expires_at=excluded.expires_at
      WHERE arena_duel.phase='finished' OR arena_duel.expires_at <= ?`,
      code,player.id,JSON.stringify(state),now+duelDay,now).run();
    if (!result.meta.changes) fail('Finish or leave your existing hosted duel first.',409);
    return json(duelResponse({code,phase:'waiting',expires_at:now+duelDay},state,0),201);
  }
  if (route === 'GET /arena-duel/hosted') {
    const existing = await db('SELECT code, state, phase, expires_at FROM arena_duel WHERE host_id=? AND expires_at>?',player.id,now).first();
    return json({duel:existing ? duelResponse(existing,JSON.parse(existing.state),0) : null});
  }
  const code = input?.code ?? new URL(request.url).searchParams.get('code');
  if (typeof code !== 'string' || !duelCode.test(code)) fail('Enter a valid 12-character duel code.');
  const ranked = input?.ranked === true || new URL(request.url).searchParams.get('ranked') === '1';
  if (ranked && route === 'POST /arena-duel/join') fail('Join ranked battles from the queue.');
  const table = ranked ? 'arena_ranked_match' : 'arena_duel';
  const row = await db(`SELECT * FROM ${table} WHERE code=? AND expires_at>?`,code,now).first();
  if (!row) fail('Duel not found or expired.',404);
  const state = JSON.parse(row.state);
  const side = row.host_id === player.id ? 0 : row.guest_id === player.id ? 1 : -1;
  if (route === 'POST /arena-duel/join') {
    if (side === 0) fail('Share this code with another Pawtopia player.');
    if (side === 1) return json(duelResponse(row,state,1));
    if (row.phase !== 'waiting') fail('This duel has already started.',409);
    state.fighters.push(newDuelFighter(player.alias,input,state.trained));
    const expiresAt = now+7*duelDay;
    const result = await db(`UPDATE arena_duel SET guest_id=?, state=?, phase='active',
      revision=revision+1, expires_at=? WHERE code=? AND phase='waiting' AND revision=?`,
      player.id,JSON.stringify(state),expiresAt,code,row.revision).run();
    if (!result.meta.changes) fail('This duel has already started.',409);
    return json(duelResponse({...row,phase:'active',expires_at:expiresAt},state,1));
  }
  if (side < 0) fail('Duel not found or expired.',404);
  if (route === 'GET /arena-duel') return json(duelResponse(row,state,side));
  if (route !== 'POST /arena-duel/move' && route !== 'POST /arena-duel/leave') fail('Unknown arena action.',404);
  if (row.phase === 'finished') return json(duelResponse(row,state,side));
  if (route === 'POST /arena-duel/leave') {
    state.winner = row.phase === 'active' ? 1-side : null;
    state.reason = row.phase === 'active' ? 'forfeit' : 'cancelled';
  } else {
    if (row.phase !== 'active') fail('Wait for another player to join.');
    if (input.round !== state.round || state.choices[side]) return json(duelResponse(row,state,side));
    if (!validDuelMove(state.fighters[side],input.move,state.round)) fail('That move is unavailable this round.');
    state.choices[side] = input.move;
    if (state.bot) state.choices[1] = rankedBotMove(state);
    if (state.choices.every(Boolean)) resolveDuelRound(state);
  }
  const phase = state.reason ? 'finished' : row.phase;
  const result = await db(`UPDATE ${table} SET state=?, phase=?, revision=revision+1 WHERE code=? AND revision=?`,
    JSON.stringify(state),phase,code,row.revision).run();
  if (!result.meta.changes) fail('The duel updated. Try your action again.',409);
  return json(duelResponse({...row,phase},state,side));
}


const authName = /^[a-z][a-z0-9_]{2,23}$/;
const sessionDuration = 30*86400000;
const authWindow = 15*60000;
const normalizedUsername = value => typeof value === 'string' ? value.trim().toLowerCase() : '';

function validLoginInput(input) {
  const username = normalizedUsername(input.username);
  if (!authName.test(username)) fail('Use 3–24 letters, numbers, or underscores, starting with a letter.');
  if (!tokenFormat.test(input.proof || '') || typeof input.proof !== 'string') fail('A password is required.');
  return username;
}
const proofHash = proof => hash('Pawtopia password proof v1:'+proof);
const recoveryHash = code => hash('Pawtopia recovery v1:'+code);
function equalHash(a,b) {
  let difference = 0;
  for (let i=0;i<64;i++) difference |= a.charCodeAt(i)^b.charCodeAt(i);
  return difference === 0;
}
async function limitAuth(db,bucket,limit,now) {
  const result = await db(`INSERT INTO player_auth_attempt(bucket,expires_at,hits) VALUES(?,?,1)
    ON CONFLICT(bucket) DO UPDATE SET
      hits=CASE WHEN player_auth_attempt.expires_at<=? THEN 1 ELSE player_auth_attempt.hits+1 END,
      expires_at=CASE WHEN player_auth_attempt.expires_at<=? THEN excluded.expires_at ELSE player_auth_attempt.expires_at END
    WHERE player_auth_attempt.expires_at<=? OR player_auth_attempt.hits<?
    RETURNING hits`,bucket,now+authWindow,now,now,now,limit).first();
  if (!result) fail('Too many attempts. Try again in 15 minutes.',429);
}
async function signupCheck(input, env, origin) {
  if (!env.TURNSTILE_SECRET || typeof input.challenge !== 'string' || !input.challenge || input.challenge.length > 2048)
    fail('Complete the signup check.');
  const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
    method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:input.challenge})
  });
  const result = await verify.json();
  if (!result.success || result.hostname !== new URL(origin).hostname) fail('Complete the signup check again.');
}
async function issuePasswordSession(db,playerId,generation,now) {
  const key = randomToken();
  const insert = db(`INSERT INTO player_session(token_hash,player_id,expires_at)
    SELECT ?,player_id,? FROM player_login WHERE player_id=? AND recovery_hash=?`,
    await hash(key),now+sessionDuration,playerId,generation);
  return {key,insert};
}
async function accountAuth(route,request,origin,env,db,json,player) {
  const now = Date.now();
  if (route === 'GET /auth/status') return json({passwords:true});
  const input = await body(request,4096);
  const username = validLoginInput(input);
  const source = request.headers.get('CF-Connecting-IP') || 'unavailable';
  const scope = route === 'POST /auth/login' ? 'login' : 'manage';
  await limitAuth(db,scope+':source:'+await hash(source),scope === 'login' ? 35 : 20,now);
  await db('DELETE FROM player_auth_attempt WHERE bucket IN (SELECT bucket FROM player_auth_attempt WHERE expires_at<=? LIMIT 8)',now).run();
  const digest = await proofHash(input.proof);

  if (route === 'POST /auth/signup' || route === 'POST /auth/upgrade') {
    const signup = route === 'POST /auth/signup';
    if (signup) await signupCheck(input,env,origin);
    else if (!player || player.username) fail('Sign in with your existing account key to set up a username.',409);
    const id = signup ? crypto.randomUUID() : player.id;
    const recovery = randomToken(), generation = await recoveryHash(recovery);
    const session = await issuePasswordSession(db,id,generation,now);
    const operations = [];
    if (signup) operations.push(db(`INSERT INTO player(id,token_hash,alias)
      SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM player_login WHERE username=?)`,
      id,await hash(randomToken()),'Paw-'+id.replaceAll('-','').slice(0,12),username));
    operations.push(db(`INSERT OR IGNORE INTO player_login(player_id,username,proof_hash,recovery_hash)
      SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM player WHERE id=?)`,id,username,digest,generation,id));
    if (!signup) operations.push(db(`UPDATE player SET token_hash=? WHERE id=? AND EXISTS(
      SELECT 1 FROM player_login WHERE player_id=? AND recovery_hash=?)`,await hash(randomToken()),id,id,generation));
    operations.push(session.insert);
    const results = await env.DB.batch(operations);
    if (!results.at(-1).meta.changes) fail('That username is unavailable or the account is already upgraded.',409);
    return json({key:session.key,recovery},201);
  }

  const row = await db('SELECT player_id,proof_hash,recovery_hash FROM player_login WHERE username=?',username).first();
  await limitAuth(db,scope+':username:'+await hash(username),scope === 'login' ? 8 : 5,now);
  if (route === 'POST /auth/login') {
    if (!equalHash(digest,row?.proof_hash ?? '0'.repeat(64)) || !row) fail('Username or password is incorrect.',401);
    const session = await issuePasswordSession(db,row.player_id,row.recovery_hash,now);
    const result = await session.insert.run();
    if (!result.meta.changes) fail('Sign-in changed. Try again.',409);
    await db('DELETE FROM player_session WHERE token_hash IN (SELECT token_hash FROM player_session WHERE expires_at<=? LIMIT 8)',now).run();
    return json({key:session.key});
  }
  if (route !== 'POST /auth/recover') fail('Unknown account action.',404);
  const submitted = typeof input.recovery === 'string' && tokenFormat.test(input.recovery) ? input.recovery : '';
  const recovered = await recoveryHash(submitted);
  if (!equalHash(recovered,row?.recovery_hash ?? '0'.repeat(64)) || !row || !submitted)
    fail('Username or recovery code is incorrect.',401);
  const recovery = randomToken(), generation = await recoveryHash(recovery);
  const session = await issuePasswordSession(db,row.player_id,generation,now);
  const results = await env.DB.batch([
    db('UPDATE player_login SET proof_hash=?, recovery_hash=? WHERE player_id=? AND recovery_hash=?',
      digest,generation,row.player_id,recovered),
    db(`DELETE FROM player_session WHERE player_id=? AND EXISTS(
      SELECT 1 FROM player_login WHERE player_id=? AND recovery_hash=?)`,row.player_id,row.player_id,generation),
    session.insert
  ]);
  if (!results[0].meta.changes) fail('Username or recovery code is incorrect.',401);
  return json({key:session.key,recovery});
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin');
    const headers = {'Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
    if (origin !== env.PAWTOPIA_ORIGIN) return new Response(null, {status:403});
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type';
    if (request.method === 'OPTIONS') return new Response(null, {status:204,headers});
    const json = (value,status=200) => Response.json(value,{status,headers});
    const db = (sql,...args) => env.DB.prepare(sql).bind(...args);
    const route = request.method + ' ' + new URL(request.url).pathname;
    try {
      if (['GET /auth/status','POST /auth/signup','POST /auth/login','POST /auth/recover'].includes(route))
        return await accountAuth(route,request,origin,env,db,json);
      if (route === 'POST /accounts') fail('Refresh Pawtopia Players to create a username and password.',409);
      const key = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1] || '';
      if (!tokenFormat.test(key)) fail('Sign in to your Pawtopia account.',401);
      const fingerprint = await hash(key);
      const player = await db(`SELECT id,alias,public,club,tickets,username FROM (
        SELECT p.id,l.username AS alias,p.public,p.club,p.tickets,l.username FROM player_session s
        JOIN player p ON p.id=s.player_id JOIN player_login l ON l.player_id=p.id
        WHERE s.token_hash=? AND s.expires_at>?
        UNION ALL SELECT p.id,p.alias,p.public,p.club,p.tickets,NULL FROM player p
        WHERE p.token_hash=? AND NOT EXISTS(SELECT 1 FROM player_login WHERE player_id=p.id)
      ) LIMIT 1`,fingerprint,Date.now(),fingerprint).first();
      if (!player) fail('Sign-in expired or was not recognized. Sign in again.',401);
      if (route === 'POST /auth/upgrade') return await accountAuth(route,request,origin,env,db,json,player);
      if (route === 'POST /auth/logout') {
        await db('DELETE FROM player_session WHERE token_hash=? AND player_id=?',fingerprint,player.id).run();
        return json({signedOut:true});
      }
      if (new URL(request.url).pathname.startsWith('/arena-ranked')) return await handleRanked(route,request,player,db,json);
      if (new URL(request.url).pathname.startsWith('/arena-duel')) return await handleDuel(route,request,player,db,json);
      if (route === 'GET /session') return json({alias:player.alias,username:player.username,legacy:!player.username});
      if ((route === 'GET /save' || route === 'PUT /save') && env.PAWTOPIA_CLOUD_SAVES !== 'enabled') {
        fail('Online save sync is disabled.', 404);
      }
      const id = player.id;
      const day = new Date().toISOString().slice(0,10), month = day.slice(0,7);
      if (route === 'POST /adoptions') {
        const {nickname,breed,remove} = await body(request);
        if (typeof remove === 'string' && uuidFormat.test(remove)) {
          await db('DELETE FROM shared_pet WHERE id=? AND player_id=?',remove,id).run();
          return json({message:'Pet removed from the private log.'});
        }
        const name = typeof nickname === 'string' ? nickname.trim().normalize('NFC') : '';
        const petBreed = typeof breed === 'string' ? breed.trim().normalize('NFC') : '';
        const safeLabel = /^[\p{L}\p{M}][\p{L}\p{M} ’'.-]*$/u;
        if (!name || name.length>24 || !safeLabel.test(name) ||
            !petBreed || petBreed.length>40 || !safeLabel.test(petBreed)) {
          fail('Use a pet nickname made of letters and spaces, with optional apostrophes or hyphens.');
        }
        const result = await db(`INSERT OR IGNORE INTO shared_pet(id,player_id,nickname,breed)
          SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM shared_pet WHERE player_id=?)<6`,
          crypto.randomUUID(),id,name,petBreed,id).run();
        if (!result.meta.changes) fail('This pet is already shared, or the six-pet limit was reached.',409);
        return json({message:'Pet nickname shared privately with the game owner.'},201);
      }
      if (route === 'GET /save') {
        const save = await db('SELECT revision,payload FROM save WHERE player_id=?',id).first();
        return json(save || {revision:0,payload:null});
      }
      if (route === 'PUT /save') {
        const {revision,payload} = await body(request);
        if (!Number.isSafeInteger(revision) || revision < 0 || typeof payload !== 'string') fail('Invalid save.');
        let parsed;
        try { parsed = JSON.parse(payload); } catch { fail('Invalid save.'); }
        if (parsed?.format !== 'pawtopia-progress-backup' || parsed.version !== 1 ||
            !parsed.progress || typeof parsed.progress !== 'object' || Array.isArray(parsed.progress)) fail('Invalid save.');
        const result = revision === 0
          ? await db('INSERT OR IGNORE INTO save(player_id,revision,payload) VALUES(?,1,?)',id,payload).run()
          : await db('UPDATE save SET revision=revision+1,payload=? WHERE player_id=? AND revision=?',payload,id,revision).run();
        return result.meta.changes ? json({revision:revision + 1}) : json({error:'Another device changed this save.'},409);
      }
      if (route === 'POST /profile') {
        const data = await body(request);
        if (typeof data.public !== 'boolean' || (data.club !== null && !clubs.includes(data.club))) fail('Choose a listed club.');
        await db('UPDATE player SET public=?,club=? WHERE id=?',Number(data.public),data.club,id).run();
        return json({ok:true});
      }
      const seed = await hash(day + ':' + id);
      const first = parseInt(seed.slice(0,2),16) % 19 + 2;
      const second = parseInt(seed.slice(2,4),16) % 17 + 3;
      if (route === 'GET /town') {
        const [mine,market,board,members,today,adoptions,gifts] = await Promise.all([
          db('SELECT i.id,i.kind,l.price,l.wanted,l.id AS listing FROM item i LEFT JOIN listing l ON l.id=i.id WHERE i.owner=? ORDER BY i.id LIMIT 300',id).all(),
          db('SELECT l.id,COALESCE(a.username,p.alias) AS alias,i.kind,l.price,l.wanted,l.seller=? AS mine FROM listing l JOIN item i ON i.id=l.id JOIN player p ON p.id=l.seller LEFT JOIN player_login a ON a.player_id=p.id ORDER BY l.id LIMIT 100',id).all(),
          db('SELECT COALESCE(a.username,p.alias) AS alias,p.club,COUNT(*) AS score FROM solved s JOIN player p ON p.id=s.player_id LEFT JOIN player_login a ON a.player_id=p.id WHERE s.month=? AND p.public=1 GROUP BY p.id ORDER BY score DESC,alias LIMIT 25',month).all(),
          db('SELECT club,COUNT(*) AS count FROM player WHERE public=1 AND club IS NOT NULL GROUP BY club').all(),
          db('SELECT kind FROM solved WHERE player_id=? AND day=?',id,day).first(),
          db('SELECT id,nickname,breed FROM shared_pet WHERE player_id=? ORDER BY shared_at,id',id).all(),
          db('SELECT pin,tickets,sent_at FROM owner_gift WHERE player_id=? ORDER BY sent_at DESC,id DESC LIMIT 30',id).all()
        ]);
        delete player.id;
        return json({player,mine:mine.results,market:market.results,board:board.results,clubs:members.results,
          adoptions:adoptions.results,gifts:gifts.results,puzzle:{first,second,earned:today?.kind || null}});
      }
      if (route === 'POST /puzzle') {
        const {answer} = await body(request);
        if (answer !== first + second) fail('Try adding the two numbers again.');
        const kind = kinds[parseInt(seed.slice(4,6),16) % kinds.length];
        const result = await db('INSERT OR IGNORE INTO solved(player_id,day,month,prize,kind) VALUES(?,?,?,?,?)',
          id,day,month,crypto.randomUUID(),kind).run();
        if (!result.meta.changes) fail('You already solved today’s puzzle.');
        return json({message:'Earned a ' + kind + ' and 2 market tickets.'});
      }
      if (route === 'POST /listing') {
        const {item,price,wanted,remove} = await body(request);
        if (!uuidFormat.test(item || '')) fail('Choose an item.');
        if (remove === true) {
          await db('DELETE FROM listing WHERE id=? AND seller=?',item,id).run();
          return json({message:'Listing removed.'});
        }
        const sale = Number.isInteger(price) && price >= 1 && price <= 20 && wanted === null;
        const trade = price === null && kinds.includes(wanted);
        if (!sale && !trade) fail('Set a price of 1 to 20 tickets or choose a pin to trade for.');
        const result = await db('INSERT OR IGNORE INTO listing(id,seller,price,wanted) SELECT id,owner,?,? FROM item WHERE id=? AND owner=?',
          price,wanted,item,id).run();
        if (!result.meta.changes) fail('This item is already listed or unavailable.');
        return json({message:'Item listed.'});
      }
      if (route === 'POST /exchange') {
        const {listing,offered} = await body(request);
        if (!uuidFormat.test(listing || '') || (offered !== null && !uuidFormat.test(offered || ''))) fail('Choose a listing.');
        try {
          const transaction = crypto.randomUUID();
          await env.DB.batch([
            db('INSERT INTO swap(id,listing_id,buyer,offered) VALUES(?,?,?,?)',transaction,listing,id,offered),
            db('DELETE FROM swap WHERE id=?',transaction)
          ]);
        } catch (error) {
          if (String(error).includes('listing unavailable')) fail('This listing is gone, or you need the requested pin or tickets.',409);
          throw error;
        }
        return json({message:offered ? 'Trade completed.' : 'Purchase completed.'});
      }
      return json({error:'Page unavailable.'},404);
    } catch (error) {
      return json({error:error.status ? error.message : 'Online features are temporarily unavailable.'},error.status || 503);
    }
  }
};
