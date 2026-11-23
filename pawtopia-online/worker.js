
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
const newDuelFighter = (alias, breed) => ({alias, breed, hp:100, readyAt:1, ultimateUsed:false});

function duelResponse(row, state, side) {
  const {fighters, choices, round, history, winner, reason} = state;
  return {code:row.code, phase:row.phase, side, fighters, round, history,
    winner, reason, submitted:Boolean(choices[side]), expiresAt:row.expires_at};
}
function validDuelMove(fighter, move, round) {
  return typeof move === 'string' && Object.hasOwn(duelMoves,move) &&
    (move !== 'signature' || round >= fighter.readyAt) &&
    (move !== 'ultimate' || (round >= 4 && !fighter.ultimateUsed));
}
function resolveDuelRound(state) {
  const {fighters, choices, round} = state;
  const damage = choices.map((move,i) => choices[1-i] === 'guard'
    ? Math.floor(duelMoves[move]/2) : duelMoves[move]);
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
    state.winner = a === b ? null : a > b ? 0 : 1;
    state.reason = !a || !b ? 'knockout' : 'round-limit';
  }
}

async function handleDuel(route, request, player, db, json) {
  const now = Date.now();
  if (route === 'GET /arena-duel/status') {
    await db('SELECT code FROM arena_duel LIMIT 1').first();
    return json({enabled:true});
  }
  const creating = route === 'POST /arena-duel/create';
  const input = request.method === 'POST' ? await body(request,4096) : null;
  if (creating || route === 'POST /arena-duel/join') {
    if (!duelBreeds.has(input.breed)) fail('Choose an adopted cat from your cottage.');
  }
  if (creating) {
    const code = randomToken().slice(0,12);
    const state = {fighters:[newDuelFighter(player.alias,input.breed)],choices:[null,null],
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
  const row = await db('SELECT * FROM arena_duel WHERE code=? AND expires_at>?',code,now).first();
  if (!row) fail('Duel not found or expired.',404);
  const state = JSON.parse(row.state);
  const side = row.host_id === player.id ? 0 : row.guest_id === player.id ? 1 : -1;
  if (route === 'POST /arena-duel/join') {
    if (side === 0) fail('Share this code with another Pawtopia player.');
    if (side === 1) return json(duelResponse(row,state,1));
    if (row.phase !== 'waiting') fail('This duel has already started.',409);
    state.fighters.push(newDuelFighter(player.alias,input.breed));
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
    if (state.choices.every(Boolean)) resolveDuelRound(state);
  }
  const phase = state.reason ? 'finished' : row.phase;
  const result = await db('UPDATE arena_duel SET state=?, phase=?, revision=revision+1 WHERE code=? AND revision=?',
    JSON.stringify(state),phase,code,row.revision).run();
  if (!result.meta.changes) fail('The duel updated. Try your action again.',409);
  return json(duelResponse({...row,phase},state,side));
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
      if (route === 'POST /accounts') {
        const data = await body(request);
        if (!env.TURNSTILE_SECRET || typeof data.challenge !== 'string' || data.challenge.length > 2048)
          fail('Complete the signup check.');
        const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
          method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:data.challenge})
        });
        const result = await verify.json();
        if (!result.success || result.hostname !== new URL(origin).hostname) fail('Complete the signup check again.');
        const id = crypto.randomUUID(), key = randomToken();
        const alias = 'Paw-' + id.replaceAll('-','').slice(0,12);
        await db('INSERT INTO player(id,token_hash,alias) VALUES(?,?,?)',id,await hash(key),alias).run();
        return json({key,alias},201);
      }
      const key = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1] || '';
      if (!tokenFormat.test(key)) fail('Enter your Pawtopia account key.',401);
      const player = await db('SELECT id,alias,public,club,tickets FROM player WHERE token_hash=?',await hash(key)).first();
      if (!player) fail('Account key was not recognized.',401);
      if (new URL(request.url).pathname.startsWith('/arena-duel')) return await handleDuel(route,request,player,db,json);
      if (route === 'GET /session') return json({alias:player.alias});
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
          db('SELECT l.id,p.alias,i.kind,l.price,l.wanted,l.seller=? AS mine FROM listing l JOIN item i ON i.id=l.id JOIN player p ON p.id=l.seller ORDER BY l.id LIMIT 100',id).all(),
          db('SELECT p.alias,p.club,COUNT(*) AS score FROM solved s JOIN player p ON p.id=s.player_id WHERE s.month=? AND p.public=1 GROUP BY p.id ORDER BY score DESC,p.alias LIMIT 25',month).all(),
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
