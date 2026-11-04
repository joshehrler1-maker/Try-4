/* Shared silhouette adjustments for the approved hero turnaround. */
(function (rig) {
 if(!rig)return;
 const original=rig.poseNodes;
 const shapes=[
  [/shoulder.*(?:armor|plate)|pauldron/i,[1.20,.91,1.13],[1.12,.90,1.09]],
  [/gauntlet|shin armor|knee.*plate/i,[1.09,1.03,1.09],[1.09,1.03,1.09]],
  [/hair strand|swept.*hair/i,null,[1.10,1.06,1.07]],
  [/cheek.*fur/i,[1.10,1.01,1.05],[1.10,1.01,1.05]],
  [/cat head/i,[1.04,1.02,1],[1.025,1.02,1]]
 ];
 function scaleColumns(matrix,scale,inverse){
  const next=new Float32Array(matrix);
  for(let axis=0;axis<3;axis++){
   const factor=inverse?1/scale[axis]:scale[axis];
   for(let row=0;row<3;row++)next[axis*4+row]*=factor;
  }
  return next;
 }
 rig.poseNodes=function(name,pose){
  const index=name==='Luna'?2:1;
  return original.call(this,name,pose).map(part=>{
   const scale=shapes.find(([pattern])=>pattern.test(part.node.name))?.[index];
   if(!scale)return part;
   return {...part,world:scaleColumns(part.world,scale,false),normal:scaleColumns(part.normal,scale,true)};
  });
 };
 // Build curved, layered plates in the same local space as the rig's sphere parts.
 function sculpt(kind,rows,columns){
  const vertices=[],indices=[];
  for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++){
   const latitude=Math.PI*i/rows,longitude=2*Math.PI*j/columns;
   const y=Math.cos(latitude),r=Math.sin(latitude);
   const x=r*Math.cos(longitude),z=r*Math.sin(longitude);
   const ridge=Math.pow(Math.max(0,Math.cos(longitude*3+latitude*.8)),6)*r*r;
   if(kind==='plate'){
    const flare=1+.16*Math.max(0,-y);
    vertices.push(x*flare,y>=0?y:Math.max(-.69,y*.77),z*(flare+.07*ridge));
   }else{
    const curl=.14*(1-y)*(1-y);
    vertices.push(x*(1+.12*ridge)+curl,y,z*(1+.18*ridge));
   }
  }
  for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){
   const a=i*(columns+1)+j,b=a+columns+1;
   indices.push(a,a+1,b,a+1,b+1,b);
  }
  const normals=new Float32Array(vertices.length);
  for(let i=0;i<indices.length;i+=3){
   const [a,b,c]=indices.slice(i,i+3).map(v=>v*3);
   const ux=vertices[b]-vertices[a],uy=vertices[b+1]-vertices[a+1],uz=vertices[b+2]-vertices[a+2];
   const vx=vertices[c]-vertices[a],vy=vertices[c+1]-vertices[a+1],vz=vertices[c+2]-vertices[a+2];
   for(const k of [a,b,c]){
    normals[k]+=uy*vz-uz*vy;normals[k+1]+=uz*vx-ux*vz;normals[k+2]+=ux*vy-uy*vx;
   }
  }
  for(let i=0;i<normals.length;i+=3){
   const length=Math.hypot(normals[i],normals[i+1],normals[i+2])||1;
   normals[i]/=length;normals[i+1]/=length;normals[i+2]/=length;
  }
  return [new Float32Array(vertices),normals,new Uint16Array(indices)];
 }
 const create=rig.createGpuModels;
 rig.createGpuModels=function(gl){
  const models=create.call(this,gl);
  const buffers=new Map();
  for(const name of ['Whisker','Luna']){
   const doc=rig.decode(name).doc;
   for(const [index,mesh] of doc.meshes.entries()){
    const nodes=doc.nodes.filter(node=>node.mesh===index);
    if(!nodes.length||mesh.primitives[0].attributes.POSITION!==0)continue;
    const plate=nodes.every(node=>/shoulder.*(?:armor|plate)|pauldron|shin armor|knee.*plate/i.test(node.name));
    const hair=name==='Luna'&&nodes.every(node=>/hair strand|swept.*hair/i.test(node.name));
    if(!plate&&!hair)continue;
    for(const detail of ['high','low']){
     const key=(plate?'plate':'hair')+detail;
     if(!buffers.has(key)){
      const high=detail==='high',arrays=sculpt(plate?'plate':'hair',high?16:8,high?24:12);
      const handles=arrays.map((array,i)=>{
       const target=i===2?gl.ELEMENT_ARRAY_BUFFER:gl.ARRAY_BUFFER,buffer=gl.createBuffer();
       gl.bindBuffer(target,buffer);gl.bufferData(target,array,gl.STATIC_DRAW);return buffer;
      });
      buffers.set(key,{buffers:handles,count:arrays[2].length});
     }
     Object.assign(models[name][detail][index],buffers.get(key));
    }
   }
  }
  return models;
 };
})(window.SuperPawRig);
