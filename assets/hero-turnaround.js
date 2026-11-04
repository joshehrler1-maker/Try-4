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
})(window.SuperPawRig);
