/* Super Paw Heroes · original per-game enemy silhouettes, games 11–15.
 * Five unique illustrated 2.5D procedural rigs. NO film-quality 3D claims.
 * Uses gameplay gait/attack/hit timing, not independent collision physics.
 * $0-only: Canvas 2D, no network, fonts, dependencies or license costs.
 */
(() => {
  'use strict';
  const TAU=Math.PI*2;
  const unit=v=>Math.max(0,Math.min(1,Number(v)||0));
  function ellipse(ctx,x,y,w,h,fill,border,width=1.6){
    ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,w),Math.max(.1,h),0,0,TAU);
    ctx.fillStyle=fill;ctx.fill();
    if(border){ctx.strokeStyle=border;ctx.lineWidth=width;ctx.stroke();}
  }
  function shape(ctx,points,fill,border,width=1.7){
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
    ctx.closePath();ctx.fillStyle=fill;ctx.fill();
    if(border){ctx.strokeStyle=border;ctx.lineWidth=width;ctx.stroke();}
  }
  function line(ctx,points,color,width=2){
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function eye(ctx,x,y,color='#fff5dd',pupil='#314768'){
    ellipse(ctx,x,y,4.5,5,color);
    ellipse(ctx,x+1.2,y,1.8,2.7,pupil);
  }
  // SUNSET WIND SAIL — GALE KITE: airfoil wings are sewn sailcloth.
  // A swooping enemy; intentionally NO grounded walking legs.
  function galeKite(ctx,m){
    const bank=m.reduced?0:Math.sin(m.time*3.3+m.offset)*(.08+m.move*.11);
    const dive=m.attack*.28+m.recoil*.10;
    const sail=[[0,0],[17,-24],[35,-29],[29,-5],[8,8]];
    for(const side of [-1,1]){
      ctx.save();
      ctx.translate(side*8,-14);
      ctx.rotate(side*(bank+dive+.08));
      shape(ctx,sail.map(([x,y])=>[x*side,y]),side<0?'#e88d79':'#eeae8c','#ffe6bd',2);
      line(ctx,[[0,0],[side*18,-22],[side*32,-27]],'#fff1cf',2);
      // Flexible tail streamer remains attached to the sail root.
      line(ctx,[[side*19,-12],[side*26,4+bank*9],[side*35,8+bank*8]],
        '#f6d3a0',2.5);
      ctx.restore();
    }
    shape(ctx,[[-14,-25],[-4,-37],[12,-34],[23,-18],[14,4],[-16,6]],
      '#916f7f','#fff0c7',2.5);
    shape(ctx,[[-10,-26],[1,-33],[12,-27],[9,-9],[-12,-9]],
      '#edc5a7','#ffedcf',1.2);
    ellipse(ctx,-10,6,10,5,'#e7aa89','#fff0cf');
    eye(ctx,8,-22,'#fff4de','#3e526a');
    if(m.recoil>.14&&!m.reduced){
      line(ctx,[[-28,3],[-37,8],[-45,6]],'#fff6d1',2);
      line(ctx,[[-26,9],[-34,14]],'#eed9be',1.5);
    }
    // Original 2D motion accent, not a detached overhead arrow.
    if(m.attack>.25)ellipse(ctx,24,-8,2.5+m.attack,2,'#f9f4b5');
  }
  // CLOUD CITY — NIMBUS GUARD: cloudglass armor anchored to foot pads.
  // Pursuit/ground contact is retained even though the city floats.
  function nimbusGuard(ctx,m){
    const walk=m.move*(1-m.attack*.65);
    for(const side of [-1,1]){
      const up=Math.max(0,side*m.step)*walk*5;
      const px=side*(11+walk*m.step*5);
      line(ctx,[[side*10,-3],[px,6-up],[px,15-up]],'#899ed0',4);
      ellipse(ctx,px,17-up,8,3.2,'#d8e6f4','#7790ba');
    }
    // Three connected cloudglass plates, not a borrowed sprite.
    shape(ctx,[[-22,-20],[-15,-35],[6,-40],[23,-28],[27,-11],[20,8],[-23,8]],
      '#788fbd','#e0f3f6',2.5);
    shape(ctx,[[-16,-24],[-7,-35],[8,-34],[20,-22],[13,-12],[-17,-13]],
      '#b7dbe9','#fffaff',1.5);
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*18,-14);
      ctx.rotate(side*(.12+m.attack*.29));
      ellipse(ctx,side*5,-2,12,9,side>0?'#acd1e7':'#93b7d8','#eef8ff');
      ctx.restore();
    }
    // Attack compresses the elastic center; landing animation cushions it.
    ellipse(ctx,1,-7,10+m.attack*3,9-m.attack*2+m.land*2,'#d5f5ef','#8dbac7');
    eye(ctx,11,-24,'#fffef3','#4c6789');
    if(m.recoil>.12&&!m.reduced){
      ellipse(ctx,26,-6,4+m.recoil*2,3,'#f0fdff');
      ellipse(ctx,32,-3,2,2,'#d6f6fc');
    }
    if(m.move>.5&&!m.reduced)ellipse(ctx,-29,9,4,2,'#eaf9ff');
  }
  // THUNDER HARBOR — COIL RAY: paired copper oscillators, a braced core,
  // and electricity only on true projectile recoil (not constant blinking).
  function coilRay(ctx,m){
    const stride=m.move*(1-m.attack*.7);
    for(const side of [-1,1]){
      const lift=Math.max(0,m.step*side)*stride*4;
      line(ctx,[[side*12,-5],[side*(17+m.step*3*stride),7-lift],
        [side*(18+m.step*5*stride),15-lift]],'#6b6f79',5);
      ellipse(ctx,side*(18+m.step*5*stride),17-lift,8,3,'#c1ad8b','#5d6779');
    }
    shape(ctx,[[-22,-26],[-12,-35],[12,-35],[24,-27],[23,6],[-21,6]],
      '#56617b','#efcf96',2.5);
    shape(ctx,[[-18,-22],[-10,-31],[10,-31],[17,-21],[15,-6],[-16,-6]],
      '#8f91aa','#f9dbac',1.5);
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*17,-25);
      ctx.rotate(side*(.12+m.attack*.20));
      // Copper coils are two oscillating cylindrical loops per side.
      for(let n=0;n<3;n++){
        ellipse(ctx,side*3,-n*7,8,3.5,'#b47e56','#f6ce8d');
        ellipse(ctx,side*4,-n*7,4,1.5,'#ead69e');
      }
      ctx.restore();
    }
    ellipse(ctx,1,-13,8+m.attack*2,8+m.attack*2,
      m.attack>.3?'#fff7a0':'#e4cf9e','#fce3bc');
    eye(ctx,8,-27,'#fff4d4','#404e71');
    // Distinct branch segments appear only when the actual shot fires.
    if(m.recoil>.18&&!m.reduced){
      line(ctx,[[24,-13],[35,-20],[33,-9],[43,-13]],'#fff7a0',2.5);
      line(ctx,[[32,-12],[38,-4],[46,-6]],'#baf6f4',1.8);
    }
  }
  // AUTUMN TRAIL — BRAMBLE STALKER: low stalking paws, asymmetric
  // hinged leaf mantle, attack-connected bramble claw (not a glow badge).
  function brambleStalker(ctx,m){
    const travel=m.move*(1-m.attack*.55),step=m.step*travel;
    for(const side of [-1,1]){
      const rise=Math.max(0,step*side)*5;
      const px=side*(13+step*5);
      line(ctx,[[side*11,-3],[px,8-rise],[px,16-rise]],'#576d47',4.5);
      ellipse(ctx,px,18-rise,9,3.3,'#b7a36b','#53784a');
    }
    shape(ctx,[[-25,-14],[-14,-29],[6,-33],[21,-23],[25,0],[8,7],[-25,7]],
      '#596d48','#e6c786',2.7);
    shape(ctx,[[-19,-17],[-7,-29],[9,-30],[17,-20],[0,-13],[-20,-11]],
      '#84985d','#ecdea4',1.4);
    // Left and right leaves never share the same outline.
    ctx.save();ctx.translate(-15,-19);ctx.rotate(-m.attack*.17);
    shape(ctx,[[0,0],[-22,-21],[-29,-37],[-9,-31],[7,-9]],
      '#b58b56','#f3cf8b',1.9);
    ctx.restore();
    ctx.save();ctx.translate(17,-18);ctx.rotate(m.attack*.39);
    shape(ctx,[[0,0],[18,-24],[27,-33],[20,-13],[4,7]],
      '#a46a47','#eed39a',1.9);
    ctx.restore();
    line(ctx,[[19,-12],[29+m.attack*12,-10],[32+m.attack*15,0]],
      '#ddbc85',4);
    ellipse(ctx,32+m.attack*15,0,5,4,'#e3c58e');
    eye(ctx,11,-22,'#f8e9be','#5c5246');
    if(m.recoil>.16&&!m.reduced){
      ellipse(ctx,-28,3,3,2,'#d5bd7e');
      ellipse(ctx,-34,6,2,1.4,'#e6cd8b');
    }
  }
  // INVERTED OBSERVATORY — ORBIT WATCHER: gravity-sensitive rotating
  // star-map scales, but a solid support foot pair keeps pursuit grounded.
  function orbitWatcher(ctx,m){
    const stride=m.move*(1-m.attack*.7);
    for(const side of [-1,1]){
      const rise=Math.max(0,m.step*side)*stride*4;
      const px=side*(12+m.step*5*stride);
      line(ctx,[[side*13,-5],[px,7-rise],[px,16-rise]],'#7479a2',4.5);
      ellipse(ctx,px,18-rise,7.5,3.1,'#c5c6e5','#626f9c');
    }
    const angle=m.reduced?0:Math.sin(m.time*1.9+m.offset)*.14+m.attack*.23;
    ctx.save();ctx.translate(0,-15);ctx.rotate(angle);
    // The orbital wheel is a part of the body, not an overhead UI halo.
    ctx.strokeStyle='#a8bcf2';ctx.lineWidth=3;
    ctx.beginPath();ctx.ellipse(0,0,26,16,-.3,0,TAU);ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,0,15,24,.4,0,TAU);ctx.stroke();
    ellipse(ctx,20,-15,3.5,3.5,'#f9e5ba','#fef8dc');
    ellipse(ctx,-19,11,2.5,2.5,'#c4f8f9');
    ctx.restore();
    shape(ctx,[[-16,-32],[2,-39],[17,-31],[24,-10],[16,8],[-17,8],[-22,-11]],
      '#555d95','#d6d2f3',2.2);
    shape(ctx,[[-11,-26],[2,-34],[12,-26],[17,-14],[8,-7],[-13,-10]],
      '#989cd0','#f8eeda',1.3);
    ellipse(ctx,2,-14,7+m.attack*2,8+m.attack*2,
      m.attack>.3?'#f9edc1':'#a5d6e7','#d6ecf4');
    eye(ctx,11,-26,'#ffffe7','#465f99');
    // Gravity pulse follows a confirmed attack and remains body-height.
    if(m.recoil>.12&&!m.reduced){
      line(ctx,[[24,-9],[32+m.recoil*5,-14],[42+m.recoil*6,-7]],
        '#f4f0c5',2);
    }
  }
  const unique=Object.freeze({
    10:galeKite,11:nimbusGuard,12:coilRay,
    13:brambleStalker,14:orbitWatcher
  });
  function draw(ctx,index,at,foe,pose={}){
    const family=unique[index];
    if(!family || !ctx || !at || !foe)return false;
    const reduced=Boolean(pose.reduced);
    const gait=reduced?0:Number(foe._gait)||0;
    const m={
      reduced,
      move:reduced?0:unit(pose.stride),
      attack:reduced?0:unit(pose.attack),
      recoil:reduced?0:unit(pose.recoil),
      land:reduced?0:unit(pose.landing),
      time:reduced?0:Number(pose.clock)||0,
      offset:Number(foe.offset)||0,
      hit:reduced?0:unit(pose.hit),
      step:reduced?0:Math.sin(gait*[1.21,.92,.87,1.11,.96][index-10]),
      airborne:Boolean(pose.airborne)
    };
    ctx.save();
    try{
      ctx.translate(at.x,at.y);
      if(pose.faceLeft)ctx.scale(-1,1);
      ctx.lineJoin='round';ctx.lineCap='round';
      // Preserve existing hit/defeat compositing in the main canvas.
      const baseOpacity=Number.isFinite(ctx.globalAlpha)?ctx.globalAlpha:1;
      ctx.globalAlpha=baseOpacity*(1-m.hit*.2);
      ctx.translate(-m.hit*1.6,0);
      family(ctx,m);
    }finally{ctx.restore();}
    return true;
  }
  window.pawtopiaCloudEnemyRigs=Object.freeze({
    draw,
    families:Object.freeze({
      10:'Gale Kite',11:'Nimbus Guard',12:'Coil Ray',
      13:'Bramble Stalker',14:'Orbit Watcher'
    })
  });
})();
