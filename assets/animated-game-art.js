/* Painted sky layers for the Canvas-rendered Super Paw games. */
(function (root) {
 const layers=new Map();
 const colors={
  forest:['#244393','#6669bd','#ffc2ac'],
  cavern:['#140d36','#49347a','#ab68a5'],
  arcade:['#171d58','#5156a5','#eaa2bd']
 };
 function paintSky(ctx,width,height,scene){
  const key=scene+':'+width+':'+height;
  let layer=layers.get(key);
  if(!layer){
   layer=document.createElement('canvas');layer.width=width;layer.height=height;
   const c=layer.getContext('2d'),palette=colors[scene],gradient=c.createLinearGradient(0,0,0,height);
   palette.forEach((color,i)=>gradient.addColorStop(i/2,color));
   c.fillStyle=gradient;c.fillRect(0,0,width,height);
   const glow=c.createRadialGradient(width*.77,height*.24,0,width*.77,height*.24,height*.43);
   glow.addColorStop(0,'#ffe8c9a0');glow.addColorStop(1,'#f0a8ca00');
   c.fillStyle=glow;c.fillRect(0,0,width,height);
   c.fillStyle='#fff0dd';c.beginPath();c.arc(width*.77,height*.24,height*.065,0,Math.PI*2);c.fill();
   for(let i=0;i<22;i++){
    const x=width*((i*37%101)/101),y=height*(.17+(i*19%53)/100);
    c.fillStyle=i%2?'#ffc5c348':'#ad9ce949';
    c.beginPath();c.ellipse(x,y,width*(.035+i%4*.017),height*.026,0,0,Math.PI*2);c.fill();
   }
   layers.set(key,layer);
  }
  ctx.drawImage(layer,0,0,width,height);
 }
 root.SuperPawAnimatedArt={paintSky};
})(window);
