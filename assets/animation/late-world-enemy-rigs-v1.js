/* Super Paw Heroes · individually authored late-world enemy motion silhouettes.
 * These are ORIGINAL 2.5D procedural vector rigs, not a 3D film render.
 * The gameplay engine owns physics, hitboxes, spawn positions and hit timing.
 * Each family is distinct. No image atlas, external calls or paid dependency.
 */
(() => {
  'use strict';
  const TWO_PI = Math.PI * 2;
  const limit = value => Math.max(0, Math.min(1, Number(value) || 0));
  // Original world-specific directional material shading, no recycled art.
  // Large panels receive a subtle top light; eyes and tiny particles stay flat.
  const surfacePalettes=[["#ffc6fb","#2b2854"],["#f4eeff","#3e3857"],["#d8ffb0","#243e3c"],["#fff4c0","#65414f"],["#dffbff","#293b56"]];
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
  const line = (ctx, points, stroke, width=2) => {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let j=1; j<points.length; j++) ctx.lineTo(points[j][0],points[j][1]);
    ctx.lineWidth=width;
    ctx.strokeStyle=stroke;
    ctx.stroke();
  };
  const poly = (ctx, points, fill, stroke, width=1) => {
    ctx.beginPath();
    ctx.moveTo(points[0][0],points[0][1]);
    for(let j=1;j<points.length;j++) ctx.lineTo(points[j][0],points[j][1]);
    ctx.closePath();
    ctx.fillStyle=panelFill(ctx,fill,points);ctx.fill();
    if (stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
  };
  const oval=(ctx,x,y,rx,ry,fill,stroke)=>{
    ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TWO_PI);
    ctx.fillStyle=orbFill(ctx,fill,x,y,rx,ry);ctx.fill();
    if(stroke){ctx.lineWidth=1.8;ctx.strokeStyle=stroke;ctx.stroke();}
  };

  // Neon Circuit — PIXEL PHANTOM. Glitch plates stutter around a physical
  // roller-footed body; strike arm telescopes from an actual attack cue.
  function pixelPhantom(ctx, step, move, attack, recoil, land, t, offset) {
    const wheel=Math.max(0,move)*(1-attack*.7);
    const telegraph=attack*.9;
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*12,14-land*2);
      ctx.rotate(side*step*.16*wheel);
      oval(ctx,0,0,8,7,'#24264f','#ff8ee0');
      line(ctx,[[-5,0],[5,0]],'#76fff3',2);
      ctx.restore();
    }
    const glitch=Math.sin(t*18+offset)*move*1.2;
    poly(ctx,[[-21,-32],[-11,-40],[17,-40],[27,-30],[25,6],[11,14],[-17,12],[-25,3]],
      '#442c77','#a275f0',2);
    poly(ctx,[[-18,-31],[-9,-37],[15,-37],[21,-28],[20,-2],[-19,-2]],
      '#8252af','#ffcafa',1.2);
    for(let i=0;i<3;i++) {
      ctx.fillStyle=i===1?'#eaa1fc':'#77ffef';
      ctx.fillRect(-13+i*11+glitch*(i%2?1:-1),-27+((i+Math.floor(offset))%2)*8,7,7);
    }
    poly(ctx,[[17,-21],[28,-24],[36+telegraph*16,-14],[25,-10]],
      '#d778c5','#ffdaec',2);
    ctx.fillStyle=recoil>.08?'#fff3b6':'#6effe5';
    ctx.fillRect(29+telegraph*15,-19,5+recoil*7,8);
    // Contact signal stays close to the striking limb rather than overhead.
    if(recoil>.2)line(ctx,[[44+telegraph*12,-19],[51+telegraph*19,-26]],
      '#b7fff7',1.8);
    line(ctx,[[-15,-11],[-27,-5],[-23,6]],'#d5a6ed',3);
    ctx.fillStyle='#fff7dc';ctx.fillRect(10,-29,8,5);
    ctx.fillStyle='#23233d';ctx.fillRect(15,-28,2,3);
  }

  // Marble Temple — MOSAIC GOLEM. Inlaid blocks visibly brace and curl
  // into a heavy rolling attack without sliding the support feet off ledges.
  function mosaicGolem(ctx, step, move, attack, recoil, land, t, offset) {
    const brace=attack*.75;
    for(const side of [-1,1]){
      ctx.fillStyle='#777c99';
      ctx.fillRect(side*9-8,7-land*2,17,10);
      poly(ctx,[[side*9-12,16],[side*9+11,16],[side*9+13,21],[side*9-13,21]],
        '#cac2c4','#8d90b0',1);
    }
    ctx.save();ctx.translate(0,-10);ctx.rotate(-step*move*.07+brace*.12);
    poly(ctx,[[-24,-18],[-15,-34],[9,-38],[25,-24],[22,12],[-21,12]],
      '#9c9aba','#ece5d8',2.8);
    poly(ctx,[[-18,-17],[-12,-29],[7,-31],[18,-22],[13,-3],[-16,-2]],
      '#c9c3c9','#f1e9dc',1);
    // One-of-a-kind five-piece marble mosaic, not a repeatable badge.
    for(let i=0;i<5;i++){
      poly(ctx,[[i*7-16,-23],[i*7-10,-27],[i*7-5,-18],[i*7-13,-13]],
        i%2?'#9d8fae':'#e7d8ce','#7b769f',.7);
    }
    poly(ctx,[[17,-21],[29,-17],[32+14*brace,-9],[22,-2]],
      '#a19cb5','#eee7d5',2);
    poly(ctx,[[-23,-18],[-34,-10],[-32,1],[-21,1]],'#9389aa','#efded1',2);
    oval(ctx,9,-22,5,6,'#f8ecda','#9e94b4');
    ctx.fillStyle='#465071';ctx.fillRect(10,-24,3,4);
    if(recoil>.15){
      line(ctx,[[33+brace*12,-8],[37+brace*14,-19]],'#fff1cf',2);
    }
    ctx.restore();
  }

  // Swamp Ferry — BOG LANTERN. Buoyant moss mantle, lantern lure and
  // individually sprung legs. Pulse/burst only on a real attack cue.
  function bogLantern(ctx, step, move, attack, recoil, land, t, offset) {
    const spring=move*(1-attack*.45);
    for(const side of [-1,1]){
      const lift=Math.max(0,step*side)*4*spring;
      const ankleX=side*(12+step*3*spring);
      line(ctx,[[side*11,0],[side*(17+spring*2),8-lift],[ankleX,17-lift]],
        '#5a956f',4);
      oval(ctx,ankleX,19-lift,7,3,'#467d65','#bedc8f');
    }
    const breathe=1+Math.sin(t*1.7+offset)*.018*(1-move);
    ctx.save();ctx.translate(0,-12);ctx.scale(breathe*(1+attack*.075),
      1-attack*.13-land*.13);
    oval(ctx,-2,-7,25,20,'#3f7c64','#a9db95');
    for(let j=0;j<5;j++){
      const angle=(j*1.17+offset*.06);
      oval(ctx,Math.cos(angle)*17-1,Math.sin(angle)*12-10,8,7,
        j%2?'#6a9771':'#84b778');
    }
    const bulb=Math.min(1,.25+attack*.75+recoil*.2);
    oval(ctx,15,-15,8+bulb*3,10+bulb*3,'#e4fca6','#fff3ae');
    oval(ctx,17,-16,4+bulb*2,5+bulb*2,'#fff9da');
    // Organic stalks remain connected to its torso when it swells.
    line(ctx,[[-13,-20],[-19,-33],[-14,-39]],'#a4d989',2);
    line(ctx,[[3,-25],[8,-37],[15,-40]],'#a4d989',2);
    oval(ctx,8,-12,4,5,'#fff3d0','#3e7260');
    ctx.fillStyle='#234840';ctx.fillRect(9,-13,2,3);
    ctx.restore();
    if(recoil>.18)for(let j=0;j<3;j++)
      oval(ctx,24+j*5,-23+j*8,2+recoil*2,2+recoil*2,'#e6feb6');
  }

  // Sunflower Flight — POLLEN DRIFTER. Two independently hinged petal
  // wings bank into the actual swoop. It has no grounded running limbs.
  function pollenDrifter(ctx, step, move, attack, recoil, land, t, offset) {
    const flutter=Math.sin(t*8.1+offset)*(.13+move*.16)*(1-attack*.5);
    for(const side of [-1,1]){
      ctx.save();ctx.translate(side*10,-23);
      ctx.rotate(side*(.29+flutter+attack*.49));
      poly(ctx,[[0,4],[side*25,-23],[side*35,-32],[side*23,-1],[side*8,11]],
        '#eac366','#fff0b6',2);
      poly(ctx,[[side*6,2],[side*25,-22],[side*23,0]],'#f3df92','#f8f3c4',1);
      ctx.restore();
    }
    // Different wing proportions, face, and abdominal lantern from the
    // terrestrial bog-lantern design (no shared character shapes).
    poly(ctx,[[-17,-19],[-5,-35],[15,-30],[24,-12],[15,3],[-13,4]],
      '#c28a46','#fff1b6',2);
    poly(ctx,[[-13,-17],[-3,-28],[13,-23],[18,-11]],'#f8d978','#fff1c8',1.4);
    oval(ctx,6,-17,6,7,'#faffd8','#e1a45e');
    ctx.fillStyle='#474453';ctx.fillRect(9,-18,2,4);
    // Rear pollen sacs pivot with the flyer's direction.
    ctx.save();ctx.translate(-16,-12);ctx.rotate(-flutter*.6);
    oval(ctx,-9,4,12,9,'#9ba85c','#f2db8c');
    oval(ctx,-11,4,5,4,'#fff1b0');
    ctx.restore();
    if(recoil>.12){
      for(let j=0;j<4;j++)
        oval(ctx,-26-j*6,-8+Math.sin(t*6+j)*5,1.5+recoil,2,'#ffed93');
    }
    // Attack tip grows only during windup/impact (no permanent laser).
    if(attack>.1)line(ctx,[[23,-8],[29+attack*9,-5]],'#f7e9ae',2);
  }

  // Starship Cargo — CARGO MIMIC. A heavy box opens four hinged plates
  // into a retracting grapple; stabilizers keep floor contact under recoil.
  function cargoMimic(ctx, step, move, attack, recoil, land, t, offset) {
    const brace=1-Math.min(.8,attack*.7);
    for(const side of [-1,1]){
      const lift=Math.max(0,step*side)*move*brace*3;
      poly(ctx,[[side*11,4],[side*20,6],[side*22,15-lift],
        [side*8,15-lift]],'#6c8294','#d3ece0',1.5);
      line(ctx,[[side*8,18-lift],[side*26,18-lift]],'#b9d4d1',3);
    }
    poly(ctx,[[-24,-32],[19,-32],[27,-23],[27,8],[-22,11],[-28,1]],
      '#52677d','#c9ddd9',2.6);
    poly(ctx,[[-21,-30],[15,-30],[23,-24],[21,-9],[-24,-9]],
      '#8e9ca7','#f0eadd',1.5);
    for(let i=0;i<3;i++)line(ctx,[[-17+i*13,-27],[-13+i*13,-13]],
      '#cfe1df',1.6);
    const hinge=attack*.45;
    ctx.save();ctx.translate(-20,-5);ctx.rotate(-hinge);
    poly(ctx,[[-2,-10],[-10,-13],[-13,7],[-1,10]],'#63798c','#bdc7c0',2);
    ctx.restore();
    ctx.save();ctx.translate(19,-8);ctx.rotate(-hinge);
    poly(ctx,[[0,-10],[15,-12],[17,7],[0,12]],'#63798c','#d9e9dc',2);
    ctx.restore();
    poly(ctx,[[21,-18],[31,-15],[38+attack*14,-7],[23,-4]],
      '#8c9a9b','#e5ecd9',2);
    if(attack>.12)line(ctx,[[38+attack*14,-7],[43+attack*24,-10]],
      '#d4e8e0',4);
    if(recoil>.12)oval(ctx,45+attack*25,-10,3+recoil*3,3+recoil*2,
      '#fff5be');
    oval(ctx,12,-20,5,5,'#a9fff0','#d2ecd8');
    ctx.fillStyle='#173c53';ctx.fillRect(14,-21,2,3);
  }

  const families=Object.freeze({
    20:pixelPhantom,21:mosaicGolem,22:bogLantern,
    23:pollenDrifter,24:cargoMimic
  });

  // Return false for an unknown family so the original game atlas can draw.
  function draw(ctx, world, at, foe, pose={}) {
    const family=families[world];
    if(!family || !ctx || !at || !foe) return false;
    const reduced=Boolean(pose.reduced);
    const move=reduced?0:limit(pose.stride);
    const attack=reduced?0:limit(pose.attack);
    const recoil=reduced?0:limit(pose.recoil);
    const landing=reduced?0:limit(pose.landing);
    const hit=reduced?0:limit(pose.hit);
    const gait=reduced?0:Number(foe._gait)||0;
    const step=reduced?0:Math.sin(gait*(world===20?1.37:world===21?.83:
      world===22?1.05:world===23?1.17:.94));
    const time=reduced?0:Number(pose.clock)||0;
    const offset=Number(foe.offset)||0;
    ctx.save();
    try {
      ctx.translate(at.x,at.y);
      if(pose.faceLeft) ctx.scale(-1,1);
      ctx.lineJoin='round';ctx.lineCap='round';
      // Late-world bodies now react to confirmed hits without leaving
      // their collision position or spawning decorative hit icons.
      ctx.globalAlpha*=1-hit*.17;
      ctx.translate(-hit*2,-hit*.7);
      activeSurfaceWorld=world-20;
      family(ctx,step,move,attack,recoil,landing,time,offset);
    } finally {
      ctx.restore();
    }
    return true;
  }

  window.pawtopiaLateEnemyRigs=Object.freeze({
    draw, families:Object.freeze({
      20:'Pixel Phantom',21:'Mosaic Golem',22:'Bog Lantern',
      23:'Pollen Drifter',24:'Cargo Mimic'
    })
  });
})();
