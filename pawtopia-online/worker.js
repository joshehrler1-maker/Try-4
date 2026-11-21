
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
async function body(request) {
  const reader = request.body?.getReader();
  if (!reader) fail('Missing request data.');
  const decoder = new TextDecoder();
  let size = 0, data = '';
  for (;;) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 262144) {
      await reader.cancel();
      fail('Save exceeds the online size limit. Your local copy is still available.', 413);
    }
    data += decoder.decode(value, {stream:true});
  }
  try {
    const value = JSON.parse(data + decoder.decode());
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch {}
  fail('Invalid request data.');
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
      const id = player.id;
      const day = new Date().toISOString().slice(0,10), month = day.slice(0,7);
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
        const [mine,market,board,members,today] = await Promise.all([
          db('SELECT i.id,i.kind,l.price,l.wanted,l.id AS listing FROM item i LEFT JOIN listing l ON l.id=i.id WHERE i.owner=? ORDER BY i.id LIMIT 300',id).all(),
          db('SELECT l.id,p.alias,i.kind,l.price,l.wanted,l.seller=? AS mine FROM listing l JOIN item i ON i.id=l.id JOIN player p ON p.id=l.seller ORDER BY l.id LIMIT 100',id).all(),
          db('SELECT p.alias,p.club,COUNT(*) AS score FROM solved s JOIN player p ON p.id=s.player_id WHERE s.month=? AND p.public=1 GROUP BY p.id ORDER BY score DESC,p.alias LIMIT 25',month).all(),
          db('SELECT club,COUNT(*) AS count FROM player WHERE public=1 AND club IS NOT NULL GROUP BY club').all(),
          db('SELECT kind FROM solved WHERE player_id=? AND day=?',id,day).first()
        ]);
        delete player.id;
        return json({player,mine:mine.results,market:market.results,board:board.results,clubs:members.results,
          puzzle:{first,second,earned:today?.kind || null}});
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
