/* Super Paw Heroes — original experimental 3D enemy meshes for games 1–5.
 * Real lit triangular geometry in WebGL 1; no CDN, textures or paid service.
 * Preview lab ONLY; not yet part of the 2.5D game or feature-film-quality.
 */
(function(root){'use strict';
const TAU=Math.PI*2;
const bound=x=>Math.max(0,Math.min(1,Number(x)||0));
function I(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
function mul(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let y=0;y<4;y++)for(let k=0;k<4;k++)r[c*4+y]+=a[k*4+y]*b[c*4+k];return r;}
function pos(x,y,z){const m=I();m[12]=x;m[13]=y;m[14]=z;return m;}
function size(x,y,z){const m=I();m[0]=x;m[5]=y;m[10]=z;return m;}
function rx(a){const m=I(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m;}
function ry(a){const m=I(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m;}
function rz(a){const m=I(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m;}
function perspective(aspect){const m=new Float32Array(16),f=1/Math.tan(Math.PI/6),n=.1,far=40;m[0]=f/aspect;m[5]=f;m[10]=(far+n)/(n-far);m[11]=-1;m[14]=2*far*n/(n-far);return m;}
function rgb(str){const n=parseInt(str.slice(1),16);return new Float32Array([(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]);}
function box(){const p=[],n=[],idx=[];for(const [norm,verts] of [
[[1,0,0],[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]]],
[[-1,0,0],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]]],
[[0,1,0],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]]],
[[0,-1,0],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]]],
[[0,0,1],[[1,-1,1],[1,1,1],[-1,1,1],[-1,-1,1]]],
[[0,0,-1],[[-1,-1,-1],[-1,1,-1],[1,1,-1],[1,-1,-1]]]
]){const a=p.length/3;for(const vertex of verts){p.push(...vertex);n.push(...norm);}idx.push(a,a+1,a+2,a,a+2,a+3);}
return {p,n,idx};}
function sphere(rows=12,cols=16){const p=[],n=[],idx=[];for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){const a=y/rows*Math.PI,b=x/cols*TAU;const v=[Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)];p.push(...v);n.push(...v);}
for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+cols+1;idx.push(a,a+1,b,a+1,b+1,b);}
return {p,n,idx};}
function cone(sides=16,tip=.05){const p=[],n=[],idx=[];for(let i=0;i<=sides;i++){const a=i/sides*TAU,c=Math.cos(a),s=Math.sin(a),v=[c,.7,s];p.push(c*tip,1,s*tip,c,-1,s);n.push(...v,...v);}
for(let i=0;i<sides;i++){const a=i*2;idx.push(a,a+1,a+2,a+2,a+1,a+3);}
return {p,n,idx};}
const meshes=Object.freeze({box:box(),orb:sphere(),rod:cone(16,1),spike:cone()});
const models=Object.freeze([
{game:'Ember Foundry',enemy:'Cinder Tongs',main:'#97515b',light:'#f4b879',dark:'#58434b'},
{game:'Moonlit Library',enemy:'Atlas Warden',main:'#6a699c',light:'#ddd3c7',dark:'#4c507f'},
{game:'Coral Courier',enemy:'Reef Skimmer',main:'#399d9e',light:'#90dfc6',dark:'#357b94'},
{game:'Clocktower Relay',enemy:'Pendulum Sentinel',main:'#99774b',light:'#e6cd96',dark:'#594d66'},
{game:'Seed Garden',enemy:'Thorn Hopper',main:'#6b9b61',light:'#bada86',dark:'#466d4c'}
]);
function build(index,mode='idle',t=0,reduced=false){
if(!Number.isInteger(index)||index<0||index>4)throw Error('Unknown 3D enemy');
t=reduced?0:Math.max(0,t);const m=models[index],out=[];
const moving=mode==='move'&&!reduced,attacking=mode==='attack'&&!reduced;
const step=moving?Math.sin(t*6):0,strike=attacking?.5+.5*Math.sin(t*5):0;
const bob=moving?Math.abs(step)*.08:reduced?0:Math.sin(t*1.6)*.025;
const hit=mode==='hit'&&!reduced?Math.max(0,1-t/.7):0;
const fall=mode==='defeat'&&!reduced?bound(t/1.2):0;
const P=(type,x,y,z,sx,sy,sz,color,tilt=0)=>
out.push({type,position:[x,y,z],scale:[sx,sy,sz],color,tilt});
if(index===0){
for(const side of [-1,1]){const lift=Math.max(0,side*step)*.17;
P('rod',side*.44,-.65+lift,0,.16,.47,.17,m.dark);
P('orb',side*.44,-1.16+lift,.17,.29,.11,.3,m.light);}
P('box',0,.08+bob,0,.8,.8,.5,m.main);
P('orb',0,.9+bob,0,.46,.43,.42,m.main);
P('orb',.1,1+bob,.4,.16,.13,.075,'#fff2d9');
P('box',0,.06+bob,.52,.38,.24,.06,m.light);
P('rod',.89,-.01+bob,.16,.14,.65,.14,m.dark,-.7-strike*.3);
P('spike',1.46,.19+bob,.16,.12,.45,.12,m.light,-1.1-strike*.28);
P('spike',1.43,-.27+bob,.16,.12,.45,.12,m.light,2.1+strike*.28);
P('rod',-.85,-.12+bob,.08,.14,.46,.16,m.dark,.5);
}else if(index===1){
for(const side of [-1,1]){const lift=Math.max(0,side*step)*.12;P('rod',side*.43,-.68+lift,0,.15,.43,.15,m.dark);P('box',side*.43,-1.14+lift,.15,.25,.13,.31,m.light);}
P('box',0,.21+bob,0,.67,.96,.4,m.main);
P('box',0,.2+bob,.45,.6,.81,.07,m.light);
P('orb',0,1.11+bob,0,.34,.36,.36,m.dark);
P('orb',.14,1.13+bob,.29,.11,.09,.05,'#fff9e2');
P('box',-.94,.29+bob,0,.42,.68,.065,m.light,-strike*.47);
P('box',.94,.29+bob,0,.42,.68,.065,m.light,strike*.55);
P('box',1.37,-.22+bob,.2,.1,.59,.07,m.dark,-strike*.7);
}else if(index===2){
const y=.16+bob+Math.sin(t*3)*.12;
P('orb',0,y,0,1,.55,.5,m.main);
P('orb',.74,y+.07,.1,.38,.35,.38,m.light);
P('orb',.86,y+.14,.47,.12,.12,.08,'#fff8df');
P('spike',-.23,y+.53,-.1,.29,.58,.15,m.light,.28+strike*.12);
P('spike',.23,y+.51,.1,.23,.46,.14,m.dark,-.28);
P('box',-1.15,y,0,.28,.51,.1,m.light,Math.sin(t*5)*.28);
P('spike',-.39,y-.25,.47,.2,.55,.13,m.light,.67);
P('spike',.35,y-.17,-.43,.22,.49,.1,m.dark,-.59);
}else if(index===3){
for(const side of [-1,1]){const lift=Math.max(0,side*step)*.14;P('rod',side*.4,-.74+lift,0,.15,.36,.15,m.dark);P('orb',side*.4,-1.14+lift,.12,.25,.13,.29,m.light);}
P('rod',0,.11+bob,0,.71,.88,.59,m.main);
P('orb',0,1.05+bob,0,.44,.45,.42,m.dark);
P('orb',0,.13+bob,.64,.54,.54,.08,m.light);
P('box',0,.24+bob,.73,.05,.28,.035,m.dark,-.45);
P('box',.06,.12+bob,.73,.23,.05,.032,m.dark,strike*.15);
P('rod',.88,.19+bob,0,.11,.65,.11,m.light,-.5-strike*.8);
P('box',1.33,-.31+bob+strike*.22,0,.33,.22,.26,m.dark,-strike*.7);
P('rod',-.76,.62+bob,0,.1,.35,.11,m.light,.25);
}else{
const jump=moving?Math.abs(step)*.2:0,y=bob+jump-strike*.11;
for(const side of [-1,1]){const lift=Math.max(0,side*step)*.18;P('rod',side*.47,-.65+y+lift,0,.16,.49,.17,m.dark,side*.13);P('orb',side*.56,-1.13+y+lift,.1,.31,.16,.31,m.light);}
P('orb',0,-.02+y,0,.88,.68,.59,m.main);
P('orb',0,.46+y,.23,.61,.44,.44,m.light);
P('orb',.26,.49+y,.56,.13,.13,.075,'#fff5df');
P('spike',-.71,.62+y,-.09,.28,.77,.16,m.light,-.49-strike*.4);
P('spike',.62,.67+y,-.11,.27,.71,.16,m.main,.42+strike*.4);
for(let k=0;k<3;k++)P('spike',-.49+k*.45,.75+y,0,.1,.26,.11,m.dark,(k-1)*.15);
}
return {game:m.game,enemy:m.enemy,parts:out,hit,fall};
}
const VSH='attribute vec3 aPos;attribute vec3 aNormal;uniform mat4 uMvp;uniform mat4 uModel;varying vec3 vNorm;varying vec3 vWorld;void main(){vec4 p=uModel*vec4(aPos,1.0);vWorld=p.xyz;vNorm=normalize(mat3(uModel)*aNormal);gl_Position=uMvp*vec4(aPos,1.0);}';
const FSH='precision mediump float;uniform vec3 uColor;varying vec3 vNorm;varying vec3 vWorld;void main(){vec3 n=normalize(vNorm);vec3 l=normalize(vec3(-0.43,0.8,1.1));float d=max(0.0,dot(n,l));vec3 v=normalize(vec3(0.0,1.0,8.0)-vWorld);float rim=pow(1.0-max(0.0,dot(n,v)),2.0);vec3 color=uColor*(0.36+0.64*d)+vec3(0.20)*rim*0.23;gl_FragColor=vec4(sqrt(color),1.0);}';
function compile(gl,type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){const msg=gl.getShaderInfoLog(sh);throw Error('WebGL shader failed: '+msg);}return sh;}
function init(canvas){
const gl=canvas.getContext('webgl',{antialias:true,alpha:false,depth:true})||canvas.getContext('experimental-webgl',{antialias:true,alpha:false,depth:true});
if(!gl)throw Error('WebGL unavailable. The regular 2D Games Room is unaffected.');
const program=gl.createProgram(),v=compile(gl,gl.VERTEX_SHADER,VSH),f=compile(gl,gl.FRAGMENT_SHADER,FSH);
gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);
if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
gl.deleteShader(v);gl.deleteShader(f);gl.useProgram(program);
const loc={p:gl.getAttribLocation(program,'aPos'),n:gl.getAttribLocation(program,'aNormal'),
mvp:gl.getUniformLocation(program,'uMvp'),model:gl.getUniformLocation(program,'uModel'),color:gl.getUniformLocation(program,'uColor')};
const gpu={};
for(const [key,mesh] of Object.entries(meshes)){
const p=gl.createBuffer(),n=gl.createBuffer(),idx=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(mesh.p),gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(mesh.n),gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,idx);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(mesh.idx),gl.STATIC_DRAW);
gpu[key]={p,n,idx,count:mesh.idx.length};
}
gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
gl.clearColor(.04,.08,.16,1.0);
const drawPart=(v,view)=>{
const world=mul(pos(...v.position),mul(rz(v.tilt||0),size(...v.scale)));
const g=gpu[v.type];
gl.uniformMatrix4fv(loc.model,false,world);gl.uniformMatrix4fv(loc.mvp,false,mul(view,world));gl.uniform3fv(loc.color,rgb(v.color));
gl.bindBuffer(gl.ARRAY_BUFFER,g.p);gl.enableVertexAttribArray(loc.p);gl.vertexAttribPointer(loc.p,3,gl.FLOAT,false,0,0);
gl.bindBuffer(gl.ARRAY_BUFFER,g.n);gl.enableVertexAttribArray(loc.n);gl.vertexAttribPointer(loc.n,3,gl.FLOAT,false,0,0);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.idx);gl.drawElements(gl.TRIANGLES,g.count,gl.UNSIGNED_SHORT,0);
};
function render(index,mode='idle',time=0,angle=-.3,reduced=false){
const sizeX=Math.max(1,Math.min(1200,Math.round((canvas.clientWidth||800)*Math.min(2,root.devicePixelRatio||1))));
const sizeY=Math.round(sizeX*.6);
if(canvas.width!==sizeX||canvas.height!==sizeY){canvas.width=sizeX;canvas.height=sizeY;}
gl.viewport(0,0,sizeX,sizeY);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
const view=mul(perspective(sizeX/sizeY),mul(pos(0,-.07,-8),mul(ry(angle),rx(-.08))));
drawPart({type:'box',position:[0,-1.37,0],scale:[2,.12,1.2],color:'#293a55',tilt:0},view);
drawPart({type:'orb',position:[0,-1.21,-.1],scale:[.93,.02,.55],color:'#172b40',tilt:0},view);
const sample=build(index,mode,time,reduced);
for(const p of sample.parts){const v={...p,position:[p.position[0],p.position[1]-sample.fall*.23,p.position[2]],
tilt:p.tilt+(mode==='defeat'?sample.fall*.33:0),scale:p.scale.map((x,i)=>x*(1-sample.fall*(i===1?.35:.1)))};
drawPart(v,view);}
return {game:sample.game,enemy:sample.enemy,meshes:sample.parts.length};
}
function dispose(){for(const g of Object.values(gpu))for(const key of ['p','n','idx'])gl.deleteBuffer(g[key]);gl.deleteProgram(program);}
return {render,dispose,gl};
}
root.SuperPawEnemy3D=Object.freeze({models,build,meshes,init});
})(typeof window!=='undefined'?window:globalThis);
