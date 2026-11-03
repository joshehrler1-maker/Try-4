'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
require(path.join(root,'assets/super-paw-rig.js'));
const api=globalThis.SuperPawRig,canon=JSON.parse(read('assets/heroes-master.json'));
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,canon.master_reference))).digest('hex'),canon.reference_sha256);
let poses=0;
for(const name of ['Whisker','Luna']){
 const model=api.decode(name);assert.equal(api.bytes(name).length,fs.statSync(path.join(root,canon.characters[name].model)).size);
 assert(model.doc.nodes.some(n=>/hair strand|orange crest/.test(n.name)));
 for(const speed of [0,2.8,6.2])for(const phase of [0,.8,1.6,2.4,3.2,4.8,6.1])for(const punch of [0,1]){
  const posed=api.poseNodes(name,{time:2.6,phase,speed,punch,turn:.4,neutral:true});assert.equal(posed.length,model.doc.nodes.length);for(const part of posed)assert([...part.world,...part.normal].every(Number.isFinite));
  for(const side of [-1,1]){const foot=posed.find(p=>p.node.name==='boot toe'&&p.node.extras.side===side);const m=foot.world;assert(m[13]-Math.hypot(m[1],m[5],m[9])>=.014,'Foot penetrates ground');}poses++;
 }
 for(const mesh of model.doc.meshes){const p=mesh.primitives[0],positions=model.data(p.attributes.POSITION),normals=model.data(p.attributes.NORMAL),indices=model.data(p.indices);assert.equal(positions.length,normals.length);assert.equal(indices.length%3,0);assert([...positions,...normals].every(Number.isFinite));assert(Math.max(...indices)<positions.length/3);}
}
let buffers=0;const gl={ARRAY_BUFFER:1,ELEMENT_ARRAY_BUFFER:2,STATIC_DRAW:3,createBuffer:()=>++buffers,bindBuffer(){},bufferData(_target,data){assert(data.byteLength>0)}};
const gpu=api.createGpuModels(gl);for(const name of ['Whisker','Luna']){assert(gpu[name].high[0].count>gpu[name].low[0].count);assert.equal(gpu[name].high.length,api.decode(name).doc.meshes.length);}
for(const file of ['super-paw-3d.html','hero-models.html']){const html=read(file);assert(/src="assets\/super-paw-rig\.js(?:\?[^"]*)?"/.test(html));for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!m[1].includes('src='))new vm.Script(m[2],{filename:file});}
const game=read('super-paw-3d.html');assert(game.includes('posterHeroModels=window.SuperPawRig.createGpuModels(gl)'));assert(game.includes('if(posterHeroModels){drawPosterHero();return;}'));assert(game.includes('minmax(0,60fr) minmax(0,30fr) minmax(0,10fr)'));assert(game.includes("['#ff65b5','#aa78ff']:['#35b8ff','#ff4258']"));assert(game.includes("document.getElementById('pause'),document.getElementById('restart'),document.getElementById('controller-settings')"));assert(game.includes('function beginCatCelebration'));
const Core=require(path.join(root,'core.js')),draft=Core.generate({type:'game',title:'Shared hero verification'})[0].content;assert(draft.includes('createGpuModels'));assert(!draft.includes('src="assets/super-paw-rig.js"'));assert(draft.includes('window.SuperPawMasterPoster="data:image/webp;base64,'));assert(draft.includes('seedMiniCats'));for(const m of draft.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!m[1].includes('src='))new vm.Script(m[2],{filename:'generated-game.html'});
console.log('PASS: '+poses+' shared pose cases, GLB integrity, grounded feet, GPU LOD, exact master image hash, shared sources, standalone drafts, and existing controller/heart/kitten features.');
