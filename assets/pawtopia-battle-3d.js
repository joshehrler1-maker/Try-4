
/* Real-time arena scene. Battle rules and saved results live in PawtopiaBattleEngine. */
(() => {
  'use strict';

  const PI=Math.PI, TAU=PI*2;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const colorCache=new Map();
  function rgb(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) hex='#a4b2cb';
    if (!colorCache.has(hex)) colorCache.set(hex,[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255));
    return colorCache.get(hex);
  }
  const identity=()=>[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  function multiply(a,b) {
    const out=Array(16);
    for(let col=0;col<4;col++) for(let row=0;row<4;row++) {
      const j=col*4;
      out[j+row]=a[row]*b[j]+a[row+4]*b[j+1]+a[row+8]*b[j+2]+a[row+12]*b[j+3];
    }
    return out;
  }
  const position=(x,y,z)=>[1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
  const size=(x,y,z)=>[x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1];
  const turnX=a=>{const c=Math.cos(a),s=Math.sin(a);return [1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1];};
  const turnY=a=>{const c=Math.cos(a),s=Math.sin(a);return [c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1];};
  const tilt=a=>{const c=Math.cos(a),s=Math.sin(a);return [c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1];};
  function perspective(aspect) {
    const f=1/Math.tan(.36),near=.1,far=44;
    return [f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)/(near-far),-1, 0,0,2*far*near/(near-far),0];
  }
  function sphere(rows,cols,almond=false) {
    const points=[];
    const vertex=(row,col)=>{
      const a=PI*row/rows,b=TAU*col/cols;
      const p=[Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)];
      if(almond){
        const taper=1-.58*Math.abs(p[0]);
        points.push(p[0],p[1]*taper,p[2],p[0],p[1]/taper,p[2]);
      }else points.push(...p,...p);
    };
    for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
      vertex(y,x);vertex(y+1,x);vertex(y+1,x+1);
      vertex(y,x);vertex(y+1,x+1);vertex(y,x+1);
    }
    return points;
  }
  function plane(){
    return [-1,0,-1,0,1,0, -1,0,1,0,1,0, 1,0,1,0,1,0,
      -1,0,-1,0,1,0, 1,0,1,0,1,0, 1,0,-1,0,1,0];
  }
  function cone() {
    const points=[];
    const vert=(angle,y,rad)=>points.push(Math.cos(angle)*rad,y,Math.sin(angle)*rad,
      Math.cos(angle)*.895,.447,Math.sin(angle)*.895);
    for(let i=0;i<18;i++){
      const a=i*TAU/18,b=(i+1)*TAU/18;
      vert(a,-1,1);vert(b,-1,1);vert((a+b)/2,1,0);
      points.push(0,-1,0,0,-1,0,Math.cos(b),-1,Math.sin(b),0,-1,0,Math.cos(a),-1,Math.sin(a),0,-1,0);
    }
    return points;
  }
  function compile(gl,type,source) {
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));
    return shader;
  }

  const houndStyles=[
    ['Braced trainer','shield',.33,.12,.18,1],['Copper stalker','feint',.28,.17,.29,-1],
    ['Terrier snap','thunder',.24,.22,.32,1],['Garden pouncer','pounce',.36,.12,.20,-1],
    ['Frost glider','wave',.29,.19,.11,1],['Bolt dash','rush',.30,.25,.32,-1],
    ['Iron mauler','maul',.42,.11,.23,1],['Iron spear','lance',.32,.16,.32,-1],
    ['Cryowolf corkscrew','whirl',.31,.21,.27,1],['Brass hammer','maul',.43,.09,.30,-1],
    ['Commander counter','shield',.37,.18,.13,1],['Clockwork comet','comet',.41,.15,.34,-1]
  ];
  function profileFor(actor,foe=false){
    if(foe){
      const [label,technique,spread,depth,crouch,lead]=houndStyles[(actor.rank||1)-1]||houndStyles[0];
      return {label,technique,spread,depth,crouch,lead,reach:1.13+actor.rank*.022,
        arc:.18+actor.rank*.022,speed:1.7+actor.rank*.09,weight:(actor.rank%3-1)*.052,index:actor.rank-1};
    }
    const n=actor.uniq,style=actor.fightingStyle||{},spin=(n*19)%56;
    return {label:style.label||actor.breed,technique:style.technique||'pounce',
      lead:style.lead==='left'?-1:1,spread:.21+(spin%8)*.018,
      depth:.10+((spin*3)%11)*.015,crouch:.055+((n*13)%17)*.012,
      reach:.79+(style.reach||24)*.014,arc:.12+(style.arc||23)*.011,
      speed:1.6+(style.tempo||5)*.09,weight:((spin%9)-4)*.018,index:n};
  }
  function techniquePose(p,style,t,force,power){
    const arc=style.arc, tech=style.technique;
    switch(tech){
      case 'maul': p.paw=force*1.08;p.bend=force*.24;p.lift=force*.15;p.shift+=force*.31;p.overhead=force*.64;break;
      case 'prism': p.paw=force*.73;p.offhand=force*.55;p.lift=force*.29;p.turn=Math.sin(t*TAU)*.34;p.overhead=force*.27;break;
      case 'rush': p.shift+=force*.79;p.bend=force*.45;p.paw=force*.74;p.step=Math.sin(t*TAU*3)*force*.35;break;
      case 'shield': p.shift-=force*.16;p.curl=force*.95;p.paw=force*.43;p.lift=-force*.10;break;
      case 'comet': p.lift=force*(.39+arc);p.paw=force*.72;p.shift+=force*.27;p.overhead=force*.36;break;
      case 'feint': p.z=Math.sin(t*TAU)*force*.32;p.turn=Math.sin(t*TAU)*.36;p.shift+=Math.sin(t*PI*2)*.28*force;p.paw=force*.58;break;
      case 'whirl': p.turn=style.lead*TAU*smooth(t);p.paw=force*.96;p.offhand=force*.45;p.lift=force*.27;break;
      case 'wave': p.turn=Math.sin(t*TAU)*.36;p.paw=force*.88;p.z=Math.sin(t*TAU)*.19;p.offhand=force*.24;break;
      case 'lance': p.shift+=force*.55;p.paw=force*1.17;p.bend=force*.30;p.overhead=force*.21;break;
      case 'thunder': p.paw=force*(.56+.34*Math.sin(t*TAU*2)**2);p.offhand=force*.42*Math.sin(t*TAU*2)**2;p.shift+=force*.24;break;
      default: p.lift=force*(.32+arc*.58);p.shift+=force*.46;p.paw=force*.76;p.step=force*.21;
    }
    p.paw*=power;
    p.overhead+=force*(power-1)*.55;
  }
  function motion(state,t,style,steady) {
    const p={shift:0,lift:0,bend:0,paw:0,offhand:0,curl:0,step:0,turn:0,force:0,eyes:1,
      overhead:0,z:0,stance:style};
    const peak=Math.sin(clamp(t,0,1)*PI), n=style.index;
    if(state==='idle'){
      p.curl=.08+style.crouch*.7;
      p.bend=style.weight*.6;
      if(!steady){p.lift=Math.sin(t*style.speed+n*.2)*.018;p.step=Math.sin(t*style.speed*.5+n)*.02;}
      if(!steady&&(t+n*.12)%5.2>5.04)p.eyes=.12;
      return p;
    }
    if(state==='slipLeft'||state==='slipRight'){
      const direction=state==='slipLeft'?-1:1;
      p.z=direction*.85*peak;p.turn=direction*.32*peak;p.curl=.38*peak;p.step=.32*peak;
    }else if(state==='walk'||state==='run'||state==='approach'){
      p.shift=peak*(state==='run'?.87:.52)*style.reach;
      p.step=Math.sin(t*TAU*(1+n%3*.5))*peak*(state==='walk'?.2:.36);
      p.bend=(.12+style.crouch*.38)*peak;
      p.z=style.weight*peak*2;
    }else if(state==='swipe'||state==='charge'){
      const contact=.40+(n%7)*.012, prep=.19+(n%4)*.019;
      const attack=t<prep?-.36*smooth(t/prep):t<contact?
        mix(-.36,1,smooth((t-prep)/(contact-prep))):1-smooth((t-contact)/(1-contact));
      p.shift=(state==='charge'?1.0:.82)*attack*style.reach;
      techniquePose(p,style,t,Math.max(0,attack),state==='charge'?1.05:.90);
      p.bend+=attack*.12;
      p.force=Math.max(0,attack);
      p.step+=attack*.15;
    }else if(state==='guard'){
      p.curl=peak*(.72+style.crouch*.5);p.bend=(-.13+style.weight)*peak;
      p.shift=-.13*peak;p.lift=-.12*peak;p.force=peak;p.offhand=peak*.24;
    }else if(state==='signature'||state==='ultimate'||state==='cast'){
      const force=peak, power=state==='ultimate'?1.23:1;
      p.shift=.13*peak;p.force=peak;
      techniquePose(p,style,t,force,power);
    }else if(state==='impact'){
      p.shift=-.35*peak*style.reach;p.bend=(-.33-style.crouch*.45)*peak;
      p.turn=-.17*peak*style.lead;p.lift=-.07*peak;p.eyes=1-.7*peak;
    }else if(state==='victory'){
      p.lift=Math.abs(Math.sin(t*PI*2))*(.16+style.arc*.45);
      p.paw=.58+style.depth*.8+.12*peak;p.turn=(.13+style.arc*.31)*Math.sin(t*TAU);p.force=peak;
    }else if(state==='defeat'){
      p.lift=-.43*smooth(t);p.bend=(-.48-style.depth)*smooth(t);p.curl=.4*smooth(t);p.eyes=1-.85*smooth(t);
    }
    return p;
  }
  function create(canvas,stage,{floorOnly=false,chase=false}={}) {
    if(!canvas||!stage)return null;
    let gl;
    try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});}catch{return null;}
    if(!gl)return null;

    const vertex=`
      attribute vec3 point,normal;
      uniform mat4 model,view;
      uniform mat3 orientation;
      varying vec3 n,w,p;
      void main(){
        vec4 pos=model*vec4(point,1.0);
        p=point;n=normalize(orientation*normal);w=pos.xyz;
        gl_Position=view*pos;
      }`;
    const fragment=`
      precision mediump float;
      uniform vec3 base,coatShade;
      uniform vec4 coat;
      uniform float roughness,alpha,glow,stone;
      varying vec3 n,w,p;
      void main(){
        vec3 v=normalize(n);
        vec3 sun=normalize(vec3(-.56,.85,.56));
        vec3 rim=normalize(vec3(.6,.35,-.7));
        vec3 eye=normalize(vec3(0.0,2.4,8.0)-w);
        float diffuse=max(0.0,dot(v,sun));
        float edge=pow(1.0-max(0.0,dot(v,eye)),2.5);
        float highlight=pow(max(0.0,dot(v,normalize(sun+eye))),mix(20.0,75.0,roughness));
        float fiber=sin(p.y*97.0+sin(p.x*63.0)*2.7)*sin(p.z*81.0);
        vec3 light=vec3(.50,.53,.66)+diffuse*vec3(.69,.57,.41);
        vec3 tint=base;
        float bristle=0.0;
        if(coat.x>.5){
          float mark=0.0;
          float twist=sin(p.x*3.0+coat.z)*.6;
          if(coat.y<1.5){
            float wave=sin(p.y*11.0 + p.z*2.3 + 1.9*p.x*p.x + twist + coat.z*.56);
            mark=smoothstep(.34,.97,wave)*(.25+.51*abs(p.x));
          }else if(coat.y<2.5){
            vec2 d=fract(vec2(atan(p.z,p.x)*2.7,p.y*4.1)+vec2(coat.z,.34))-0.5;
            mark=(1.0-smoothstep(.09,.27,length(d*vec2(1.0,1.38))))*.91;
          }else if(coat.y<3.5){
            mark=smoothstep(.45,.86,sin(p.x*3.1+p.y*2.7+coat.z)*cos(p.z*4.0-p.y*1.8));
          }else if(coat.y<4.5){
            mark=smoothstep(.26,.83,p.z*.76-p.y*.40)*.82;
          }else if(coat.y<5.5){
            mark=smoothstep(.19,.88,-p.y*.72+p.x*.12)*.58;
          }else {
            mark=.15+.10*sin(p.y*6.2+p.x*3.2);
          }
          if(coat.w>.5) mark*=.79;
          float grain=sin(p.x*151.0+p.z*103.0+sin(p.y*17.0)*4.0)
            *sin(p.x*137.0+p.z*93.0+p.y*23.0);
          bristle=grain*coat.x;
          tint=mix(base,coatShade,mark);
          if(coat.w>1.5){
            float bib=smoothstep(.36,.89,p.z-p.x*p.x*.68+p.y*.13);
            tint=mix(tint,base*1.18+vec3(.04,.022,.013),bib*.48);
          }
          tint*=.97+bristle*.065;
        }
        vec3 lit=tint*light + vec3(.54,.71,1.0)*max(0.0,dot(v,rim))*edge*.36;
        lit+=vec3(1.0,.85,.66)*highlight*mix(.085,.53,roughness)*(coat.x>.5?.44:1.0);
        lit+=tint*fiber*.020*(1.0-roughness);
        lit+=tint*edge*max(0.0,bristle)*.12;
        if(stone>.5){
          vec2 bricks=w.xz*vec2(1.23,1.42);
          bricks.x+=.5*mod(floor(bricks.y),2.0);
          vec2 tile=fract(bricks);
          vec2 border=min(tile,1.0-tile);
          float surface=smoothstep(.008,.035,min(border.x,border.y));
          float grain=fract(sin(dot(floor(bricks),vec2(13.2,76.1)))*17431.31);
          vec3 slate=mix(vec3(.20,.23,.30),vec3(.37,.41,.49),grain);
          slate+=.047*sin(w.x*59.0+sin(w.z*43.0))*sin(w.z*48.0);
          lit=mix(vec3(.23,.23,.25),slate,surface);
          lit+=vec3(.16,.075,.022)*(1.0-smoothstep(-4.0,2.0,w.x));
          float ring=1.0-smoothstep(.025,.05,abs(length(w.xz*vec2(1.0,1.42))-2.05));
          lit=mix(lit,vec3(.60,.46,.29),ring*.65);
          lit*=mix(.80,1.12,clamp((w.z+2.1)*.18,0.0,1.0));
        }
        gl_FragColor=vec4(clamp(mix(lit,base,glow),0.0,1.0),alpha);
      }`;
    let program;
    try {
      program=gl.createProgram();
      gl.attachShader(program,compile(gl,gl.VERTEX_SHADER,vertex));
      gl.attachShader(program,compile(gl,gl.FRAGMENT_SHADER,fragment));
      gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
    }catch{return null;}
    gl.useProgram(program);
    const uniforms=Object.fromEntries(['model','view','orientation','base','roughness','alpha','glow','stone','coat','coatShade'].map(key=>[key,gl.getUniformLocation(program,key)]));
    const locPoint=gl.getAttribLocation(program,'point'),locNormal=gl.getAttribLocation(program,'normal');
    const meshes={};
    for(const [name,values] of Object.entries({round:sphere(12,19),detail:sphere(8,12),almond:sphere(9,16,true),cone:cone(),plane:plane()})){
      const buffer=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);
      meshes[name]={buffer,length:values.length/6};
    }

    let meshInUse=null,pet=null,foe=null,style=null,petStance=null,foeStance=null,efficient=false,visible=true,raf=0,lost=false,lastFrame=0;
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const tracks={pet:{name:'idle',time:0,duration:1,end:'idle'},foe:{name:'idle',time:0,duration:1,end:'idle'}};
    let impact=null;

    function draw(parent,at,scale,tint,options={}) {
      const {shape='round',rotate=identity(),metal=.12,opacity=1,emit=0,stone=0,coat=null}=options;
      const transform=multiply(multiply(parent,position(...at)),rotate);
      const model=multiply(transform,size(...scale));
      const mesh=meshes[shape==='round'&&efficient?'detail':shape];
      if(mesh!==meshInUse){
        meshInUse=mesh;
        gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);
        gl.enableVertexAttribArray(locPoint);
        gl.vertexAttribPointer(locPoint,3,gl.FLOAT,false,24,0);
        gl.enableVertexAttribArray(locNormal);
        gl.vertexAttribPointer(locNormal,3,gl.FLOAT,false,24,12);
      }
      gl.uniformMatrix4fv(uniforms.model,false,model);
      gl.uniformMatrix3fv(uniforms.orientation,false,[
        transform[0]/scale[0],transform[1]/scale[0],transform[2]/scale[0],
        transform[4]/scale[1],transform[5]/scale[1],transform[6]/scale[1],
        transform[8]/scale[2],transform[9]/scale[2],transform[10]/scale[2]
      ]);
      gl.uniform3fv(uniforms.base,rgb(tint));
      gl.uniform1f(uniforms.roughness,metal);
      gl.uniform1f(uniforms.alpha,opacity);
      gl.uniform1f(uniforms.glow,emit);
      gl.uniform1f(uniforms.stone,stone);
      gl.uniform4fv(uniforms.coat,coat?.params || [0,0,0,0]);
      if(coat)gl.uniform3fv(uniforms.coatShade,rgb(coat.shade));
      gl.drawArrays(gl.TRIANGLES,0,mesh.length);
    }
    function limb(parent,a,b,width,tint,metal=.1,coat=null) {
      const d=b.map((x,i)=>x-a[i]),length=Math.hypot(...d);
      if(length<.001)return;
      const yaw=Math.atan2(d[0],d[2]);
      const pitch=Math.acos(clamp(d[1]/length,-1,1));
      const rotate=multiply(turnY(yaw),turnX(pitch));
      draw(parent,a.map((x,i)=>(x+b[i])*.5),[width,length*.63,width*.92],tint,{rotate,metal,coat,shape:'detail'});
    }

    function world(m,v){
      return [0,1,2].map(i=>m[i]*v[0]+m[i+4]*v[1]+m[i+8]*v[2]+m[i+12]);
    }
    function leg(body,feet,hip,toe,width,color,metal=0,coat=null){
      const a=world(body,hip),b=world(feet,toe);
      const knee=a.map((v,i)=>mix(v,b[i],.54)+(i===2?.10:0));
      limb(identity(),a,knee,width,color,metal,coat);
      limb(identity(),knee,b,width*.82,color,metal,coat);
    }
    function shadow(x,z,lift) {
      const floor=position(x,0,z);
      gl.depthMask(false);
      for(let i=0;i<3;i++)draw(floor,[0,.005+i*.003,0],
        [.93-i*.12,.004,.58-i*.07],'#080e19',{shape:'detail',emit:1,opacity:(.14+i*.10)*(1-clamp(lift,0,.7))});
      gl.depthMask(true);
    }
    function actorMatrices(x,p,direction,scale) {
      const yaw=turnY(direction*(.44+p.turn)), dimensions=size(scale,scale,scale);
      const root=multiply(multiply(multiply(position(x,p.lift-p.stance.crouch,p.z),
        tilt(-p.bend*direction)),yaw),dimensions);
      const feet=multiply(multiply(position(x,p.lift>.04?p.lift:0,p.z),yaw),dimensions);
      return {root,feet};
    }

    const patternTypes={tabby:1,ticked:1,wave:1,spots:2,calico:3,patch:3,point:4,solid:5,smoke:5,curly:6,shag:6};
    function catPaw(root,center,color,coat,fore=false){
      const [x,y,z]=center;
      draw(root,center,fore?[.122,.098,.137]:[.134,.100,.192],color,{coat});
      if(efficient)return;
      for(let i=-1;i<=1;i++){
        draw(root,[x+i*.063,y-(fore?.019:.023),z+(fore?.085:.140)-Math.abs(i)*.014],
          [.039,fore?.052:.051,.062],color,{shape:'detail',coat});
      }
    }
    function catModel(root,feet,a,p,t) {
      const long=a.tail==='plume'||a.ears==='tuft';
      const slim=['large','curl'].includes(a.ears)&&a.tail!=='plume';
      const flatFace=['Persian','Exotic Shorthair','British Shorthair'].includes(a.breed);
      const shape=.93+(a.uniq%8)*.018, fur=a.fur, trim=a.shade, marks=a.marks, jewel=a.color;
      const coat=a.pattern==='skin'?null:{params:[long?1.0:.76,patternTypes[a.pattern]||5,(a.uniq%17)*.43,0],shade:trim};
      const faceCoat=coat?{params:[...coat.params.slice(0,3),1],shade:trim}:null;
      const neutralCoat=coat?{params:[coat.params[0],5,coat.params[2],0],shade:trim}:null;
      const pawColor=a.pattern==='point'&&!['Birman','Snowshoe'].includes(a.breed)?trim:fur;
      const cheekColor=a.pattern==='point'?trim:a.pattern==='skin'?marks:
        ['solid','smoke','shag'].includes(a.pattern)?fur:marks;

      const bodyCoat=coat?{params:[...coat.params.slice(0,3),2],shade:trim}:null;
      draw(root,[0,1.02,.025],[.413*shape,.57,.324],fur,{coat:bodyCoat});
      draw(root,[0,1.39,.065],[long?.373:.296,.237,.272],fur,{coat});
      if(long)draw(root,[0,1.30,.11],[.44,.266,.31],fur,{coat});
      draw(root,[0,1.40,.11],[.356,.066,.299],a.cape,{metal:.28});
      draw(root,[0,1.343,.405],[.063,.074,.035],jewel,{metal:.65});

      draw(root,[0,1.934,.116],[.505*shape,slim?.437:.417,.388],fur,{coat:faceCoat});
      draw(root,[0,1.72,.307],[flatFace?.387:.332,.225,.218],a.pattern==='point'?trim:fur,{coat:faceCoat});
      draw(root,[0,1.685,.442],[.189,.096,.103],cheekColor,{coat:neutralCoat});
      const muzzleZ=flatFace?.493:.535;
      const noseColor=a.pattern==='point'||a.fur==='#30313c'?'#4f3a46':'#8e5660';
      draw(root,[0,1.792,muzzleZ+.096],[.058,.044,.033],noseColor,{shape:'cone',rotate:tilt(PI),metal:.43});
      draw(root,[0,1.742,muzzleZ+.081],[.011,.035,.009],'#674550',{shape:'detail'});
      for(const side of [-1,1]){
        const earX=side*(slim?.397:.366),fold=a.ears==='fold',round=a.ears==='round'||fold;
        const earY=round?2.263:2.365+(a.ears==='large'?.076:0);
        const earHeight=round?.156:a.ears==='large'?.303:.252;
        const earTurn=side*(a.ears==='curl'?-.39:-.225);
        const rotation=tilt(earTurn);
        draw(root,[earX,earY,.043],[round?.144:.144,earHeight,.099],fur,
          {shape:round?'round':'cone',rotate:rotation,coat:neutralCoat});
        draw(root,[earX,earY-.026,.125],[.088,earHeight*.59,.030],
          a.pattern==='point'?trim:'#ad777c',{shape:round?'round':'cone',rotate:rotation});
        if(a.ears==='tuft')draw(root,[earX+side*.025,earY+.21,.021],[.031,.093,.026],trim,
          {shape:'cone',rotate:tilt(earTurn-side*.08),coat:neutralCoat});

        const blink=Math.max(.1,p.eyes),eyeY=1.956+p.step*.07,eyeX=side*.204;
        const eyeAngle=tilt(side*.18),eyeZ=.440;
        draw(root,[eyeX,eyeY,eyeZ],[.134,.082*blink,.068],'#342b35',{shape:'almond',rotate:eyeAngle});
        if(blink>.23){
          draw(root,[eyeX+side*.011,eyeY,eyeZ+.044],[.108,.059*blink,.042],a.eyes,
            {shape:'almond',rotate:eyeAngle,metal:.38});
          draw(root,[eyeX+side*.014,eyeY-.004,eyeZ+.077],[.019,.055*blink,.018],'#171925',
            {shape:'detail',rotate:tilt(side*.07),metal:.42});
          draw(root,[eyeX-side*.009,eyeY+.030,eyeZ+.084],[.013,.014,.008],'#eaf5ff',{shape:'detail',emit:.68});
        }
        draw(root,[side*.102,1.738,muzzleZ],[.126,.083,.088],cheekColor,{coat:neutralCoat});
        draw(root,[side*.087,1.696,muzzleZ+.061],[.047,.010,.009],'#6d5354',
          {shape:'detail',rotate:tilt(side*.29)});
        if(!efficient){
          for(let whisker=0;whisker<3;whisker++){
            const origin=[side*(.108+whisker*.029),1.746-whisker*.019,muzzleZ+.076];
            draw(root,origin,[.008,.009,.006],trim,{shape:'detail'});
            const middle=[side*(.279+whisker*.024),origin[1]+.008+whisker*.015,muzzleZ+.039];
            const tip=[side*(.414+whisker*.032),origin[1]+.042+whisker*.024,muzzleZ-.018];
            const tint=a.pattern==='point'?'#d1bcb3':'#e8d7c4';
            limb(root,origin,middle,.0045,tint);
            limb(root,middle,tip,.0033,tint);
          }
          if(long){
            for(let tuft=0;tuft<2;tuft++)draw(root,[side*(.354+tuft*.027),1.74+tuft*.045,.208+tuft*.008],
              [.095,.15,.126],fur,{shape:'cone',rotate:tilt(side*(2.04+tuft*.16)),coat:neutralCoat});
          }
        }
        const lead=side===p.stance.lead,step=p.step*side;
        const hip=[side*.211,.67,.017];
        const toe=[side*p.stance.spread,.100+Math.max(0,step)*.31,.20+(lead?1:-1)*p.stance.depth+step*.42];
        leg(root,feet,hip,toe,slim?.099:.119,pawColor,.05,neutralCoat);
        catPaw(feet,toe,pawColor,neutralCoat);

        const reach=lead?p.paw:p.offhand, stanceGuard=p.stance.depth*(lead?1:.46), lift=p.overhead*(lead?1:.36);
        const shoulder=[side*.324,1.203,.018];
        const elbow=[side*(.405+reach*.17),.96+reach*.19+p.curl*.19+lift*.52,.16+reach*.21+stanceGuard];
        const hand=[side*(.398+reach*.26),.698+reach*.48+p.curl*.40+lift,.25+reach*.48+stanceGuard];
        limb(root,shoulder,elbow,.109,fur,.05,neutralCoat);
        limb(root,elbow,hand,.094,pawColor,.05,neutralCoat);
        catPaw(root,hand,pawColor,neutralCoat,true);
      }
      if(a.tail!=='none'){
        const count=a.tail==='bob'?2:6,thick=a.tail==='plume'?.131:a.tail==='thick'?.094:.061;
        let last=[-.218,.675,-.226];
        for(let i=1;i<=count;i++){
          const end=[-.231-i*.093,.67+i*.087+.074*Math.sin(t*2.8-i*.50),-.22-i*.073];
          limb(root,last,end,thick*(1-i*.088),i%2===0&&a.pattern==='tabby'?trim:fur,.04,neutralCoat);
          last=end;
        }
        draw(root,last,[thick*.58,thick*.64,thick*.58],fur,{shape:'detail',coat:neutralCoat});
      }
    }
    function houndModel(root,feet,a,p,t) {
      const brass=a.color,iron=a.body,bone=a.metal,led=a.eye;
      const big=a.rank>=9;
      draw(root,[0,.97,0],[.48,.58,.37],iron,{metal:.65});
      draw(root,[0,1.11,.27],[big?.47:.385,.35,.197],brass,{metal:.74});
      draw(root,[0,1.07,.447],[.162,.157,.046],bone,{metal:.82});
      draw(root,[0,1.07,.487],[.088,.085,.038],led,{emit:.68});
      draw(root,[0,1.54,.09],[.322,.19,.295],bone,{metal:.73});
      draw(root,[0,1.82,.13],[.57,.40,.37],iron,{metal:.68});
      draw(root,[0,1.74,.58],[.404,.19,.30],bone,{metal:.82});
      draw(root,[0,1.815,.813],[.14,.094,.068],'#25283c',{metal:.64});
      draw(root,[0,1.654,.755],[.248,.055,.079],'#36304b',{metal:.21});
      for(const side of [-1,1]){
        draw(root,[side*.43,1.97+a.ear*.045,.055],[.126,.233+a.ear*.038,.145],brass,
          {shape:a.ear%2?'round':'cone',rotate:tilt(side*(a.ear%2?.53:-.36)),metal:.63});
        draw(root,[side*.24,1.92,.438],[.17,.105,.075],'#182337',{metal:.77});
        draw(root,[side*.24,1.92,.509],[.116,.045*Math.max(.28,p.eyes),.031],led,{emit:.78});
        draw(root,[side*.32,1.12,.425],[.044,.043,.026],bone,{metal:.83,shape:'detail'});
        const lead=side===p.stance.lead;
        const step=p.step*side;
        const toe=[side*p.stance.spread,.115+Math.max(0,step)*.32,.23+step*.26+(lead?1:-1)*p.stance.depth];
        leg(root,feet,[side*.28,.68,0],toe,.157,iron,.7);
        draw(feet,toe,[.20,.115,.265],bone,{metal:.76});
        const thrust=lead?p.paw:p.offhand;
        const shoulder=[side*.43,1.23,.02];
        draw(root,shoulder,[.22,.226,.225],brass,{metal:.77});
        const elbow=[side*.53,1.00+p.curl*.32+thrust*.28,.10+thrust*.29];
        const fist=[side*(.55+thrust*.15),.71+thrust*.58+p.curl*.42+p.overhead*(lead?1:.3),.25+thrust*.55+p.curl*.29];
        limb(root,shoulder,elbow,.14,iron,.74);
        limb(root,elbow,fist,.16,bone,.78);
        draw(root,fist,[.208,.159,.204],brass,{metal:.79});
      }
      if(big)for(let i=-1;i<=1;i++){
        draw(root,[i*.205,2.228+(i===0?.09:0),.107],[.08,.19,.082],brass,{shape:'cone',metal:.85});
      }
      const tail=[-.49,.80+Math.sin(t*4)*.115,-.53];
      limb(root,[-.22,.76,-.27],tail,.094,brass,.77);
      draw(root,tail,[.112,.104,.105],bone,{metal:.81,shape:'detail'});
    }
    function skillEffect(root,profile,p,action,t) {
      if(p.force<.11)return;
      const cast=['signature','ultimate','cast'].includes(action), guard=action==='guard';
      if(!cast&&!guard)return;
      const tint=guard?'#9ef7df':profile.color;
      const technique=p.stance.technique;
      const wide=action==='ultimate';
      const count=efficient?8:wide?20:13;
      gl.depthMask(false);
      for(let i=0;i<count;i++){
        const a=i*TAU/count+t*3.6, radius=(.39+p.force*.64)*(wide?1.31:1);
        let x=Math.cos(a)*radius,y=(guard?.94:1.46)+Math.sin(a*2)*(.13+p.force*.18);
        let z=.22+Math.sin(a)*radius*.72;
        if(!guard){
          if(technique==='lance'||technique==='rush'){z+=p.force*i/count*.7;x*=.47;}
          else if(technique==='comet'||technique==='maul'){y+=p.force*(i%4)*.16;x*=.66;}
          else if(technique==='whirl'||technique==='wave'){x*=1.24;y-=.21;}
          else if(technique==='prism'||technique==='thunder'){y+=Math.sin(a*6)*.14;}
        }
        draw(root,[x,y,z],
          [.032+p.force*.052,.034+p.force*.038,.049],tint,
          {shape:'detail',opacity:p.force*.83,emit:.9});
      }
      gl.depthMask(true);
    }
    function current(side,now) {
      const tr=tracks[side],dt=Math.max(0,now-tr.time);
      if(tr.name==='idle')return ['idle',now*.001];
      if(tr.end==='victory'&&tr.name==='victory')return ['victory',(dt%1250)/1250];
      if(dt>=tr.duration)return tr.end==='idle'?['idle',now*.001]:[tr.end,1];
      return [tr.name,clamp(dt/tr.duration,0,1)];
    }
    function render(now) {
      raf=0;
      if(lost||!visible||document.hidden)return;
      if(efficient&&now-lastFrame<31){schedule();return;}
      lastFrame=now;
      const width=canvas.clientWidth,height=canvas.clientHeight;
      if(width<2||height<2){if(!floorOnly)schedule();return;}
      const pixel=Math.min(window.devicePixelRatio||1,efficient?1:1.65);
      const w=Math.round(width*pixel),h=Math.round(height*pixel);
      if(w!==canvas.width||h!==canvas.height){canvas.width=w;canvas.height=h;}
      gl.viewport(0,0,w,h);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const ratio=w/h, steady=Boolean(reduced?.matches);
      const after=impact&&!steady?clamp((now-impact.time)/410,0,1):1;
      const kick=Math.sin(after*PI)*.16*(impact?.power?1.55:1);
      const baseView=multiply(position(-kick*.25,-1.42,-Math.max(6.4,8.3/ratio)+kick),turnX(.18));
      const angle=chase?1.00+(steady?0:kick*.25):0;
      const view=chase?multiply(baseView,turnY(angle)):baseView;
      gl.uniformMatrix4fv(uniforms.view,false,multiply(perspective(ratio),view));
      draw(identity(),[0,0,0],[5.5,1,4.4],'#596171',{shape:'plane',stone:1});
      const elapsed=steady?0:now*.001;
      for(const [side,profile,stance,direction] of [['pet',pet,petStance,1],['foe',foe,foeStance,-1]]){
        if(!profile)continue;
        const [action,t]=current(side,now);
        const p=motion(action,t,stance,steady);
        const x=direction*(-1.59+p.shift);
        shadow(x,p.z,p.lift);
        const scale=side==='foe'?profile.size*(profile.rank>=9?1.10:1):.96+(profile.uniq%5)*.018;
        const {root,feet}=actorMatrices(x,p,direction,scale);
        if(side==='pet')catModel(root,feet,profile,p,elapsed);
        else houndModel(root,feet,profile,p,elapsed);
        skillEffect(root,side==='pet'?{color:style?.color||profile.color}:profile,p,action,t);
      }
      if(after<1 && impact){
        const count=efficient?7:15;
        gl.depthMask(false);
        for(let i=0;i<count;i++){
          const a=i*TAU/count, radius=.15+after*(.80+i%3*.21),x=impact.x+Math.cos(a)*radius;
          const y=1.25+Math.sin(a)*radius+after*.25;
          draw(identity(),[x,y,.71+after*.4],[.062,.041,.052],impact.tint,
            {shape:'detail',opacity:1-after,emit:1});
        }
        gl.depthMask(true);
      }
      if(!floorOnly&&(!steady||Object.values(tracks).some(t=>t.name!=='idle'&&now-t.time<t.duration)))schedule();
    }
    function schedule(){
      if(!raf && !lost && visible && !document.hidden)raf=window.requestAnimationFrame(render);
    }
    function pose(side,name,duration=1,end='idle'){
      tracks[side]={name,time:window.performance.now(),duration:Math.max(1,duration),end};
      schedule();
    }
    function roster(cat,enemy,kit,options={}){
      pet=cat;foe=enemy;style=kit?.theme;
      petStance=cat?profileFor(cat):null;
      foeStance=enemy?profileFor(enemy,true):null;
      efficient=options.efficient===true;
      if(options.finished==='win'||options.finished==='loss'){
        const won=options.finished==='win';
        pose('pet',won?'victory':'defeat',1,won?'victory':'defeat');
        pose('foe',won?'defeat':'victory',1,won?'defeat':'victory');
      }else if(!options.busy){
        pose('pet','idle');pose('foe','idle');
      }
      schedule();
    }
    canvas.addEventListener('webglcontextlost',event=>{
      event.preventDefault();
      lost=true;
      if(raf)window.cancelAnimationFrame(raf);
      stage.classList.remove(floorOnly?'battle-has-floor':'battle-has-3d');
    });
    if(typeof IntersectionObserver==='function'){
      new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;schedule();}).observe(stage);
    }
    if(typeof ResizeObserver==='function')new ResizeObserver(schedule).observe(canvas);
    document.addEventListener('visibilitychange',schedule);
    reduced?.addEventListener?.('change',schedule);
    stage.classList.add(floorOnly?'battle-has-floor':'battle-has-3d');
    schedule();
    return {roster,pose,
      active:()=>!lost,
      hit(who,tint,power){impact={time:window.performance.now(),x:who==='pet'?-1.59:1.59,tint,power};schedule();}
    };
  }
  window.PawtopiaBattle3D=Object.freeze({create,profileFor});
})();
