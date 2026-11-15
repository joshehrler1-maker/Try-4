/* Original Super Paw Heroes 2.5D procedural enemy motion — games 16–20.
 * Bamboo, Steamworks, Snow Village, Canyon, and Submarine each have their
 * own distinct body art and motion logic; no shared character sprites.
 * The playable game retains sole authority over physics, collisions,
 * attack cadence, damage, and hit timing. $0, zero network dependencies.
 * These are layered 2D vector rigs, NOT rendered feature-film 3D meshes.
 */
(() => {
  'use strict';
  const TAU=Math.PI*2;
  const clamp=(value)=>Math.max(0,Math.min(1,Number(value)||0));
  // Original world-specific directional material shading, no recycled art.
  // Large panels receive a subtle top light; eyes and tiny particles stay flat.
  const surfacePalettes=[["#ddffc4","#1a4b45"],["#ffe3b6","#413b4b"],["#edffff","#354b85"],["#ffe4b5","#56343d"],["#b6ffff","#124a62"]];
  let activeSurfaceWorld=0;
  const tint=(a,b,t)=>{
    const c=parseInt(a.slice(1),16),d=parseInt(b.slice(1),16);
    const channel=shift=>Math.round(((c>>shift)&255)*(1-t)+((d>>shift)&255)*t);
    return '#'+[channel(16),channel(8),channel(0)]
      .map(v=>v.toString(16).padStart(2,'0')).join('');
  };
  const sculptedFill=(ctx,color,x0,y0,x1,y1)=>{
    if(typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color)||
       (x1-x0)*(y1-y0)<320)return color;
    if(typeof ctx.createLinearGradient!=='function')return color;
    const gradient=ctx.createLinearGradient(x0,y0,x1,y1);
    if(!gradient||typeof gradient.addColorStop!=='function')return color;
    const [key,shade]=surfacePalettes[activeSurfaceWorld];
    gradient.addColorStop(0,tint(color,key,.46));
    gradient.addColorStop(.27,tint(color,'#ffffff',.13));
    gradient.addColorStop(.58,color);
    gradient.addColorStop(1,tint(color,shade,.49));
    return gradient;
  };
  const panelFill=(ctx,color,points)=>{
    if(!points||points.length<3)return color;
    let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
    for(const [x,y] of points){
      if(x<x0)x0=x;if(x>x1)x1=x;
      if(y<y0)y0=y;if(y>y1)y1=y;
    }
    return sculptedFill(ctx,color,x0,y0,x1,y1);
  };
  const orbFill=(ctx,color,x,y,rx,ry)=>
    sculptedFill(ctx,color,x-rx,y-ry,x+rx,y+ry);
  function path(ctx,points,fill,stroke,width=1.5){
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
    ctx.closePath();
    if(fill){ctx.fillStyle=panelFill(ctx,fill,points);ctx.fill();}
    if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
  }
  function stroke(ctx,points,color,width=2){
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function ellipse(ctx,x,y,rx,ry,fill,strokeColor,width=1.5){
    ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);
    ctx.fillStyle=orbFill(ctx,fill,x,y,rx,ry);ctx.fill();
    if(strokeColor){ctx.lineWidth=width;ctx.strokeStyle=strokeColor;ctx.stroke();}
  }
  function face(ctx,x,y,eye,iris){
    ellipse(ctx,x,y,4,4.5,eye);
    ellipse(ctx,x+1,y,1.7,2.5,iris);
  }
  // Bamboo Village — CANE STRIKER.
  // Pole planting/extended lunge, upper leaf plates, grounded two-step gait.
  function caneStriker(ctx,m){
    const moving=m.move*(1-m.attack*.72), vault=m.attack*.42;
    const foot1=Math.max(0,m.step)*moving*5;
    const foot2=Math.max(0,-m.step)*moving*5;
    if(m.airborne){
      // In this game the assigned enemy pattern is a swoop, so tuck both
      // lower legs in flight instead of drawing a walking contact cycle.
      stroke(ctx,[[-12,-5],[-19,4],[-14,9]],'#285943',5);
      stroke(ctx,[[12,-5],[17,5],[11,10]],'#285943',5);
      ellipse(ctx,-14,10,7,3,'#8ca56b','#305741');
      ellipse(ctx,11,11,7,3,'#8ca56b','#305741');
    } else {
      stroke(ctx,[[-12,-5],[-13+m.step*5*moving,8-foot1],[-13+m.step*8*moving,17-foot1]],
        '#285943',5);
      stroke(ctx,[[12,-5],[12-m.step*5*moving,7-foot2],[13-m.step*6*moving,17-foot2]],
        '#285943',5);
      ellipse(ctx,-14+m.step*8*moving,18-foot1,8,3,'#8ca56b','#305741');
      ellipse(ctx,14-m.step*6*moving,18-foot2,8,3,'#8ca56b','#305741');
    }
    // Pole foot remains planted when striking; angular change is at the hands.
    ctx.save();ctx.translate(20,11);ctx.rotate(-vault);
    ctx.fillStyle='#d2c98b';ctx.fillRect(-3,-42,6,52);
    ctx.strokeStyle='#376e51';ctx.lineWidth=2.4;
    for(let yy=-33;yy<8;yy+=18){stroke(ctx,[[-5,yy],[5,yy]],'#376e51',2);}
    ctx.restore();
    path(ctx,[[-20,-26],[-6,-35],[15,-34],[24,-17],[20,7],[-21,8]],
      '#3b7d59','#c5d59a',2.5);
    path(ctx,[[-19,-19],[-3,-30],[13,-27],[15,-10],[-19,-8]],
      '#83ad67','#e1d4a1',1.5);
    // Layered shoulder leaf on one side, asymmetrical vs every other family.
    path(ctx,[[-19,-27],[-34,-40],[-24,-15],[-17,-9]],
      '#6ca271','#c7e6ac',1.6);
    path(ctx,[[20,-25],[29,-37],[34,-24],[24,-14]],
      '#457d61','#b6d69a',1.6);
    stroke(ctx,[[17,-15],[25+m.attack*10,-6],[32+m.attack*15,-9]],
      '#a5bd88',4);
    ellipse(ctx,29+m.attack*15,-9,5,4,'#d7d2aa','#6c996d');
    face(ctx,11,-23,'#fff4d7','#214d47');
    ellipse(ctx,-9,-16,3,2,'#bdcd99');
    if(m.recoil>.16){
      stroke(ctx,[[42+m.attack*15,-12],[48+m.attack*16,-18]],'#e8f8b2',2);
    }
    // Small low leaf gust, not an unrelated floating graphic above the foe.
    if(m.move>.45 && !m.reduced)ellipse(ctx,-30,-5,2.5,1.5,'#d3e6a2');
  }
  // Steamworks — PRESSURE PISTON.
  // Boiler and chamber, separate wheel/turret supports and telescopic jab.
  function pressurePiston(ctx,m){
    const turret=m.turret, extension=m.attack*22;
    if(turret){
      path(ctx,[[-26,14],[-17,5],[19,5],[27,14],[25,21],[-26,21]],
        '#394a57','#cfb38f',2);
    } else {
      const turn=m.move*m.step*4*(1-m.attack*.5);
      for(const side of [-1,1]){
        ellipse(ctx,side*17+turn*side,15,8,8,'#333d4d','#caa778',2);
        ellipse(ctx,side*17+turn*side,15,3.5,3.5,'#c29e73');
      }
    }
    path(ctx,[[-22,-30],[17,-30],[24,-20],[24,7],[-21,9],[-27,-5]],
      '#714a3d','#d5ab81',3);
    path(ctx,[[-17,-24],[13,-24],[19,-16],[18,-3],[-19,-3]],
      '#b97753','#eed19f',1.7);
    // Longitudinal cylinder stripes remain on the actual boiler, not hovering.
    for(let yy=-20;yy<=-5;yy+=7)stroke(ctx,[[-13,yy],[13,yy]],'#eac693',1.6);
    path(ctx,[[-23,-34],[-10,-40],[11,-40],[22,-34]],'#616b62','#e1cea4',2);
    ellipse(ctx,-5,-29,4,4,'#e6f6cf','#ad7d57');
    // Accurate barrel position is controlled by projectile recoil from game.
    stroke(ctx,[[18,-15],[29,-15],[32+extension,-15]],'#d7bba0',9);
    path(ctx,[[29+extension,-23],[35+extension,-23],[37+extension,-6],[28+extension,-6]],
      '#9a9787','#f5dcb5',1.4);
    ellipse(ctx,33+extension,-15,4,5,'#ffe9b0','#b6794d');
    // Steam release remains local to valve; finite discrete puffs are cheap.
    if(m.recoil>.2 && !m.reduced){
      for(let k=0;k<3;k++)ellipse(ctx,41+extension+k*4,-21-k*5,2+k*.4,2.5+k*.4,
        '#d4fff1');
    }
    face(ctx,12,-28,'#f7edc0','#543e3c');
  }
  // Snow Village — FROST LANTERN.
  // Iceglass refractive body and braking crampon paws, exhale cone on shot.
  function frostLantern(ctx,m){
    const step=m.step*m.move*(1-m.attack*.72);
    const drift=m.move*.5;
    for(const side of [-1,1]){
      const y=17-Math.max(0,step*side)*4;
      path(ctx,[[side*9,3],[side*(12+step*4),9],[side*(15+step*8),y]],
        '#7db8ca','#e9faff',2);
      ellipse(ctx,side*(16+step*8),y+1,8,3.7,'#e2fcff','#729daf');
      // Small crampon tines make icy braking legible at walking speed.
      stroke(ctx,[[side*(11+step*8),y+3],[side*(11+step*8),y+5]],
        '#7a92b8',1.5);
    }
    const exhale=m.attack*.085, settle=m.land*.12;
    ctx.save();ctx.translate(0,-10);ctx.scale(1+exhale,1-exhale-settle);
    path(ctx,[[-19,-28],[-8,-43],[11,-41],[22,-28],[19,9],[-18,9]],
      '#8bd0e2','#f5feff',2.6);
    path(ctx,[[-13,-27],[-7,-38],[7,-37],[13,-25],[12,3],[-13,3]],
      '#c9f1ff','#fffdf2',1.3);
    path(ctx,[[-12,-12],[0,-23],[12,-12],[0,-1]],'#76b9d1','#f2ffff',1.4);
    face(ctx,9,-25,'#fffbf2','#476780');
    // Lantern core lights up while attack aims, bounded to its body.
    ellipse(ctx,-1,-11,6+m.attack*4,8+m.attack*2,
      m.attack>.3?'#f3ffe5':'#e0f3df','#9bcbda');
    ctx.restore();
    if(m.recoil>.15&&!m.reduced){
      path(ctx,[[23,-22],[34+m.recoil*8,-28],[41+m.recoil*13,-20],
        [36+m.recoil*8,-12],[24,-13]],'#d4f6ff','#f7ffff',1.2);
    }
    if(drift>.1&&!m.reduced)stroke(ctx,[[-18,19],[-25,19]],'#b9e7ee',2);
  }
  // Canyon Crossing — DUST RUNNER.
  // Sandstone hinged sprint armor: one planted toe, one swing foot, low wake.
  function dustRunner(ctx,m){
    const run=m.move*(1-m.attack*.52),stride=m.step*run;
    const leftLift=Math.max(0,stride)*6,rightLift=Math.max(0,-stride)*6;
    const xLeft=-11+stride*12,xRight=11-stride*12;
    stroke(ctx,[[-12,-3],[xLeft,-2],[xLeft-4,15-leftLift]],'#7e6555',5.5);
    stroke(ctx,[[11,-3],[xRight,1],[xRight+4,15-rightLift]],'#7e6555',5.5);
    ellipse(ctx,xLeft-6,17-leftLift,9,3,'#d5a770','#885a4c');
    ellipse(ctx,xRight+6,17-rightLift,9,3,'#d5a770','#885a4c');
    ctx.save();ctx.rotate(-m.attack*.12+m.step*run*.055);
    path(ctx,[[-21,-29],[-10,-42],[15,-38],[24,-22],[19,5],[-18,7]],
      '#a97c5d','#e8c48e',2.3);
    path(ctx,[[-15,-30],[-8,-38],[13,-33],[18,-19],[6,-10],[-12,-12]],
      '#e0b179','#fff0ba',1.2);
    // Three irregular sandstone plates distinguish this from the marble golem.
    path(ctx,[[-15,-5],[-2,-15],[8,-7],[2,2]],'#b67c52','#ebbe83',1.2);
    path(ctx,[[5,-18],[17,-20],[17,-9],[7,-7]],'#d69a69','#f5d5a0',1.1);
    path(ctx,[[-22,-17],[-34,-12],[-27,2],[-19,1]],'#926d55','#ddac77',1.1);
    stroke(ctx,[[18,-19],[26+m.attack*13,-12],[31+m.attack*18,-2]],
      '#e2c08b',4.3);
    ellipse(ctx,31+m.attack*18,-2,5,4,'#edca9a');
    face(ctx,12,-28,'#fff6d7','#5e4f5d');
    ctx.restore();
    if(run>.3&&!m.reduced){
      ellipse(ctx,-30-run*10,16,4+run*2,1.8,'#c8ab8b');
      ellipse(ctx,-37-run*9,13,2.4,1.3,'#e0c69e');
    }
    if(m.recoil>.2&&!m.reduced)stroke(ctx,[[42,-2],[49,-6]],'#ffe6b2',2);
  }
  // Submarine Dock — ABYSS PROBE.
  // Aquatic probe with independently swimming fins, illuminated sonar lens.
  // Intentionally NO grounded feet: underwater enemy pattern is 'school'.
  function abyssProbe(ctx,m){
    const beat=Math.sin(m.t*4.2+m.offset);
    const sweep=m.reduced?0:beat*(.22+.12*m.move);
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*16,-14);
      ctx.rotate(side*(.18+sweep*.72+m.attack*.12));
      path(ctx,[[0,0],[side*19,-16],[side*28,-5],[side*18,9]],
        '#4b9ab0','#c3f3eb',2);
      ctx.restore();
    }
    // Tail propeller visibly spins only while travelling.
    ctx.save();ctx.translate(-24,-9);ctx.rotate(m.reduced?0:m.t*(3+8*m.move)+m.offset);
    for(let blade=0;blade<3;blade++){
      ctx.save();ctx.rotate(blade*TAU/3);
      path(ctx,[[0,0],[-5,-6],[-3,-19],[5,-20],[7,-5]],
        '#71c5cb','#e1ffef',1);
      ctx.restore();
    }
    ctx.restore();
    ellipse(ctx,0,-14,25,19,'#3d748a','#c1f1ec',2.5);
    path(ctx,[[-17,-23],[-6,-34],[11,-32],[21,-18],[16,-12],[-18,-12]],
      '#70b3ba','#bdf4ec',1.4);
    ellipse(ctx,7,-18,12,11,'#a4dae2','#ecfcf1',2);
    ellipse(ctx,10,-18,7+m.attack*2,7+m.attack*2,
      m.attack>.3?'#edffe1':'#bbf3ed','#89bac8');
    ellipse(ctx,11,-18,3,3,'#3f707d');
    // Antenna has true joint connection rather than a detached ring.
    stroke(ctx,[[0,-32],[2,-40],[8,-43]],'#bce7db',2);
    ellipse(ctx,8,-43,3,3,'#9cf2dc');
    // Pulse is attached to the shooter face and only visible during recoil.
    if(m.recoil>.15&&!m.reduced){
      ctx.beginPath();ctx.arc(20,-18,5+m.recoil*10,-.6,.6);
      ctx.strokeStyle='#b5fff4';ctx.lineWidth=2;ctx.stroke();
    }
    if(m.move>.2&&!m.reduced)stroke(ctx,[[-25,-9],[-34,-8-sweep*4]],
      '#9fd9df',1.5);
  }
  const designs=Object.freeze({
    15:caneStriker,16:pressurePiston,17:frostLantern,
    18:dustRunner,19:abyssProbe
  });
  function draw(ctx,index,at,foe,pose={}) {
    const design=designs[index];
    if(!design || !ctx || !at || !foe)return false;
    const reduced=Boolean(pose.reduced);
    const gait=reduced?0:(Number(foe._gait)||0);
    const m={
      reduced,
      move:reduced?0:clamp(pose.stride),
      attack:reduced?0:clamp(pose.attack),
      recoil:reduced?0:clamp(pose.recoil),
      land:reduced?0:clamp(pose.landing),
      t:reduced?0:Number(pose.clock)||0,
      offset:Number(foe.offset)||0,
      step:reduced?0:Math.sin(gait*([15,16,17,18,19].indexOf(index)*.13+.83)),
      turret:Boolean(foe.turret),
      airborne:Boolean(pose.airborne),
      hit:reduced?0:clamp(pose.hit)
    };
    ctx.save();
    try {
      ctx.translate(at.x,at.y);
      if(pose.faceLeft)ctx.scale(-1,1);
      ctx.lineJoin='round';ctx.lineCap='round';
      // A quick on-body hit response from the existing bash state. Reduced
      // motion users retain fully static poses and unmodified collisions.
      const priorAlpha=Number.isFinite(ctx.globalAlpha)?ctx.globalAlpha:1;
      ctx.globalAlpha=priorAlpha*(1-m.hit*.22);
      ctx.translate(m.hit*-1.5,0);
      activeSurfaceWorld=index-15;
      design(ctx,m);
    }finally{
      ctx.restore();
    }
    return true;
  }
  window.pawtopiaMidEnemyRigs=Object.freeze({
    draw,families:Object.freeze({
      15:'Cane Striker',16:'Pressure Piston',17:'Frost Lantern',
      18:'Dust Runner',19:'Abyss Probe'
    })
  });
})();
