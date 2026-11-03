import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {createService} from '../server/service.mjs';
const token='a'.repeat(64);
test('worker requires authentication, persists jobs, relocks on restart and blocks external actions',async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'try4-worker-'));let service=createService({directory,token,tickMs:100000});
 try{let url=await service.listen();const headers={authorization:'Bearer '+token,'content-type':'application/json'};
 assert.equal((await fetch(url+'/state')).status,401);
 assert.equal((await fetch(url+'/state',{headers:{...headers,origin:'https://evil.test'}})).status,403);
 const badHost=await new Promise((resolve,reject)=>{const req=http.get(url+'/state',{headers:{...headers,host:'evil.test'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);});assert.equal(badHost,403);
 const action=async data=>fetch(url+'/actions',{method:'POST',headers,body:JSON.stringify(data)});
 assert.equal((await action({type:'unlock'})).status,200);
 assert.equal((await action({type:'add',kind:'story',title:'Durable draft'})).status,200);
 assert.equal((await action({type:'start'})).status,200);
 assert.equal((await action({type:'tick'})).status,200);
 assert.equal((await action({type:'publish',id:1})).status,400);
 assert.equal((await fetch(url+'/payout',{method:'POST',headers})).status,404);
 assert.throws(()=>createService({directory,token}),/already has/);
 await service.close();service=createService({directory,token,tickMs:100000});url=await service.listen();const {state}=await (await fetch(url+'/state',{headers})).json();
 assert.equal(state.locked,true);assert.equal(state.running,false);assert.equal(state.jobs[0].status,'review');assert.ok(state.jobs[0].artifacts[0].content.includes('Whisker'));
 assert.equal(fs.statSync(path.join(directory,'workspace.json')).mode&0o777,0o600);
 const backup=await (await fetch(url+'/backup',{headers})).json();assert.equal(backup.sha256.length,64);
 }finally{await service.close();fs.rmSync(directory,{recursive:true,force:true});}
});
test('worker refuses weak credentials and corrupted saved data',async()=>{const directory=fs.mkdtempSync(path.join(os.tmpdir(),'try4-corrupt-'));try{assert.throws(()=>createService({directory,token:'weak'}));const s=createService({directory,token});await s.close();fs.writeFileSync(path.join(directory,'workspace.json'),JSON.stringify({sha256:'wrong',backup:'{}'}));assert.throws(()=>createService({directory,token}),/integrity/);assert.equal(fs.existsSync(path.join(directory,'worker.lock')),false);}finally{fs.rmSync(directory,{recursive:true,force:true});}});
