import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),Core=require('../core.js');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
/** Optional loopback-only worker. It has no external providers, paid requests or payout endpoints. */
export function createService({directory,token,port=0,tickMs=1200}) {
 if(typeof token!=='string'||!/^[a-f0-9]{64,128}$/.test(token))throw Error('Set a random 64–128 character hexadecimal owner token.');
 if(!directory||!path.isAbsolute(directory))throw Error('Use an absolute private state directory.');
 fs.mkdirSync(directory,{recursive:true,mode:0o700});fs.chmodSync(directory,0o700);
 const file=path.join(directory,'workspace.json'),lock=path.join(directory,'worker.lock');
 // One process owns a workspace. Refuse live locks; reclaim locks from exited workers only.
 if(fs.existsSync(lock)){const pid=Number(fs.readFileSync(lock,'utf8'));let alive=true;try{process.kill(pid,0);}catch(e){if(e.code==='ESRCH')alive=false;}if(alive)throw Error('Workspace already has a worker.');fs.unlinkSync(lock);}
 const fd=fs.openSync(lock,'wx',0o600);fs.writeFileSync(fd,String(process.pid));fs.closeSync(fd);
 let state,timer,server,closed=false;
 const persist=next=>{const text=Core.backup(next),envelope=JSON.stringify({sha256:hash(text),backup:text}),tmp=file+'.tmp';let fd;try{fd=fs.openSync(tmp,'w',0o600);fs.writeFileSync(fd,envelope);fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;fs.renameSync(tmp,file);const dirfd=fs.openSync(directory,'r');try{fs.fsyncSync(dirfd);}finally{fs.closeSync(dirfd);}state=next;}finally{if(fd!==undefined)fs.closeSync(fd);}};
 try{if(fs.existsSync(file)){const raw=JSON.parse(fs.readFileSync(file,'utf8'));if(typeof raw.backup!=='string'||hash(raw.backup)!==raw.sha256)throw Error('Workspace integrity check failed.');state=Core.restore(raw.backup);}else state=Core.initial();persist(state);}catch(e){fs.unlinkSync(lock);throw e;}
 let hits=0,windowStart=Date.now();
 function reply(res,code,data){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'",'Referrer-Policy':'no-referrer'});res.end(JSON.stringify(data));}
 server=http.createServer(async(req,res)=>{
  if(Date.now()-windowStart>60000){hits=0;windowStart=Date.now();}if(++hits>240)return reply(res,429,{error:'Request limit reached.'});
  if(req.headers.origin)return reply(res,403,{error:'Browser cross-origin access is disabled.'});
  const supplied=(req.headers.authorization||'').replace(/^Bearer /,'');
  if(!crypto.timingSafeEqual(Buffer.from(hash(supplied)),Buffer.from(hash(token))))return reply(res,401,{error:'Owner authentication required.'});
  const expected='127.0.0.1:'+server.address().port;
  if(req.headers.host!==expected)return reply(res,403,{error:'Invalid host.'});
  if(req.url==='/health'&&req.method==='GET')return reply(res,200,{ok:true,mode:'local-only',paidSpend:0,externalProviders:0});
  if(req.url==='/state'&&req.method==='GET')return reply(res,200,{state});
  if(req.url==='/backup'&&req.method==='GET')return reply(res,200,{backup:Core.backup(state),sha256:hash(Core.backup(state))});
  if(req.url==='/actions'&&req.method==='POST'){
   if(!/^application\/json(?:;|$)/.test(req.headers['content-type']||''))return reply(res,415,{error:'JSON required.'});
   try{let bytes=0,chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>2000000){reply(res,413,{error:'Request too large.'});req.resume();return;}chunks.push(chunk);}const action=JSON.parse(Buffer.concat(chunks).toString('utf8'));persist(Core.transition(state,action));return reply(res,200,{state});}catch{return reply(res,400,{error:'Action rejected. Check state, lock, input and quota.'});}
  }
  return reply(res,404,{error:'No such endpoint. Publishing and payment APIs do not exist.'});
 });
 server.requestTimeout=10000;server.headersTimeout=10000;server.maxHeadersCount=30;
 timer=setInterval(()=>{if(state.running&&!state.locked){try{persist(Core.transition(state,{type:'tick'}));}catch{state.running=false;state.locked=true;}}},tickMs);timer.unref();
 async function listen(){await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});return 'http://127.0.0.1:'+server.address().port;}
 async function close(){if(closed)return;closed=true;clearInterval(timer);if(server.listening)await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});fs.unlinkSync(lock);}
 return {listen,close};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])) {
 const service=createService({directory:process.env.TRY4_STATE_DIR,token:process.env.TRY4_OWNER_TOKEN,port:Number(process.env.TRY4_PORT||8788)});
 const url=await service.listen();console.log('Try4 local worker listening at '+url+'. No external integrations.');
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await service.close();process.exit(0);});
}
