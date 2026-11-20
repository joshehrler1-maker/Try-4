const qs = [
  'https://rss.gamemonetize.com/rssfeed.php?format=json&amount=400&category=3&type=html5',
  'https://gamemonetize.com/rssfeed.php?format=json&amount=400&category=3&type=html5',
  'https://gamemonetize.com/feed.php?format=json&category=3&type=html5&num=400',
];
for(const url of qs){
  try {
    const res=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(18000)});
    const t=await res.text();
    let data;
    try{data=JSON.parse(t);}catch{data=null;}
    const arr=Array.isArray(data)?data:Array.isArray(data?.games)?data.games:Array.isArray(data?.items)?data.items:[];
    console.log('3D_FEED_PROBE '+JSON.stringify({url,status:res.status,type:res.headers.get('content-type'),len:t.length,cors:res.headers.get('access-control-allow-origin'),dataType:Array.isArray(data)?'array':typeof data,count:arr.length,keys:typeof data==='object'&&!Array.isArray(data)?Object.keys(data).slice(0,10):[],example:arr[0]?JSON.stringify(arr[0]).slice(0,1000):t.slice(0,280)}));
  } catch(e){console.log('3D_FEED_PROBE '+JSON.stringify({url,error:String(e)}))}
}