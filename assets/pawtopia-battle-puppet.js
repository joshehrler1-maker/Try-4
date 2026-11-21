/* Articulate each original painting on a small 2D mesh. */
(() => {
  'use strict';
  const W=264,H=288,scale=1.2,step=24,columns=12;
  const grid=Array.from({length:156},(_,i)=>[(i%columns)*step,Math.floor(i/columns)*step]);
  const faces=[];
  for(let y=0;y<12;y++)for(let x=0;x<11;x++){
    const i=y*columns+x;
    faces.push([i,i+1,i+columns],[i+1,i+columns+1,i+columns]);
  }
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const ease=t=>t*t*(3-2*t);
  const zero=[0,0];
  const tracks={
    swipe:[[-10,4],[-8,-23],[30,-13],[15,12],[2,2]],
    guard:[[-3,-5],[-9,-18],[-18,-24],[-16,-19],[-7,-10]],
    impact:[[9,-14],[12,-7],[5,8],[2,8],zero],
    victory:[[0,3],[12,-11],[17,-27],[8,-15],[3,-7]],
    defeat:[[0,3],[3,10],[13,19],[15,26],[16,28]]
  };
  const bodyTracks={
    swipe:[[-6,3],[-4,-2],[12,-2],[6,4],zero],
    guard:[[-4,2],[-8,8],[-10,13],[-9,11],[-6,6]],
    impact:[[-18,1],[-17,6],[-12,9],[-6,5],[-2,1]],
    victory:[[0,5],[0,-18],[0,-9],[0,3],zero],
    defeat:[[-2,6],[-4,13],[-7,24],[-8,30],[-9,33]]
  };
  function at(track,frame){
    if(!track)return zero;
    const i=Math.min(4,Math.floor(frame)),t=ease(frame-i),a=track[i-1]||zero,b=track[i];
    return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  }
  function prepare(image,art,doc){
    const canvas=doc.createElement('canvas');
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)return null;
    ctx.drawImage(image,8*scale,16*scale,204*scale,205*scale);
    const source=ctx.getImageData(0,0,W,H);
    function bounds(y){
      let left=220,right=0;
      for(let x=6;x<215;x++)if(source.data[(Math.floor(y*scale)*W+Math.floor(x*scale))*4+3]>190){
        left=Math.min(left,x);right=x;
      }
      return [left,right];
    }
    let lead=[164,115],best=0;
    for(let y=101;y<=131;y+=2){
      const right=bounds(y)[1],score=right-Math.abs(y-114)*.6;
      if(score>best){best=score;lead=[right-10,y];}
    }
    let rear=220,front=0;
    for(let y=196;y<=214;y+=2){const [l,r]=bounds(y);rear=Math.min(rear,l);front=Math.max(front,r);}
    if(front-rear<25){rear=68;front=163;}
    const support=art.uniq<8?[front-12,166]:[lead[0]-41,125];
    const joints=[
      [...lead,27,28],[...support,27,29],[rear+9,206,24,30],[front-9,206,23,30],
      [clamp(bounds(57)[1]-27,100,169),57,42,46],[Math.min(rear,79),146,34,40]
    ];
    return {source,weights:grid.map(([x,y])=>joints.map(([cx,cy,rx,ry])=>{
      const dx=(x/scale-cx)/rx,dy=(y/scale-cy)/ry;
      return Math.exp(-dx*dx-dy*dy);
    }))};
  }
  function movement(art,pose,frame,fromPose,personal){
    if(pose==='recover'){
      const rest=1-ease(frame/5);
      return movement(art,fromPose==='recover'?'idle':fromPose,5,'idle',personal)
        .map(pair=>pair.map(n=>n*rest));
    }
    if(['walk','run','approach'].includes(pose)){
      const d=Math.sin(frame/5*Math.PI*(pose==='walk'?2:4))*(pose==='walk'?10:16)*(1+(art.uniq%7)*.05);
      const lift=Math.abs(d)*.6;
      return [[d*.28,lift*.1],[-d*.55,-Math.max(0,d)*.6],[d,-Math.max(0,d)*.9],
        [-d,-Math.max(0,-d)*.9],[1,-lift*.4],[-d*.3,-lift*.25],[0,-lift*.4]];
    }
    if(pose==='signature'||pose==='ultimate'){
      const style=personal(art,pose,frame);
      const power=pose==='ultimate'?1.23:1;
      const pulse=Math.sin(frame/5*Math.PI)**2;
      const leap=['comet','pounce'].includes(style.technique);
      const pivot=style.technique==='whirl';
      const push=['rush','lance'].includes(style.technique);
      const lead=[style.lead[0]*power*.78,(style.lead[1]*.75-5*pulse)*power];
      const off=[style.offhand[0]*power*.58,style.offhand[1]*power*.65];
      const hands=style.leadIndex===0&&art.uniq>=8?[off,lead]:[lead,off];
      return [...hands,[pivot?-11*pulse:0,leap?-7*pulse:0],[push||pivot?9*pulse:0,leap?-14*pulse:0],
        [style.torso[0]*.2,-4*pulse],[pivot?-23*pulse:-8*pulse,6*pulse],
        [style.torso[0]*.48*power,style.torso[1]*.37*power-(leap?12*pulse:0)]];
    }
    const [x,y]=at(tracks[pose],frame),[dx,dy]=at(bodyTracks[pose],frame);
    const guard=pose==='guard',loss=pose==='defeat';
    return [[x,y],[x*(guard ? .7 : -.29),y*(guard||pose==='victory' ? .68 : .29)],
      zero,[loss?8:0,0],[dx*(pose==='impact'? .7 : .28),dy*(loss? .55 : .14)],[-dx*.55,-dy*.25],[dx,dy]];
  }
  function area(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);}
  function draw(ctx,canvas,rig,art,pose,frame,fromPose,personal){
    if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
    frame=clamp(Number.isFinite(frame)?frame:3,0,5);
    if(pose==='idle'){ctx.putImageData(rig.source,0,0);return;}
    const offsets=movement(art,pose,frame,fromPose,personal);
    const [dx,dy]=offsets[6];
    const lift=(pose==='victory'||pose==='signature'||pose==='ultimate')?ease(clamp((-dy-7)/12,0,1)):0;
    const shifts=grid.map(([,y],i)=>{
      const body=Math.max(lift,clamp((218-y/scale)/67,0,1));
      let x=dx*body,z=dy*body;
      for(let j=0;j<6;j++){x+=offsets[j][0]*rig.weights[i][j];z+=offsets[j][1]*rig.weights[i][j];}
      return [x*scale,z*scale];
    });
    let mesh;
    for(let strength=1;;strength=strength<.25?0:strength*.8){
      mesh=grid.map(([x,y],i)=>[x+shifts[i][0]*strength,y+shifts[i][1]*strength]);
      if(faces.every(([a,b,c])=>area(mesh[a],mesh[b],mesh[c])>=35))break;
      if(strength===0)throw new Error('Invalid painted fighter geometry');
    }
    const output=rig.output||(rig.output=ctx.createImageData(W,H)), pixels=output.data, src=rig.source.data;
    pixels.fill(0);
    for(const [a,b,c] of faces){
      const [ax,ay]=mesh[a],[bx,by]=mesh[b],[cx,cy]=mesh[c],inverse=1/area(mesh[a],mesh[b],mesh[c]);
      const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx)));
      const y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(H-1,Math.ceil(Math.max(ay,by,cy)));
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
        const u=((x+.5-ax)*(cy-ay)-(y+.5-ay)*(cx-ax))*inverse;
        const v=((bx-ax)*(y+.5-ay)-(by-ay)*(x+.5-ax))*inverse;
        if(u<-.00001||v<-.00001||u+v>1.00001)continue;
        const sx=clamp(Math.floor(grid[a][0]+u*(grid[b][0]-grid[a][0])+v*(grid[c][0]-grid[a][0])),0,W-1);
        const sy=clamp(Math.floor(grid[a][1]+u*(grid[b][1]-grid[a][1])+v*(grid[c][1]-grid[a][1])),0,H-1);
        const from=(sy*W+sx)*4,to=(y*W+x)*4;
        pixels[to]=src[from];pixels[to+1]=src[from+1];pixels[to+2]=src[from+2];pixels[to+3]=src[from+3];
      }
    }
    ctx.putImageData(output,0,0);
  }
  window.PawtopiaBattlePuppet=Object.freeze({prepare,draw});
})();
