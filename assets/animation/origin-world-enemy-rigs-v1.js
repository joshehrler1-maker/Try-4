/* Super Paw Heroes: original base enemy art for games 1–5.
 * Each adventure has a distinct Canvas-2D articulated silhouette.
 * These are lightweight 2.5D procedural visual rigs, NOT true 3D models
 * or a feature-film animation export. No paid dependencies or asset reuse.
 *
 * The game remains authoritative for enemy AI, frame time, physics,
 * enemy hitboxes, stage spawns and projectile direction. Unique pre-existing
 * Foundry/Library/Reef/Clock stage-specific enemy art is preserved by the
 * dispatcher's specialised-variant guard rather than overwritten.
 */
(() => {
  'use strict';
  const TAU=Math.PI*2,clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
  const oval=(ctx,x,y,rx,ry,fill,stroke,width=1.5)=>{
    ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);
    ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
  };
  const poly=(ctx,points,fill,stroke,width=1.4)=>{
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
    ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
  };
  const line=(ctx,pts,color,width=2)=>{
    ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  };
  function eyes(ctx,x,y,pupil='#433749'){
    oval(ctx,x,y,4.5,5,'#fff9e2');
    oval(ctx,x+1.1,y,1.8,2.6,pupil);
  }
  // 1 EMBER FOUNDRY: CINDER TONGS. Paired claw actuator opens before
  // clamp-lunge; rear brace plants and the counterfoot swings only if moving.
  // No detached attack icon: sparks originate at the closing clamp.
  function cinderTongs(ctx,m){
    const step=m.step*m.move*(1-m.attack*.75);
    for(const side of [-1,1]){
      const lift=Math.max(0,step*side)*4.5;
      const fx=side*(13+step*6);
      line(ctx,[[side*12,-1],[fx,8-lift],[fx,16-lift]],'#5c3543',5.2);
      oval(ctx,fx,18-lift,8.5,3.5,'#8c5960','#e2ac72');
    }
    const vent=m.attack*.09;
    ctx.save();ctx.translate(0,-12);ctx.scale(1+vent,1-vent-m.land*.06);
    poly(ctx,[[-23,-22],[-11,-38],[14,-35],[26,-22],[21,10],[-22,10]],
      '#77404b','#e9a366',2.6);
    poly(ctx,[[-18,-21],[-9,-33],[11,-30],[18,-17],[15,-7],[-19,-7]],
      '#ad6454','#ffcb83',1.5);
    poly(ctx,[[-12,-3],[5,-8],[14,2],[-9,6]],'#4e3949','#d6a36f',1);
    oval(ctx,1,-18,8+m.attack*2,10,'#e8a15d','#ffe1a0');
    eyes(ctx,11,-28,'#47344c');
    // Tongs are angular mechanics, not generic character hands.
    const reach=16*m.attack;
    line(ctx,[[20,-14],[29+reach,-12]],'#d9aa7e',7);
    const jaw=6+m.attack*5;
    poly(ctx,[[26+reach,-11],[39+reach,-21-jaw],[44+reach,-15-jaw],
      [36+reach,-6]],'#b6795a','#ffe4a3',1.6);
    poly(ctx,[[26+reach,-10],[39+reach,0+jaw],[44+reach,-5+jaw],
      [36+reach,-14]],'#b6795a','#ffe4a3',1.6);
    if(m.recoil>.22 && !m.reduced){
      for(let i=0;i<3;i++)oval(ctx,41+reach+i*4,-10+(i-1)*5,
        2+m.recoil,1.4,'#ffe9a7');
    }
    ctx.restore();
  }
  // 2 MOONLIT LIBRARY: ATLAS WARDEN. Quill/plated book armor and a page
  // shield that unfolds with attack anticipation. It has deliberate feet.
  function atlasWarden(ctx,m){
    const travel=m.move*(1-m.attack*.85);
    for(const side of [-1,1]){
      const lift=Math.max(0,side*m.step)*4*travel;
      const footX=side*(12+m.step*4*travel);
      line(ctx,[[side*12,0],[footX,8-lift],[footX,17-lift]],
        '#4c527f',4.4);
      oval(ctx,footX,18-lift,8,3,'#b5b5da','#535579');
    }
    poly(ctx,[[-25,-34],[-8,-41],[6,-39],[22,-31],
      [22,7],[-22,8]],'#65678e','#e1d9ca',2.6);
    poly(ctx,[[-19,-30],[-4,-36],[11,-33],[18,-26],
      [17,1],[-17,1]],'#c1b5bd','#fff1db',1.7);
    // Spine stitching and independent folding page plates.
    line(ctx,[[-5,-35],[-5,4]],'#796982',3.1);
    for(let j=0;j<4;j++)line(ctx,[[-11,-28+j*8],[11,-27+j*8]],
      '#9186a7',1.3);
    const spread=m.attack*.45;
    ctx.save();ctx.translate(20,-16);ctx.rotate(-spread);
    poly(ctx,[[0,-16],[16,-22],[20,-9],[7,7],[0,10]],
      '#e5d9c5','#9588ad',2);
    line(ctx,[[6,-10],[15,-13]],'#9893ba',1.5);
    ctx.restore();
    ctx.save();ctx.translate(-17,-16);ctx.rotate(spread*.45);
    poly(ctx,[[0,-15],[-15,-20],[-21,-5],[-9,8],[0,10]],
      '#9c94b1','#f8ecdf',1.6);
    ctx.restore();
    // Quill traces the weapon path only when a shot was actually released.
    line(ctx,[[21,-12],[27+m.attack*10,-8],[33+m.attack*14,1]],
      '#e6d6b3',3);
    eyes(ctx,12,-28,'#404666');
    if(m.recoil>.2&&!m.reduced)line(ctx,[[32,-7],[40,-13],[48,-6]],
      '#fff1d4',2);
  }
  // 3 CORAL COURIER: REEF SKIMMER. No feet, multiple differently hinged
  // pectoral/caudal fins with continuous undersea buoyancy.
  function reefSkimmer(ctx,m){
    const tail=m.reduced?0:Math.sin(m.time*4.7+m.offset)*(.18+m.move*.13);
    const bank=m.attack*.26;
    ctx.save();ctx.translate(-20,-15);ctx.rotate(tail);
    poly(ctx,[[0,0],[-25,-20],[-32,-8],[-26,2],[-32,14],
      [-20,23]],'#5ac7b5','#f3dda8',2);
    ctx.restore();
    ctx.save();ctx.translate(9,-20);ctx.rotate(bank+tail*.5);
    poly(ctx,[[0,0],[12,-26],[26,-31],[20,-6]],
      '#73d7cd','#faecbd',1.8);
    ctx.restore();
    ctx.save();ctx.translate(11,-12);ctx.rotate(-bank+tail*.3);
    poly(ctx,[[0,0],[23,9],[28,23],[10,17]],
      '#9de7c7','#f0f5c8',1.8);
    ctx.restore();
    poly(ctx,[[-24,-27],[-10,-38],[9,-35],[25,-23],
      [24,-3],[9,5],[-19,3],[-28,-11]],
      '#328b94','#adeee1',2.7);
    poly(ctx,[[-17,-25],[-5,-35],[11,-29],[18,-17],
      [13,-6],[-18,-7]],'#75c9ad','#d4ffeb',1.4);
    // Non-repeating coral branches are connected to dorsal body plate.
    line(ctx,[[-9,-32],[-13,-44],[-20,-49]],'#f6b887',3.2);
    line(ctx,[[3,-34],[8,-48],[17,-50]],'#ffcb95',2.7);
    eyes(ctx,12,-24,'#25647b');
    // Local water turbulence only on real hit.
    if(m.recoil>.13&&!m.reduced){
      for(let k=0;k<3;k++)oval(ctx,-34-k*6,-17+k*6,2.2,2.2,
        '#d4ffff','#79cdde');
    }
  }
  // 4 CLOCKTOWER RELAY: PENDULUM SENTINEL. Braced brass mechanical feet,
  // a hinged clock arm and a hammer whose sweep follows attack pose.
  function pendulumSentinel(ctx,m){
    const march=m.move*(1-m.attack*.8);
    for(const side of [-1,1]){
      const rise=Math.max(0,side*m.step)*march*4;
      const fx=side*(12+m.step*march*7);
      line(ctx,[[side*11,-2],[fx,8-rise],[fx,16-rise]],
        '#665160',5.5);
      oval(ctx,fx,18-rise,8.5,3.2,'#d1b06a','#68526b');
    }
    poly(ctx,[[-23,-30],[-14,-40],[10,-42],[25,-29],
      [24,6],[-23,6]],'#846260','#ebd399',2.7);
    poly(ctx,[[-17,-29],[-8,-36],[12,-34],[18,-22],
      [14,-4],[-17,-4]],'#c8aa77','#fff0c5',1.4);
    oval(ctx,0,-19,12,12,'#64516d','#f2dba6');
    oval(ctx,0,-19,8,8,'#dfc48e','#f7e5bd');
    line(ctx,[[0,-19],[4,-26],[8,-25]],'#675b73',2);
    const hinge=m.reduced?0:Math.sin(m.time*2.4+m.offset)*.08;
    ctx.save();ctx.translate(20,-26);ctx.rotate(hinge-m.attack*.78);
    line(ctx,[[0,0],[13,10],[18,25]],'#e9d2a0',6);
    poly(ctx,[[14,16],[28,15],[33,23],[30,33],[15,31]],
      '#998067','#fff1cc',1.8);
    ctx.restore();
    // A rear clock key winds against the arm, mechanically connected.
    line(ctx,[[-23,-22],[-34,-27],[-39,-25]],'#dabf85',3);
    oval(ctx,-37,-26,5,4,'#d6af7f','#ffebc7');
    eyes(ctx,11,-30,'#564968');
    if(m.recoil>.15&&!m.reduced)line(ctx,[[31,-2],[39,1],[47,-2]],
      '#fff0bc',2);
  }
  // 5 SEED GARDEN: THORN HOPPER. Seedpod shell and hind spring legs,
  // with leaves growing from connected stems before a grounded pounce.
  function thornHopper(ctx,m){
    const pace=m.move*(1-m.attack*.6),spring=m.attack*.18;
    for(const side of [-1,1]){
      const lift=Math.max(0,m.step*side)*pace*5;
      const foot=side*(13+pace*m.step*6);
      line(ctx,[[side*10,0],[side*(17+spring*5),8-lift],
        [foot,17-lift]],'#4f8859',5);
      oval(ctx,foot,19-lift,9,3.2,'#87b86e','#436f4f');
    }
    ctx.save();ctx.translate(0,-10);
    ctx.scale(1+m.attack*.1,1-spring-m.land*.12);
    poly(ctx,[[-25,-14],[-16,-32],[0,-39],[18,-33],
      [27,-17],[23,4],[6,11],[-23,6]],
      '#67975b','#d9d48c',2.3);
    poly(ctx,[[-20,-18],[-11,-31],[3,-34],[18,-27],
      [21,-16],[6,-8],[-21,-8]],
      '#9bbe75','#f1e7a9',1.5);
    // Thorn seed ridges are physical shell plates, not floating icons.
    for(let i=0;i<3;i++){
      poly(ctx,[[-18+i*12,-25],[-12+i*12,-37],
        [-5+i*12,-22]],'#4f8551','#b5d289',1.1);
    }
    ctx.save();ctx.translate(-12,-25);
    ctx.rotate(-m.attack*.4);
    poly(ctx,[[0,2],[-18,-9],[-23,-27],[-5,-19]],
      '#6ba46a','#dbed9b',1.7);
    ctx.restore();
    ctx.save();ctx.translate(13,-27);ctx.rotate(m.attack*.53);
    poly(ctx,[[0,1],[14,-18],[24,-23],[16,-3]],
      '#85b66d','#f6edab',1.7);
    ctx.restore();
    eyes(ctx,14,-23,'#416a50');
    line(ctx,[[22,-11],[28+m.attack*11,-9],
      [32+m.attack*15,0]],'#c6cf85',3);
    if(m.recoil>.12&&!m.reduced){
      oval(ctx,-28,2,3,2,'#d6d78c');
      oval(ctx,-35,5,2,1.2,'#e4eca1');
    }
    ctx.restore();
  }

  const families=Object.freeze({
    0:cinderTongs,1:atlasWarden,2:reefSkimmer,
    3:pendulumSentinel,4:thornHopper
  });
  function draw(ctx,game,at,foe,pose={}){
    const family=families[game];
    if(!family || !ctx || !at || !foe)return false;
    const reduced=Boolean(pose.reduced),gait=reduced?0:Number(foe._gait)||0;
    const m={
      reduced,
      move:reduced?0:clamp(pose.stride),
      attack:reduced?0:clamp(pose.attack),
      recoil:reduced?0:clamp(pose.recoil),
      land:reduced?0:clamp(pose.landing),
      time:reduced?0:Number(pose.clock)||0,
      offset:Number(foe.offset)||0,
      hit:reduced?0:clamp(pose.hit),
      step:reduced?0:Math.sin(gait*[.91,.82,1.08,1.17,.98][game]),
      archetype:Number(foe.archetype)||0
    };
    ctx.save();
    try{
      ctx.translate(at.x,at.y);
      if(pose.faceLeft)ctx.scale(-1,1);
      ctx.lineCap='round';ctx.lineJoin='round';
      // Preserve outer fade from defeat state, rather than resetting alpha.
      const currentAlpha=Number.isFinite(ctx.globalAlpha)?ctx.globalAlpha:1;
      ctx.globalAlpha=currentAlpha*(1-m.hit*.22);
      ctx.translate(-m.hit*1.5,0);
      family(ctx,m);
      // Authored chapter variation modifies the same native body:
      // one extra local armored tile from chapter 3, never a separate icon.
      if(!reduced && Number(foe.spawnChapter)>=3){
        poly(ctx,[[-9,-37],[-2,-40],[6,-37],[2,-33]],
          ['#eebc86','#c3c0d7','#a7e8cc','#ecd1a0','#bfdd91'][game],
          '#fff2ca',1);
      }
    }finally{ctx.restore();}
    return true;
  }
  window.pawtopiaOriginEnemyRigs=Object.freeze({
    draw,
    families:Object.freeze({
      0:'Cinder Tongs',1:'Atlas Warden',2:'Reef Skimmer',
      3:'Pendulum Sentinel',4:'Thorn Hopper'
    })
  });
})();
