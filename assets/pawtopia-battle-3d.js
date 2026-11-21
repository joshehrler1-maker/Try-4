
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
  function sphere(rows,cols) {
    const points=[];
    const vertex=(row,col)=>{
      const a=PI*row/rows,b=TAU*col/cols;
      const p=[Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)];
      points.push(...p,...p);
    };
    for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){
      vertex(y,x);vertex(y+1,x);vertex(y+1,x+1);
      vertex(y,x);vertex(y+1,x+1);vertex(y,x+1);
    }
    return points;
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
  function motion(state,t,profile,foe,steady) {
    const p={shift:0,lift:0,bend:0,paw:0,curl:0,step:0,turn:0,force:0,eyes:1};
    const peak=Math.sin(clamp(t,0,1)*PI), n=profile?.uniq ?? profile?.rank ?? 0;
    const reach=foe?1.25:1+((profile?.choreography?.reach||13)-13)/75;
    if(state==='idle') {
      if(!steady){p.lift=Math.sin(t*2.9+n*.2)*.033;p.step=Math.sin(t*2.1+n)*.02;}
      if(!steady && (t+n*.12)%5.2>5.04)p.eyes=.12;
      return p;
    }
    if(state==='walk'||state==='run'||state==='approach'){
      p.shift=peak*(state==='run'?.87:.52);
      p.step=Math.sin(t*TAU*2)*peak*(state==='walk'?.2:.36);
      p.lift=Math.abs(p.step)*.48;
      p.bend=.18*peak;
    }else if(state==='swipe'||state==='charge'){
      const attack=t<.24?-.36*smooth(t/.24):t<.43?mix(-.36,1,smooth((t-.24)/.19)):1-smooth((t-.43)/.57);
      p.shift=(state==='charge'?1.38:1.04)*attack*reach;
      p.paw=attack;p.bend=attack*.23;p.turn=attack*.25;p.force=Math.max(0,attack);
      p.step=attack*.15;
    }else if(state==='guard'){
      p.curl=peak;p.bend=-.25*peak;p.shift=-.13*peak;p.lift=-.16*peak;p.force=peak;
    }else if(state==='signature'||state==='ultimate'||state==='cast'){
      p.paw=peak*.9;p.curl=peak*.3;p.lift=peak*(state==='ultimate'?.51:.35);
      p.turn=Math.sin(t*TAU)*(.16+n%5*.055);
      p.bend=-.19*peak;p.shift=peak*(n%3===0?.42:.13);p.force=peak;
    }else if(state==='impact'){
      p.shift=-.43*peak;p.bend=-.48*peak;p.turn=-.17*peak;p.lift=-.08*peak;p.eyes=1-.7*peak;
    }else if(state==='victory'){
      p.lift=Math.abs(Math.sin(t*PI*2))*.4;p.paw=.78+.12*peak;p.turn=.22*Math.sin(t*TAU);p.force=peak;
    }else if(state==='defeat'){
      p.lift=-.55*smooth(t);p.bend=-.77*smooth(t);p.curl=.4*smooth(t);p.eyes=1-.85*smooth(t);
    }
    return p;
  }
  function create(canvas,stage) {
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
      uniform vec3 base;
      uniform float roughness,alpha,glow;
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
        vec3 lit=base*light + vec3(.54,.71,1.0)*max(0.0,dot(v,rim))*edge*.36;
        lit+=vec3(1.0,.85,.66)*highlight*mix(.11,.53,roughness);
        lit+=base*fiber*.025*(1.0-roughness);
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
    const uniforms=Object.fromEntries(['model','view','orientation','base','roughness','alpha','glow'].map(key=>[key,gl.getUniformLocation(program,key)]));
    const locPoint=gl.getAttribLocation(program,'point'),locNormal=gl.getAttribLocation(program,'normal');
    const meshes={};
    for(const [name,values] of Object.entries({round:sphere(12,19),detail:sphere(8,12),cone:cone()})){
      const buffer=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);
      meshes[name]={buffer,length:values.length/6};
    }

    let meshInUse=null,pet=null,foe=null,style=null,efficient=false,visible=true,raf=0,lost=false,lastFrame=0;
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const tracks={pet:{name:'idle',time:0,duration:1,end:'idle'},foe:{name:'idle',time:0,duration:1,end:'idle'}};
    let impact=null;

    function draw(parent,at,scale,tint,options={}) {
      const {shape='round',rotate=identity(),metal=.12,opacity=1,emit=0}=options;
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
      gl.drawArrays(gl.TRIANGLES,0,mesh.length);
    }
    function limb(parent,a,b,width,tint,metal=.1) {
      const d=b.map((x,i)=>x-a[i]),length=Math.hypot(...d);
      if(length<.001)return;
      const yaw=Math.atan2(d[0],d[2]);
      const pitch=Math.acos(clamp(d[1]/length,-1,1));
      const rotate=multiply(turnY(yaw),turnX(pitch));
      draw(parent,a.map((x,i)=>(x+b[i])*.5),[width,length*.63,width*.92],tint,{rotate,metal,shape:'detail'});
    }
    function shadow(x,lift,foeSide) {
      const floor=position(x,0,.01);
      gl.depthMask(false);
      for(let i=0;i<3;i++)draw(floor,[0,.018+i*.004,0],
        [.91-i*.13,.007,.55-i*.07],'#080e19',{shape:'detail',emit:1,opacity:(.14+i*.09)*(1-clamp(lift,0,.7))});
      gl.depthMask(true);
      draw(floor,[0,-.07,.01],[foeSide?1.21:1.12,.065,.72],'#34485e',{metal:.37});
      draw(floor,[0,-.027,0],[foeSide?1.02:.92,.022,.61],foeSide?'#845d49':'#3f687d',{metal:.65});
    }
    function actorMatrix(x,p,direction,scale) {
      return multiply(multiply(multiply(position(x,p.lift,0),tilt(-p.bend*direction)),
        turnY(direction*(.39+p.turn))),size(scale,scale,scale));
    }
    function catModel(root,a,p,t) {
      const long=a.tail==='plume'||a.ears==='tuft';
      const slim=['large','curl'].includes(a.ears)&&a.tail!=='plume';
      const shape=.94+(a.uniq%8)*.018, fur=a.fur, trim=a.shade, marks=a.marks, jewel=a.color;
      draw(root,[0,.99,0],[.44*shape,.59,.32],fur);
      draw(root,[0,.90,.23],[.34,.40,.13],a.pattern==='point'?fur:marks);
      if(long)draw(root,[0,1.31,.08],[.54,.28,.37],fur);
      draw(root,[0,1.39,.10],[.43,.090,.36],a.cape,{metal:.36});
      draw(root,[0,1.33,.44],[.094,.115,.043],jewel,{metal:.72});
      draw(root,[0,1.93,.10],[.58*shape,slim?.51:.48,.42],fur);
      draw(root,[0,1.74,.31],[.46,.25,.30],a.pattern==='point'?trim:fur);
      for(const side of [-1,1]){
        const earX=side*(slim?.445:.411),fold=a.ears==='fold',round=a.ears==='round'||fold;
        const earY=round?2.29:2.43+(a.ears==='large'?.08:0);
        const earHeight=round?.17:a.ears==='large'?.32:.28;
        const rotation=tilt(side*(a.ears==='curl'?-.46:-.23));
        draw(root,[earX,earY,.05],[.16,earHeight,.11],fur,{shape:round?'round':'cone',rotate:rotation});
        draw(root,[earX,earY-.015,.145],[.094,earHeight*.64,.039],
          a.pattern==='point'?trim:'#ce8d8e',{shape:round?'round':'cone',rotate:rotation});
        if(a.ears==='tuft')draw(root,[earX+side*.025,earY+.23,.024],[.042,.108,.029],trim,{shape:'cone',rotate:rotation});
        const eyeY=1.96+p.step*.15,eyeX=side*.235, blink=p.eyes;
        draw(root,[eyeX,eyeY,.445],[.166,.182*blink,.085],'#241d30');
        draw(root,[eyeX,eyeY+.01,.505],[.143,.153*blink,.054],'#fff1dd');
        draw(root,[eyeX+.028,eyeY+.006,.544],[.092,.119*blink,.027],a.eyes,{metal:.47});
        draw(root,[eyeX+.035,eyeY+.005,.565],[.045,.084*blink,.015],'#191626',{metal:.7});
        if(blink>.35)draw(root,[eyeX+.008,eyeY+.067,.58],[.026,.026,.012],'#fffaf6',{shape:'detail',emit:.68});
        draw(root,[side*.132,1.744,.537],[.13,.102,.078],a.pattern==='point'?a.shade:'#f2d1b8');
        const hip=[side*.235,.69,.04],toe=[side*.29,p.step*side*.43+.118,.21+p.step*side*.29];
        limb(root,hip,toe,slim?.117:.144,a.pattern==='point'?trim:fur);
        draw(root,toe,[.161,.110,.252],a.pattern==='point'?trim:fur);
        const reach=(side===1?Math.max(0,p.paw):-.1*Math.max(0,p.paw));
        const shoulder=[side*.365,1.2,.02];
        const elbow=[side*(.49+reach*.18),.91+reach*.26+p.curl*.21,.15+reach*.25+p.curl*.15];
        const hand=[side*(.46+reach*.31),.59+reach*.63+p.curl*.53,.23+reach*.47+p.curl*.25];
        limb(root,shoulder,elbow,.117,fur);
        limb(root,elbow,hand,.111,a.pattern==='point'?trim:fur);
        draw(root,hand,[.156,.143,.156],fur);
        if(long)draw(root,[side*.36,1.73,.24],[.152,.19,.18],fur,{rotate:tilt(-side*.46)});
        if(a.pattern==='tabby'||a.pattern==='ticked'||a.pattern==='wave'){
          for(let n=0;n<3;n++) draw(root,[side*(.33+(n%2)*.025),1.84+n*.113,.41],
            [.065,.027,.021],trim,{rotate:tilt(side*.4),shape:'detail'});
        }
        if(a.pattern==='spots'||a.pattern==='calico'||a.pattern==='patch'){
          for(let n=0;n<3;n++)draw(root,[side*(.22+n*.058),1.13-n*.107,.269],
            [a.pattern==='spots'?.061:.095,.044+n*.009,.052],trim,{shape:'detail'});
        }
      }
      draw(root,[0,1.805,.605],[.071,.046,.045],'#84545e',{metal:.42});
      draw(root,[0,1.685,.579],[.09,.024,.018],'#583745',{shape:'detail'});
      if(a.pattern==='calico'||a.pattern==='patch')draw(root,[-.31,2.15,.389],[.125,.115,.042],trim,{shape:'detail'});
      if(a.tail!=='none'){
        const count=a.tail==='bob'?2:5,thick=a.tail==='plume'?.145:a.tail==='thick'?.105:.07;
        let last=[-.226,.66,-.19];
        for(let i=1;i<=count;i++){
          const end=[-.24-i*.108,.66+i*.105+.093*Math.sin(t*2.9-i*.53),-.19-i*.087];
          limb(root,last,end,thick*(1-i*.095),i%2===0&&a.pattern==='tabby'?trim:fur);
          last=end;
        }
        draw(root,last,[thick*.65,thick*.77,thick*.65],fur,{shape:'detail'});
      }
    }
    function houndModel(root,a,p,t) {
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
        const toe=[side*.309,.125+p.step*side*.34,.23+p.step*side*.23];
        limb(root,[side*.28,.68,0],toe,.16,iron,.7);
        draw(root,toe,[.20,.115,.265],bone,{metal:.76});
        const thrust=side===1?Math.max(0,p.paw):0;
        const shoulder=[side*.43,1.23,.02];
        draw(root,shoulder,[.22,.226,.225],brass,{metal:.77});
        const elbow=[side*.53,1.00+p.curl*.32+thrust*.28,.10+thrust*.29];
        const fist=[side*(.55+thrust*.15),.64+thrust*.7+p.curl*.55,.25+thrust*.55+p.curl*.29];
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
      const wide=action==='ultimate';
      const count=efficient?8:wide?20:13;
      gl.depthMask(false);
      for(let i=0;i<count;i++){
        const a=i*TAU/count+t*3.6, radius=(.39+p.force*.64)*(wide?1.31:1);
        const y=(guard?.94:1.46)+Math.sin(a*2)*(.13+p.force*.18);
        draw(root,[Math.cos(a)*radius,y,.22+Math.sin(a)*radius*.72],
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
      if(width<2||height<2){schedule();return;}
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
      const view=multiply(position(-kick*.25,-1.42,-Math.max(6.4,8.3/ratio)+kick),turnX(.095));
      gl.uniformMatrix4fv(uniforms.view,false,multiply(perspective(ratio),view));
      const elapsed=steady?0:now*.001;
      for(const [side,profile,direction] of [['pet',pet,1],['foe',foe,-1]]){
        if(!profile)continue;
        const [action,t]=current(side,now);
        const p=motion(action,t,profile,side==='foe',steady);
        const x=direction*(-1.59+p.shift);
        shadow(x,p.lift,side==='foe');
        const scale=side==='foe'?profile.size*(profile.rank>=9?1.10:1):.96+(profile.uniq%5)*.018;
        const root=actorMatrix(x,p,direction,scale);
        if(side==='pet')catModel(root,profile,p,elapsed);
        else houndModel(root,profile,p,elapsed);
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
      if(!steady||Object.values(tracks).some(t=>t.name!=='idle'&&now-t.time<t.duration))schedule();
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
      stage.classList.remove('battle-has-3d');
    });
    if(typeof IntersectionObserver==='function'){
      new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;schedule();}).observe(stage);
    }
    if(typeof ResizeObserver==='function')new ResizeObserver(schedule).observe(canvas);
    document.addEventListener('visibilitychange',schedule);
    reduced?.addEventListener?.('change',schedule);
    stage.classList.add('battle-has-3d');
    return {roster,pose,
      active:()=>!lost,
      hit(who,tint,power){impact={time:window.performance.now(),x:who==='pet'?-1.59:1.59,tint,power};schedule();}
    };
  }
  window.PawtopiaBattle3D=Object.freeze({create});
})();
