// Fetch only official publicly embeddable GameMonetize 3D-category metadata.
// No downloads of games; no paid services; no accounts created.
const feed = 'https://rss.gamemonetize.com/rssfeed.php?format=json&amount=All&category=3&type=html5';
const r = await fetch(feed, {headers:{Accept:'application/json'},signal:AbortSignal.timeout(30000)});
if(!r.ok)throw Error('Official 3D feed: HTTP '+r.status);
const items=await r.json();
if(!Array.isArray(items))throw Error('Unexpected 3D feed response');
const banned = /\b(?:adult|porn|nude|sex|casino|slots?|gambl(?:e|ing)|poker|betting|alcohol|beer|wine|vape|smok(?:e|ing)|drugs?|cocaine|marijuana|sniper|rifle|guns?|weapons?|shoot(?:er|ing)?|kill(?:er|ing)?|blood|gore|zombie|war(?:fare)?|army|soldier|terror(?:ist)?|massacre|murder|horror|scary|creepy|haunted|prison|assassin|torture|death|revenge|criminal|mafia|thief|heist|police|robbery|squid game|grand theft|gta|roblox|minecraft|pokemon|marvel|disney|spiderman|super mario|fnaf|barbie|sonic|batman|spiderman|peppa pig|skibidi|sahur|brainrot|ragdoll dismount|ninja fighting)\b/i;
const safeHost = /^https:\/\/html5\.gamemonetize\.(?:co|com)\/[a-z0-9-]{8,}\/?(?:\?.*)?$/;
const seen=new Set(),good=[];
const counts={all:items.length,unsafe:0,invalid:0,duplicate:0};
for(const v of items){
 const title=String(v.title||'').trim().slice(0,90);
 const description=String(v.description||'').replace(/<[^>]*>/g,' ').replace(/&[a-z]+;/gi,' ').trim();
 const url=String(v.url||'').trim();
 const id=String(v.id||'').trim();
 if(!title||!url||!safeHost.test(url)||!/^\d{1,10}$/.test(id)){counts.invalid++;continue;}
 if(banned.test(title+' '+description.slice(0,500))){counts.unsafe++;continue;}
 if(seen.has(id)){counts.duplicate++;continue;}
 seen.add(id);
 const rawCategory=String(v.category||'3D').slice(0,120);
 const game={
  id, title, url:url.split('?')[0],
  category:rawCategory,description:description.slice(0,145),
  instructions:String(v.instructions||'').replace(/<[^>]*>/g,' ').slice(0,190),
  publisher:'GameMonetize',
  mobile:/mobile|touch|tap|swipe/i.test(String(v.type||'')+' '+String(v.instructions||'')),
  threeDClassification:'Publisher 3D category'
 };
 good.push(game);
}
const uniqueHosts=[...new Set(good.map(g=>new URL(g.url).hostname))];
console.log('3D_COLLECT_SUMMARY '+JSON.stringify({feed,counts,clean:good.length,uniqueHosts,cors:r.headers.get('access-control-allow-origin'),samples:good.slice(0,8).map(x=>x.title)}));
for(let i=0;i<good.length;i+=15){
 console.log('3D_COLLECT_ROWS '+JSON.stringify(good.slice(i,i+15)));
}