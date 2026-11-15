/* Super Paw Heroes game-specific 2.5D enemy silhouette/motion layer.
 * Games 06–10: original Mist Glider, Lantern Juggler, Flux Beetle,
 * Bass Bouncer and Slate Burrower. Canvas 2D, $0, no external assets.
 * Not actual 3D meshes or a feature-film render. Gameplay controls
 * all positions, hitboxes, projectiles, enemy damage and checkpoints.
 */
(() => {
  'use strict';
  const TAU=Math.PI*2,cap=v=>Math.max(0,Math.min(1,Number(v)||0));
  // Original world-specific directional material shading, no recycled art.
  // Large panels receive a subtle top light; eyes and tiny particles stay flat.
  const surfacePalettes=[["#c9fffd","#1b415d"],["#ffe2b2","#52305d"],["#a7f4ff","#303c75"],["#ffe7ee","#41284d"],["#eee9d1","#3d3b52"]];
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
  function shell(c,pts,fill,line='#f4e7d4',thickness=1.7){
    c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
    for(let j=1;j<pts.length;j++)c.lineTo(pts[j][0],pts[j][1]);
    c.closePath();c.fillStyle=panelFill(c,fill,pts);c.fill();
    c.strokeStyle=line;c.lineWidth=thickness;c.stroke();
  }
  function strand(c,pts,color,width=2){
    c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
    for(let j=1;j<pts.length;j++)c.lineTo(pts[j][0],pts[j][1]);
    c.strokeStyle=color;c.lineWidth=width;c.stroke();
  }
  function oval(c,x,y,rx,ry,fill,line=null){
    c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);
    c.fillStyle=orbFill(c,fill,x,y,rx,ry);c.fill();
    if(line){c.strokeStyle=line;c.lineWidth=1.7;c.stroke();}
  }
  // Waterfall Climb: MIST GLIDER. Completely airborne, a transparent
  // waterfall mantle with two individually flexing airfoils and spray
  // streams. Do not attach fake grounded feet.
  function mistGlider(c,m){
    const flex=m.reduced?0:Math.sin(m.time*5.7+m.offset)*(.16+m.move*.16);
    for(const side of [-1,1]){
      c.save();c.translate(side*11,-21);
      c.rotate(side*(.12+flex+m.attack*.3));
      shell(c,[[0,2],[side*17,-19],[side*39,-27],[side*32,-6],
        [side*17,11]],'#91ddec','#e5ffff',2);
      strand(c,[[0,0],[side*21,-17],[side*34,-25]],'#fff',1.4);
      c.restore();
    }
    shell(c,[[-17,-30],[-6,-41],[8,-38],[21,-25],[20,-3],
      [3,7],[-17,2]],'#4fa7bd','#c9ffff',2.4);
    shell(c,[[-11,-28],[1,-37],[11,-31],[14,-9],[-13,-9]],
      '#afe7eb','#f6ffff',1.1);
    oval(c,10,-23,5.5,6,'#fff9e1','#77bcd0');
    oval(c,12,-23,2,3,'#2c719a');
    // Fluid ribbons stay attached to the back of this flying body.
    const sway=m.reduced?0:Math.sin(m.time*3+m.offset)*3;
    strand(c,[[-13,0],[-21,8],[-25+sway,15]],'#b7f9f5',3);
    strand(c,[[3,7],[0,12],[-3-sway,20]],'#eaffff',2.5);
    if(m.recoil>.1&&!m.reduced){
      oval(c,-31,6,2.2,3,'#f4ffff');
      oval(c,-38,12,1.4,2,'#d8f9ff');
    }
  }
  // Lantern Festival: LANTERN JUGGLER. Dancing silk sleeves and three
  // hanging small lanterns; its hopping stride plants only one paw.
  function lanternJuggler(c,m){
    const hop=m.move*(1-m.attack*.45),stride=m.step*hop;
    for(const side of [-1,1]){
      const lift=Math.max(0,side*stride)*5.5;
      strand(c,[[side*9,0],[side*(13+stride*4),9-lift],
        [side*(14+stride*7),16-lift]],'#984a70',4.5);
      oval(c,side*(14+stride*7),18-lift,8,3.3,'#f5b56c','#8c4c76');
    }
    shell(c,[[-19,-29],[-9,-39],[9,-40],[20,-27],
      [19,7],[-20,7]],'#a75b87','#f2c789',2.4);
    shell(c,[[-15,-23],[-4,-34],[10,-31],[14,-19],
      [11,-7],[-15,-8]],'#e18d9f','#ffebbd',1.4);
    const wave=m.reduced?0:Math.sin(m.time*4+m.offset)*m.move*.18;
    for(const side of [-1,1]){
      c.save();c.translate(side*19,-18);
      c.rotate(side*(.17+wave+m.attack*.36));
      shell(c,[[0,-6],[side*12,-5],[side*20,11],[side*7,14]],
        '#f5bf7c','#fbe6bb',1.5);
      c.restore();
    }
    // Hanging lights swing with the same gait as the sleeves and wrists.
    for(let j=0;j<3;j++){
      const x=-13+j*13,y=-45+(j%2)*5+m.attack*(j-1)*3;
      strand(c,[[x,y+8],[x,y+2]],'#e7bc82',1.4);
      oval(c,x,y+11,4.5,6,j===1?'#ffeaaa':'#f9bc8c','#fff3d1');
    }
    oval(c,10,-27,4.5,5.2,'#fff7d8');
    oval(c,11,-27,1.7,2.4,'#5e436e');
    if(m.recoil>.16&&!m.reduced)strand(c,
      [[26,-12],[33,-15],[41,-9]],'#ffdf9f',2);
  }
  // Crystal Polarity: FLUX BEETLE. Original plated mechanical insect with
  // real walking supports and a visible actuator for polarity dash.
  function fluxBeetle(c,m){
    const movement=m.move*(1-m.attack*.65);
    for(const side of [-1,1]){
      for(let j=0;j<2;j++){
        const phase=Math.sin(m.gait*1.15+j*Math.PI+side)*movement;
        const lift=Math.max(0,phase)*3;
        const x=side*(11+j*8)+phase*5;
        strand(c,[[side*(8+j*8),-3],[x,7-lift],[x+side*3,17-lift]],
          '#595b96',3.8);
        oval(c,x+side*3,18-lift,5.5,2.8,'#bad8f1','#505b99');
      }
    }
    shell(c,[[-24,-15],[-11,-30],[13,-29],[26,-11],
      [18,10],[-17,10]],'#6173b8','#d1ceff',2.3);
    // Upper plate is crystal, lower plate is ferromagnetic.
    shell(c,[[-16,-15],[-7,-29],[12,-26],[18,-12],[1,-4]],
      '#aaa9e9','#f2edff',1.4);
    shell(c,[[-10,-2],[9,-3],[17,8],[-17,8]],
      '#465a99','#b9d7ec',1.2);
    const extension=m.attack*9;
    strand(c,[[17,-13],[22+extension,-11],
      [28+extension,-4]],'#ede3ff',4);
    oval(c,28+extension,-4,4.5,5,'#92f0ff','#f4f2ff');
    oval(c,11,-20,5,5,'#f9f6ff');
    oval(c,13,-20,2,2.5,'#3f4b82');
    // Pole contrast switches only as the attacker telegraphs.
    if(m.recoil>.16&&!m.reduced){
      strand(c,[[35,-11],[42,-14],[45,-6]],'#8efff3',2);
    }
  }
  // Stage Beat: BASS BOUNCER. Ring-drum resonator, independent beat arms,
  // planted flat pads. No shared crystal/lantern geometry from other games.
  function bassBouncer(c,m){
    const stomp=m.attack*.12+m.land*.1;
    const steps=m.move*(1-m.attack*.8);
    for(const side of [-1,1]){
      const y=15-Math.max(0,m.step*side)*steps*4;
      strand(c,[[side*12,-4],[side*16,8],[side*19,y]],
        '#6d477d',5);
      oval(c,side*20,y+2,9,3,'#e6b2cf','#6d477d');
    }
    c.save();c.translate(0,-12);c.scale(1+m.attack*.06,1-stomp);
    oval(c,0,-7,25,26,'#63457d','#fbc7df');
    oval(c,0,-7,19,20,'#b56f9f','#fff0c8');
    oval(c,0,-7,11,12,'#47366e','#f3bfe3');
    oval(c,0,-7,6,7,'#e6ad9c','#fff0dc');
    // The side acoustic hammers respond to actual enemy attack pose.
    for(const side of [-1,1]){
      c.save();c.translate(side*22,-14);
      c.rotate(side*(.13+m.attack*.62));
      strand(c,[[0,0],[side*13,-12]],'#ffc8bd',5);
      oval(c,side*16,-15,8,5,'#a57bbb','#ffe6c7');
      c.restore();
    }
    c.restore();
    // Tightly cropped short soundwave only on firing, no oversized UI ring.
    if(m.recoil>.2&&!m.reduced){
      c.strokeStyle='#ffdfac';c.lineWidth=1.5;c.beginPath();
      c.arc(0,-19,28+m.recoil*7,-.75,.75);c.stroke();
    }
  }
  // Quarry Rescue: SLATE BURROWER. Layered grounded quarry plates and
  // twin drill manipulators. Turret pattern remains entirely fixed in physics.
  function slateBurrower(c,m){
    // Turret enemies are never given a fake walking-in-place gait.
    shell(c,[[-27,13],[-20,3],[18,3],[27,13],
      [24,20],[-26,20]],'#666270','#d6c4ab',2.3);
    for(let j=0;j<4;j++){
      shell(c,[[-22+j*2,-27+j*7],[-5+j*3,-35+j*7],
        [17+j*2,-30+j*7],[21+j,-19+j*7],
        [-18+j,-17+j*7]],j%2?'#a29b91':'#8e8b90',
        '#e0d5b9',1.3);
    }
    const drill=m.attack*15;
    for(const side of [-1,1]){
      c.save();c.translate(side*19,-9);
      c.rotate(side*(.12+m.attack*.2));
      shell(c,[[0,-5],[side*7,-9],[side*(16+drill),0],
        [side*7,8]],'#6a6878','#e7d8b7',1.6);
      for(let j=0;j<2;j++)strand(c,
        [[side*(9+j*5),-3],[side*(9+j*5),4]],'#d6bb93',1.3);
      c.restore();
    }
    oval(c,12,-15,5,5,'#f1e5c3');
    oval(c,13,-15,2,2.6,'#676079');
    if(m.recoil>.12&&!m.reduced){
      for(let j=0;j<3;j++)oval(c,29+j*4,4+(j%2)*4,2.5,1.7,
        '#d2b18e');
    }
  }
  const designs=Object.freeze({
    5:mistGlider,6:lanternJuggler,7:fluxBeetle,
    8:bassBouncer,9:slateBurrower
  });
  function draw(ctx,index,at,foe,pose={}){
    const design=designs[index];
    if(!design||!ctx||!at||!foe)return false;
    const reduced=Boolean(pose.reduced),gait=reduced?0:Number(foe._gait)||0;
    const m={
      reduced,
      move:reduced?0:cap(pose.stride),
      attack:reduced?0:cap(pose.attack),
      recoil:reduced?0:cap(pose.recoil),
      land:reduced?0:cap(pose.landing),
      time:reduced?0:Number(pose.clock)||0,
      offset:Number(foe.offset)||0,
      gait,
      step:reduced?0:Math.sin(gait*[1.03,.85,1.18,1.3,.7][index-5]),
      hit:reduced?0:cap(pose.hit),
      airborne:Boolean(pose.airborne)
    };
    ctx.save();
    try{
      ctx.translate(at.x,at.y);
      if(pose.faceLeft)ctx.scale(-1,1);
      ctx.lineJoin='round';ctx.lineCap='round';
      // Maintain compositing of the independently drawn defeat fade.
      const originalOpacity=Number.isFinite(ctx.globalAlpha)?ctx.globalAlpha:1;
      ctx.globalAlpha=originalOpacity*(1-m.hit*.2);
      ctx.translate(-m.hit*1.7,0);
      activeSurfaceWorld=index-5;
      design(ctx,m);
    }finally{ctx.restore();}
    return true;
  }
  window.pawtopiaFiveEnemyRigs=Object.freeze({
    draw,
    families:Object.freeze({
      5:'Mist Glider',6:'Lantern Juggler',7:'Flux Beetle',
      8:'Bass Bouncer',9:'Slate Burrower'
    })
  });
})();
