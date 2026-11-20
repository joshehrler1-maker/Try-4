// One-shot public publisher feed probe. Prints metadata only, never downloads game code.
const feeds=[
  ['GameZipper','https://gamezipper.com/api/games.json','gamezipper.com'],
  ['PlayKovo','https://playkovo.com/api/embed-games?format=json','playkovo.com']
];
for(const [provider,url,host] of feeds){
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(16000),headers:{accept:'application/json'}});
    if(!response.ok)throw Error('HTTP '+response.status);
    const data=await response.json();
    const rows=Array.isArray(data)?data:Array.isArray(data.games)?data.games:[];
    const clean=[];
    for(const entry of rows){
      const slug=String(entry.slug||'').trim();
      const name=String(entry.title||entry.name||entry.gameName||'').trim().slice(0,85);
      if(!/^[a-z0-9-]{2,100}$/.test(slug)||!name)continue;
      const candidate=String(entry.embedUrl||(provider==='GameZipper'?'https://gamezipper.com/'+slug+'/':'https://playkovo.com/embed/'+slug));
      let parsed;
      try{parsed=new URL(candidate);}catch{continue;}
      if(parsed.protocol!=='https:'||parsed.hostname!==host)continue;
      if(provider==='GameZipper'&&!/^\/[a-z0-9-]+\/$/.test(parsed.pathname))continue;
      if(provider==='PlayKovo'&&!/^\/embed\/[a-z0-9-]+\/?$/.test(parsed.pathname))continue;
      const cat=Array.isArray(entry.categories)?entry.categories[0]:entry.category||entry.tags?.[0]||'Other';
      clean.push({publisher:provider,slug,name,category:String(cat||'Other').slice(0,40),orientation:entry.screenOrientation==='portrait'?'portrait':'landscape',url:parsed.toString()});
    }
    console.log('GUEST_FEED_STATUS '+JSON.stringify({provider,totalRows:rows.length,validRows:clean.length,cors:response.headers.get('access-control-allow-origin')||'NOT_SET'}));
    for(let i=0;i<clean.length;i+=25)console.log('GUEST_FEED_ROWS '+JSON.stringify(clean.slice(i,i+25)));
  }catch(error){
    console.log('GUEST_FEED_STATUS '+JSON.stringify({provider,error:String(error)}));
  }
}
