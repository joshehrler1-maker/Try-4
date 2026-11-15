'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const batches=[
 ['origin-world-enemy-rigs-v1.js','pawtopiaOriginEnemyRigs',0],
 ['five-world-enemy-rigs-v1.js','pawtopiaFiveEnemyRigs',5],
 ['cloud-trail-enemy-rigs-v1.js','pawtopiaCloudEnemyRigs',10],
 ['mid-world-enemy-rigs-v1.js','pawtopiaMidEnemyRigs',15],
 ['late-world-enemy-rigs-v1.js','pawtopiaLateEnemyRigs',20]
];

test('all 25 independently authored enemy bodies receive bounded individual surface lighting',()=>{
  const paletteResults=new Set();
  let completed=0;
  for(const [file,exportName,base] of batches){
    const source=fs.readFileSync(path.join(root,'assets/animation',file),'utf8');
    assert.match(source,/surfacePalettes/,'missing directional surface materials: '+file);
    const sandbox={window:{}};
    vm.runInNewContext(source,sandbox,{timeout:1200});
    const art=sandbox.window[exportName];
    assert.equal(Object.keys(art.families).length,5);
    for(let world=base;world<base+5;world++){
      let saved=0,gradients=0;const highlighted=[];
      const ctx=new Proxy({globalAlpha:1,
        createLinearGradient:(x0,y0,x1,y1)=>{
          assert.ok([x0,y0,x1,y1].every(Number.isFinite));
          gradients++;
          const stops=[];
          return {addColorStop:(t,c)=>{
            assert.ok(t>=0&&t<=1&&/^#[0-9a-f]{6}$/i.test(c));
            stops.push([t,c]);
            if(stops.length===4)highlighted.push(stops[0][1]+':'+stops[3][1]);
          }};
        }
      },{
        get(target,p){
          if(Object.hasOwn(target,p))return target[p];
          return (...args)=>{
            assert.ok(args.every(a=>typeof a!=='number'||Number.isFinite(a)));
            if(p==='save')saved++;
            if(p==='restore')saved--;
          };
        },set(target,p,v){target[p]=v;return true;}
      });
      for(const pose of [
        {stride:0,attack:0,recoil:0,landing:0,clock:0,reduced:false},
        {stride:.8,attack:.6,recoil:.4,landing:.2,clock:1.2,reduced:false,hit:1},
        {stride:0,attack:0,recoil:0,landing:0,clock:2,reduced:true}
      ])assert.equal(art.draw(ctx,world,{x:120,y:175},
        {_gait:2.4,offset:world+.1,spawnChapter:3},pose),true);
      assert.equal(saved,0,'unbalanced canvas states on '+world);
      assert.ok(gradients>0,'no directional lighting painted on game '+(world+1));
      assert.ok(highlighted.length>0,'no complete material ramp for game '+(world+1));
      paletteResults.add(highlighted[0]);
      completed++;
    }
  }
  assert.equal(completed,25);
  assert.ok(paletteResults.size>=20,'worlds must not share indistinguishable palette finishes');
});

test('game scripts, offline cache and motion quality controls use the same versions',()=>{
  const html=fs.readFileSync(path.join(root,'pawcade-side-scroll.html'),'utf8');
  const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  const core=fs.readFileSync(path.join(root,'assets/pawcade-side-scroll-no-badges-v2.js'),'utf8');
  for(const [file] of batches){
    const match=html.match(new RegExp('src="(assets/animation/'+file.replaceAll('.','[.]')+'[?]v=[^"]+)"'));
    assert.ok(match,'missing playable enemy module '+file);
    assert.ok(worker.includes("'"+match[1]+"'"),'outdated offline enemy module '+file);
  }
  const active=html.match(/src="(assets\/pawcade-side-scroll-no-badges-v2[.]js[?]v=[^"]+)"/);
  assert.ok(active);
  assert.ok(worker.includes("'"+active[1]+"'"));
  assert.ok(!html.includes('id="side-3d-enemies"'));
  assert.ok(!html.includes('src="assets/animation/enemy-3d-prototype-v1.js'));
  assert.ok(core.includes('if(!rendered3D && !authoredEnemyArt) drawEnemySecondaryMotion'));
  assert.ok(core.includes('ctx.translate(-at.x,-at.y-19-(authoredEnemyArt?0:footstep))'));
  assert.ok(core.includes('const hitPose=reducedMotion?0:Math.pow(hitRemaining,hitRecovery);'));
  assert.ok(core.includes('airborne,hit:hitPose'));
});
