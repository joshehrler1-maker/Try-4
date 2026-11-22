/* Original animated dog breeds and Baron Brasswhirl's Clockwork Avatar. */
(() => {
  'use strict';
  const foes=window.PawtopiaBattleData?.foes || [];
  const states=Object.freeze(['idle','approach','swipe','charge','guard','impact','victory','defeat']);
  const frameIds=Object.freeze([0,1,2,3,4,5]);
  const smoothFrames=Object.freeze(Array.from({length:11},(_,i)=>i/2));
  const dogShapes=Object.freeze([
    [55,31,35,31,16,10,"upright","curved","cream","#bd7b47","#ffdeb0","#74422f"], // Chihuahua
    [65,34,32,29,14,11,"upright","short","silky","#485366","#dca472","#45332d"], // Yorkshire Terrier
    [66,32,31,30,17,12,"butterfly","plume","blaze","#e8dbc5","#fff3dc","#a95333"], // Papillon
    [75,40,39,22,15,20,"drop","straight","solid","#985338","#c47a51","#58302d"], // Miniature Dachshund
    [69,37,36,39,21,6,"upright","nub","tuxedo","#343e4c","#fff0da","#202a35"], // Boston Terrier
    [68,41,32,35,19,16,"drop","upright","saddle","#b87246","#f8e9d2","#353039"], // Beagle
    [71,43,34,35,20,16,"long","feather","silky","#a16031","#eac08e","#6e3f2b"], // English Cocker Spaniel
    [73,43,33,45,18,18,"half","feather","tuxedo","#303c54","#fff2db","#253047"], // Border Collie
    [76,47,35,44,20,20,"drop","straight","solid","#c48d53","#f6d1a2","#765137"], // Labrador Retriever
    [77,52,39,40,24,18,"fold","short","points","#33313b","#cc874a","#201f28"], // Rottweiler
    [79,54,43,44,27,17,"fold","straight","mask","#be946d","#efd4ad","#443036"], // English Mastiff
  ]);
  const bodyBuilds=[[63,34,31,34,16,13,"fold","upright","points",2],[58,39,41,31,19,5,"fold","nub","mask",8],[76,40,36,24,16,18,"drop","straight","saddle",1],[71,34,28,54,14,22,"half","straight","solid",4],[68,43,34,40,19,15,"upright","curved","cream",7],[67,38,32,43,17,16,"long","plume","silky",3],[78,53,42,43,25,17,"fold","straight","mask",9],[71,41,34,39,18,17,"long","feather","solid",4],[73,42,33,43,18,17,"half","feather","tuxedo",10],[72,39,34,45,18,19,"drop","upright","saddle",1],[61,33,31,41,14,14,"upright","straight","solid",3],[56,31,32,31,15,9,"upright","curved","blaze",2]];
  const coats=[["#c28d55","#f3d3a0","#765033"],["#996745","#fff1d8","#38313a"],["#354055","#ce9260","#231e2b"],["#7e859e","#c8bec5","#504b64"],["#a96c44","#e6b58a","#714331"],["#a76335","#edd3a2","#654634"],["#ece2d1","#fff2df","#a49491"],["#80919b","#f3e1ca","#38495b"],["#424651","#f6e6ce","#262b36"],["#bb8861","#f1d3a3","#4f3835"],["#4a3e46","#f6e8d5","#aa6542"],["#e9ded2","#fff2dd","#362f3d"]];
  function shapeFor(foe){
    const legacy=/^foe-(\d+)$/.exec(foe.id);
    if(legacy)return dogShapes[Number(legacy[1])-1];
    if(!foe.breed)return null;
    const preset=bodyBuilds[foe.build];
    const seed=Array.from(foe.id).reduce((n,ch)=>(n*33+ch.charCodeAt(0))>>>0,5381);
    const dimensions=preset.slice(0,6).map((base,index)=>base+((seed>>>(index*4))&7)-3);
    const coat=foe.breed==='Dalmatian'?'spots':preset[8];
    return [...dimensions,preset[6],preset[7],coat,...coats[foe.palette??preset[9]]];
  }
  const models=Object.freeze(foes.map(foe=>{
    const tier=foe.rank-1;
    const tiers=['trainer','scout','terrrier','garden','frost','bolt','recruit','striker','cryo','brass','commander','avatar'];
    return Object.freeze({
      id:foe.id,name:foe.name,rank:foe.rank,kind:foe.breed||tiers[tier],
      breed:foe.breed,dog:Boolean(foe.breed),shape:shapeFor(foe),build:foe.build,
      color:foe.color,eye:tier>=7?'#ffd1b4':tier>=4?'#a2edff':'#ffebad',
      body:tier%3===0?'#465f72':tier%3===1?'#625b75':'#49576c',
      metal:tier%3===0?'#9facc0':tier%3===1?'#c6b6a2':'#a4b7b7',
      ear:tier%4,tail:tier%3,plate:tier>=6,
      size:foe.visualSize||1.19,
      armor:1+Math.floor(tier/3),
      crest:tier>=9?'crown':tier>=6?'shield':tier>=3?'bolt':'paw',
      gearTeeth:7+tier,tag:'hound-'+(tier+1)
    });
  }));
  const byId=Object.fromEntries(models.map(model=>[model.id,model]));
  function profile(foeOrId) {
    const id=typeof foeOrId==='string'?foeOrId:foeOrId?.id;
    return Object.hasOwn(byId,id)?byId[id]:models[0];
  }
  function clampFrame(frame) {
    return Number.isInteger(frame)?Math.max(0,Math.min(5,frame)):3;
  }

  function litPalette(prefix, entries) {
    const blend=(hex,target,amount)=>{
      const channels=[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*(1-amount)+target[i>>1]*amount));
      return '#'+channels.map(channel=>channel.toString(16).padStart(2,'0')).join('');
    };
    const colors=new Map(entries.filter(([color])=>/^#[0-9a-f]{6}$/i.test(color))
      .map(([color,reflective],i)=>[color,{id:prefix+i,reflective}]));
    let defs='';
    for(const [color,{id,reflective}] of colors){
      const glow=blend(color,[255,235,206],reflective?.65:.45);
      const shine=blend(color,[255,241,216],reflective?.27:.12);
      const matte=blend(color,[26,27,57],reflective?.49:.39);
      const rim=blend(color,[112,166,217],reflective?.48:.30);
      defs+='<linearGradient id="'+id+'" x1="16%" y1="0%" x2="88%" y2="100%">'+
        '<stop stop-color="'+glow+'"/><stop offset="'+(reflective?.24:.31)+'" stop-color="'+shine+'"/>'+
        '<stop offset=".53" stop-color="'+color+'"/><stop offset=".85" stop-color="'+matte+'"/>'+
        '<stop offset="1" stop-color="'+rim+'"/></linearGradient>';
    }
    return {defs,shade(markup){return markup.replace(/fill="(#[0-9a-f]{6})"/gi,
      (match,color)=>colors.has(color)?'fill="url(#'+colors.get(color).id+')"':match);}};
  }

  function dogDrawing(model,pose,f,paintedBody=false){
    const [back,depth,headRadius,legLength,paw,muzzle,ears,tail,coat,fur,light,dark]=model.shape;
    const phase=[0,-.17,.31,1,.64,.13][f], n=model.rank, col=model.color;
    const positive=Math.max(0,phase);
    const stride=pose==='approach'||pose==='charge';
    const walk=stride?Math.sin(f*Math.PI*.8)*(pose==='charge'?19:12):0;
    const reach=pose==='swipe'?21*phase:pose==='charge'?12*phase:0;
    const lean=pose==='impact'?13*phase:pose==='guard'?6*phase:-reach*.55;
    const sink=(pose==='defeat'?35:pose==='guard'?12:pose==='victory'?-12:0)*positive;
    const bob=sinBob(f,n)+Math.abs(walk)*-.17;
    const shoulder=98,hip=shoulder+back;
    const shoulderY=218-legLength-depth+sink+bob;
    const hipY=shoulderY+2;
    const headX=shoulder-headRadius*.9+lean;
    const headY=shoulderY-headRadius*.39+sink*.28;
    const left=headX-headRadius*.70-muzzle;
    const baseY=Math.min(218,218+sink);
    const earTop=headY-headRadius*(ears==='butterfly'?1.80:1.41);
    const collar=col;
    const tailX=hip-8,tailY=hipY+11,wag=Math.sin((f+n)*.85)*7;
    const shortTail=tail==='nub'||tail==='short';
    const tipX=Math.min(216,tailX+(shortTail?19:tail==='upright'?24:45));
    const tipY=tailY+(shortTail?-9:tail==='upright'?-54:tail==='straight'?-14:-38)+wag;
    const tailPath='M'+tailX+' '+tailY+' Q'+(tipX+7)+' '+(tailY+5)+' '+tipX+' '+tipY;
    const earsArt=()=>{
      const x=headX,y=headY;
      if(ears==='drop'||ears==='long'||ears==='fold'){
        const end=y+headRadius*(ears==='long'?1.47:ears==='drop'?.94:.31);
        return '<path d="M'+(x+1)+' '+(y-headRadius*.72)+' Q'+(x+headRadius*.92)+' '+(y-headRadius*.92)+' '+(x+headRadius*.69)+' '+(y-headRadius*.10)+
          ' L'+(x+headRadius*.51)+' '+end+' Q'+(x-7)+' '+(end+8)+' '+(x-4)+' '+(end-4)+' Z" fill="'+dark+'" stroke="'+fur+'" stroke-width="2"/>';
      }
      const wide=ears==='butterfly'?1.01:.73;
      return '<path d="M'+(x-headRadius*.72)+' '+(y-headRadius*.35)+' Q'+(x-headRadius*1.05)+' '+(earTop+5)+' '+(x-headRadius*.61)+' '+(earTop+(ears==='half'?14:0))+
        ' L'+(x-headRadius*.11)+' '+(y-headRadius*.68)+' M'+(x-.1*headRadius)+' '+(y-headRadius*.58)+' Q'+(x+headRadius*.39)+' '+(earTop-9)+' '+(x+headRadius*wide)+' '+earTop+
        ' Q'+(x+headRadius*(ears==='half'?.50:.91))+' '+(y-headRadius*.76)+' '+(x+headRadius*.46)+' '+(y-headRadius*.32)+' Z" fill="'+fur+'" stroke="'+dark+'" stroke-width="3"/>'+
        '<path d="M'+(x+headRadius*.13)+' '+(y-headRadius*.64)+' Q'+(x+headRadius*.34)+' '+(earTop+7)+' '+(x+headRadius*(wide-.14))+' '+(earTop+7)+' Q'+(x+headRadius*.62)+' '+(y-headRadius*.58)+' '+(x+headRadius*.42)+' '+(y-headRadius*.53)+' Z" fill="#dba5a1" opacity=".76"/>';
    };
    function leg(x,y,offset,lift,far,kind){
      const endX=x+offset,endY=baseY-lift;
      return '<g class="foe-arm '+kind+'"><path d="M'+x+' '+y+' Q'+(x+offset*.45+6)+' '+(y+legLength*.58)+' '+endX+' '+(endY-4)+
        '" stroke="'+(far?dark:fur)+'" stroke-width="'+(paw*(far?.73:.84))+'" fill="none" stroke-linecap="round"/>'+
        '<ellipse cx="'+(endX-2)+'" cy="'+(endY-4)+'" rx="'+(paw*.56)+'" ry="'+(paw*.32)+'" fill="'+(far?dark:light)+'" stroke="'+dark+'" stroke-width="2"/></g>';
    }
    const chest='<path d="M86 '+(shoulderY+4)+' Q105 '+(shoulderY+7)+' 117 '+(shoulderY+20)+' L107 '+(shoulderY+depth-1)+' Q80 '+(shoulderY+depth-8)+' 80 '+(shoulderY+16)+' Z" fill="'+light+'"/>';
    const saddle=coat==='saddle'?'<path d="M106 '+(shoulderY+4)+' Q135 '+(shoulderY-8)+' '+(hip-1)+' '+(hipY+6)+' L'+(hip-4)+' '+(hipY+depth*.58)+' Q130 '+(shoulderY+depth*.76)+' 106 '+(shoulderY+6)+' Z" fill="'+dark+'"/>':'';
    const spots=coat==='spots'?[[-36,12,6],[-22,23,5],[-12,8,4],[-5,26,5],[-54,20,5]].map(([dx,dy,r])=>'<circle cx="'+(hip+dx)+'" cy="'+(hipY+dy)+'" r="'+r+'" fill="'+dark+'"/>').join(''):'';
    const chestCoat=['tuxedo','blaze','saddle','cream','silky'].includes(coat)?chest:'';
    const blaze=['tuxedo','blaze'].includes(coat)?'<path d="M'+(headX-3)+' '+(headY-headRadius*.81)+' Q'+(headX-10)+' '+(headY-headRadius*.28)+' '+(headX-16)+' '+(headY+3)+'" stroke="'+light+'" fill="none" stroke-width="8" stroke-linecap="round"/>':'';
    const facialPoints=coat==='points'?'<ellipse cx="'+(headX-9)+'" cy="'+(headY-13)+'" rx="7" ry="3" fill="'+light+'"/>':'';
    const fringe=coat==='silky'||tail==='feather'?'<path d="M110 '+(shoulderY+20)+' q-5 20 -13 16 l7 6 q7 -1 13 -17 m23 -2 q-2 12 -9 18 l12 -4" fill="none" stroke="'+light+'" stroke-width="4" stroke-linecap="round" opacity=".7"/>':'';
    const effects=pose==='swipe'?'<path class="foe-slash" d="M50 140 Q26 138 17 160 M48 151 Q25 151 13 172" stroke="'+col+'" fill="none" stroke-width="4" opacity="'+positive+'"/>':
      pose==='charge'?'<path class="foe-charge-streak" d="M196 115 H218 M185 132 H216 M183 155 H210" stroke="'+col+'" fill="none" stroke-width="4" opacity="'+positive+'"/>':
      pose==='guard'?'<path class="foe-guard" d="M48 148 L26 158 Q26 185 48 193 Q70 185 70 158 Z" fill="'+col+'" fill-opacity=".17" stroke="'+col+'" stroke-width="3" opacity="'+positive+'"/>':
      pose==='impact'?'<path class="foe-impact-mark" d="M48 79 l6 9 11 1 -8 7 3 10 -12 -6 -9 6 2 -11 -8 -7 11 -1Z" fill="#ffde9c" opacity="'+positive+'"/>':
      pose==='victory'?'<path d="M74 50 l4 9 10 3 -10 3 -4 10 -3 -10 -10 -3 10 -3Z" fill="#ffe0a0" opacity="'+positive+'"/>':'';
    const painted=litPalette('dog-light-'+n+'-',[[fur,false],[light,false],[dark,false]]);
    const size=model.size,originX=110,originY=218;
    return painted.shade('<svg xmlns="http://www.w3.org/2000/svg" class="foe-body-illustration" viewBox="0 0 220 240" data-foe-id="'+model.id+
      '" data-foe-rank="'+n+'" data-dog-breed="'+model.breed+'" data-pose="'+pose+'" data-frame="'+f+'" role="img" aria-hidden="true"><defs>'+
      painted.defs+'</defs><desc>'+model.breed+', '+pose+' pose.</desc>'+
      '<ellipse cx="110" cy="222" rx="'+(62*size)+'" ry="'+(8*size)+'" fill="#07152b" opacity=".35"/>'+
      '<g class="foe-motion-body" transform="translate('+originX+' '+originY+') scale('+size+') translate(-'+originX+' -'+originY+')">'+
      (paintedBody?'':'<path d="'+tailPath+'" stroke="'+(coat==='saddle'?dark:fur)+'" stroke-width="'+(tail==='plume'||tail==='feather'?paw*.89:paw*.54)+'" fill="none" stroke-linecap="round"/>'+
      (coat==='saddle'?'<circle cx="'+tipX+'" cy="'+tipY+'" r="5" fill="'+light+'"/>':'')+
      leg(shoulder+11,shoulderY+depth*.64,-walk,Math.max(0,-walk)*.5,true,'foe-far-front')+
      leg(hip-1,hipY+depth*.62,walk,Math.max(0,walk)*.49,true,'foe-far-hind')+
      '<path d="M83 '+(shoulderY+7)+' Q110 '+(shoulderY-9)+' '+(hip-3)+' '+hipY+' Q'+(hip+20)+' '+(hipY+2)+' '+(hip+9)+' '+(hipY+depth*.76)+
      ' Q'+(hip-11)+' '+(hipY+depth*.85)+' 131 '+(shoulderY+depth*.82)+' Q112 '+(shoulderY+depth+8)+' 84 '+(shoulderY+depth-2)+' Q74 '+(shoulderY+depth*.54)+' 83 '+(shoulderY+7)+' Z" fill="'+fur+'" stroke="'+dark+'" stroke-width="3"/>'+
      chestCoat+saddle+spots+fringe+
      leg(hip-9,hipY+depth*.67,-walk*.68,Math.max(0,-walk)*.6,false,'foe-right-arm')+
      leg(shoulder-4,shoulderY+depth*.68,walk*.77-reach,Math.max(0,walk)*.63+Math.max(0,reach)*.78,false,'foe-left-arm')+
      '<path d="M85 '+(shoulderY+2)+' Q92 '+(shoulderY+19)+' 106 '+(shoulderY+27)+'" fill="none" stroke="'+collar+'" stroke-width="7" stroke-linecap="round"/>'+
      '<circle cx="101" cy="'+(shoulderY+24)+'" r="4" fill="#ffe4a1"/>'+
      '<g class="foe-head">'+
      '<ellipse cx="'+headX+'" cy="'+headY+'" rx="'+(headRadius*.87)+'" ry="'+(headRadius*.76)+'" fill="'+fur+'" stroke="'+dark+'" stroke-width="3"/>'+
      earsArt()+blaze+
      '<path d="M'+(headX-12)+' '+(headY-1)+' Q'+(left+6)+' '+(headY-7)+' '+left+' '+(headY+1)+
      ' L'+left+' '+(headY+11)+' Q'+(left+14)+' '+(headY+headRadius*.71)+' '+(headX+6)+' '+(headY+headRadius*.41)+
      ' Q'+(headX+16)+' '+(headY+7)+' '+(headX-12)+' '+(headY-1)+' Z" fill="'+(['mask','tuxedo'].includes(coat)?dark:light)+'" stroke="'+dark+'" stroke-width="2"/>'+
      facialPoints+'<ellipse cx="'+(headX-11)+'" cy="'+(headY-9)+'" rx="5.7" ry="5" fill="#9b6340"/>'+
      '<circle cx="'+(headX-12)+'" cy="'+(headY-9)+'" r="3.1" fill="#221e30"/><circle cx="'+(headX-13)+'" cy="'+(headY-11)+'" r="1.4" fill="#fff3df"/>'+
      '<ellipse cx="'+(left+1)+'" cy="'+(headY+2)+'" rx="6.5" ry="4.6" fill="#211d2c"/>'+
      '<path d="M'+(left+4)+' '+(headY+13)+' Q'+(left+14)+' '+(headY+17)+' '+(headX-9)+' '+(headY+13)+'" stroke="#302333" stroke-width="2" fill="none"/></g>')+
      effects+'</g></svg>');
  }
  function sinBob(frame,rank){return Math.sin((frame+rank*.23)*Math.PI/3)*1.7;}

  function drawing(model,state='idle',frame=3) {
    const pose=states.includes(state)?state:'idle';
    const f=clampFrame(frame),phase=[0,-.15,.35,1,.66,.1][f];
    if(model.shape)return dogDrawing(model,pose,f);
    const n=model.rank,col=model.color;
    const forward=pose==='approach'?16+Math.floor(n/2):
      pose==='swipe'?23+Math.floor(n/2):pose==='charge'?34+n:pose==='guard'?-6:0;
    const slump=pose==='defeat'?19:pose==='impact'?7:pose==='victory'?-12:pose==='charge'?-8:0;
    const x=Math.round(forward*phase),y=Math.round(slump*phase);
    const armExtension=pose==='swipe'?Math.round((18+n)*phase):pose==='charge'?Math.round((26+n)*phase):0;
    const earTilt=pose==='impact'?Math.round(11*phase):pose==='charge'?Math.round(-18*phase):0;
    const eyeGlare=n>=9?'#f9b768':model.eye;
    const neckY=72+Math.round(y*.45);
    const tailTip=pose==='victory'?20:pose==='defeat'?-16:Math.round(Math.sin((f+n)*1.1)*12);
    const collar=pose==='guard'?9:5;
    const earLeft=model.ear===0?'M62 65 L40 18 L85 55 Z':model.ear===1?
      'M64 62 Q40 45 35 25 Q62 19 84 54 Z':model.ear===2?
      'M65 65 L48 13 Q59 31 83 51 Z':
      'M63 66 Q30 33 55 22 L86 56 Z';
    const earRight=model.ear===0?'M132 54 L163 17 L165 70 Z':model.ear===1?
      'M133 54 Q161 19 175 37 Q169 61 156 70 Z':model.ear===2?
      'M134 53 L164 12 L162 70 Z':
      'M133 54 Q164 23 171 27 L165 67 Z';
    const armorTop=30-n%5*3;
    const gearR=73+n%4*2;
    const center={x:107,y:114};
    const teeth=Array.from({length:model.gearTeeth},(_,i)=>{
      const a=(Math.PI*2*i/model.gearTeeth)+(f*.07),cx=Math.round(center.x+Math.cos(a)*gearR),
        cy=Math.round(center.y+Math.sin(a)*gearR);
      return '<path d="M'+cx+' '+cy+' l'+Math.round(Math.cos(a)*10)+' '+Math.round(Math.sin(a)*10)+
        '" stroke="'+col+'" stroke-width="'+(n>=8?5:3)+'" stroke-linecap="round" opacity=".58"/>';
    }).join('');
    const tail=model.tail===0?
      'M163 161 Q'+(194+tailTip)+' 156 '+(197+tailTip)+' 126':
      model.tail===1?'M161 171 Q'+(184+tailTip)+' 200 '+(199+tailTip)+' 185':
      'M161 160 Q'+(187+tailTip)+' 155 '+(191+tailTip)+' 102';
    const hindLeg=(x1,y1,offset)=>'<path d="M'+x1+' '+y1+' Q'+(x1+12+offset)+' '+(y1+37)+' '+(x1+offset)+
      ' 213" stroke="'+model.body+'" stroke-width="21" stroke-linecap="round" fill="none"/>'+
      '<ellipse cx="'+(x1+offset)+'" cy="211" rx="23" ry="11" fill="'+model.metal+'" stroke="'+model.body+'" stroke-width="4"/>';
    const limb=(left)=>{
      const sx=left?76:134,dx=left?-7:armExtension;
      const ex=Math.round((left?64:144)+dx),ey=Math.round((left?192:189)-(pose==='guard'?19*phase:(pose==='swipe'||pose==='charge')&&!left?(pose==='charge'?65:49)*phase:0));
      const joints='M'+sx+' 133 Q'+(sx+(left?-16:19))+' 158 '+ex+' '+ey;
      return '<g class="foe-arm '+(left?'foe-left-arm':'foe-right-arm')+'"><path d="'+joints+
        '" stroke="'+model.body+'" stroke-width="24" stroke-linecap="round" fill="none"/>'+
        '<path d="'+joints+'" stroke="'+model.metal+'" stroke-width="15" stroke-linecap="round" fill="none"/>'+
        '<ellipse cx="'+ex+'" cy="'+ey+'" rx="17" ry="13" fill="'+model.body+'" stroke="'+col+'" stroke-width="3"/>'+
        Array.from({length:3},(_,i)=>'<path d="M'+(ex-9+i*9)+' '+(ey-7)+' l'+(left?-2:3)+' -'+(5+n%5)+
          '" stroke="'+model.eye+'" stroke-width="2" stroke-linecap="round"/>').join('')+'</g>';
    };
    const muzzleSize=20+Math.floor(n/4)*3;
    const muzzle='<path d="M'+(107-muzzleSize)+' 113 Q107 105 '+(107+muzzleSize)+' 113 L'+(112+muzzleSize)+' 140 Q110 156 '+(103-muzzleSize)+' 139 Z" fill="'+model.metal+'" stroke="'+model.body+'" stroke-width="5"/>';
    const armor='<path d="M69 134 L'+(107-armorTop)+' 121 L'+(107+armorTop)+' 121 L149 134 L148 177 Q107 197 64 173 Z" fill="'+model.metal+
      '" stroke="'+col+'" stroke-width="'+(model.plate?6:4)+'" opacity=".95"/>'+
      '<path d="M78 146 H138 M94 162 L121 161" stroke="'+model.body+'" stroke-width="4" fill="none"/>';
    const crest=model.crest==='crown'?
      '<path d="M80 88 L75 56 L93 72 L107 51 L123 72 L141 56 L136 89 Z" fill="'+col+'" stroke="#fff0c2" stroke-width="3"/>':
      model.crest==='shield'?'<path d="M93 153 L107 140 L122 153 L119 174 L107 185 L94 175 Z" fill="'+col+'" stroke="#dce7f8" stroke-width="3"/>':
      model.crest==='bolt'?'<path d="M106 146 L93 163 L106 162 L101 183 L121 159 L108 160 Z" fill="'+col+'"/>':
      '<path d="M94 163 Q106 148 118 163 Q124 175 106 183 Q89 174 94 163" fill="'+col+'"/>';
    const horns=n>=7?'<path d="M74 42 L62 '+(23-n%4*3)+' L84 30 M131 28 L151 '+(25-n%3*4)+
      ' L144 42" stroke="'+col+'" stroke-width="6" fill="none"/>':'';
    const cheek=n>=4?'<path d="M55 100 L72 92 L65 117 M147 94 L162 99 L151 114" stroke="'+col+
      '" stroke-width="5" fill="none"/>':'';
    const frost=n===5||n===9?'<g class="foe-cold" stroke="#afe6ff" stroke-width="3" opacity=".9">'+
      '<path d="M29 147 l15 -6 M35 152 l7 -15 M178 67 l15 8 M184 60 l8 15"/></g>':'';
    const sparks=n===6||n===10?'<g class="foe-spark" stroke="#ffe0a3" stroke-width="3" fill="none">'+
      '<path d="M29 124 l9 -12 l-2 11 l10 -7 M168 146 l15 -9 l-5 13 l13 -6"/></g>':'';
    const boss=n===12?'<g class="foe-boss" opacity=".8"><circle cx="107" cy="92" r="66" fill="none" stroke="'+col+
      '" stroke-width="5" stroke-dasharray="10 8"/><path d="M107 10 L117 31 L107 24 L97 31 Z" fill="#fee6b5"/></g>':'';
    const shield=pose==='guard'?'<g class="foe-guard" opacity="'+(.25+Math.max(0,phase)*.7)+
      '"><path d="M39 112 Q107 '+(12-n)+' 175 108 Q173 185 107 204 Q40 185 39 112 Z" fill="'+col+
      '" fill-opacity=".13" stroke="'+col+'" stroke-width="'+collar+'"/></g>':'';
    const attack=pose==='swipe'?'<g class="foe-slash" opacity="'+(.2+Math.max(0,phase)*.75)+'">'+
      Array.from({length:3},(_,i)=>'<path d="M'+(147+i*12)+' '+(76+i*6)+' Q'+(170+i*11)+' '+(69+i*6)+
        ' '+(195+i*9)+' '+(97+i*9)+'" fill="none" stroke="'+col+'" stroke-width="4" stroke-linecap="round"/>').join('')+'</g>':'';
    const charge=pose==='charge'?
      '<g class="foe-charge-streak" data-foe-charge="'+n+'" opacity="'+(.2+Math.max(0,phase)*.78)+'">'+
      '<path d="M14 122 L'+(60+Math.round(10*phase))+' '+(116-Math.round(20*phase))+
      ' M24 157 L'+(71+Math.round(12*phase))+' '+(139-Math.round(17*phase))+
      ' M42 183 L'+(84+Math.round(8*phase))+' '+(158-Math.round(12*phase))+
      '" stroke="'+model.eye+'" stroke-width="'+(3+Math.floor(n/4))+
      '" stroke-linecap="round" fill="none"/>'+
      '<path d="M'+(155+Math.round(20*phase))+' 66 L'+(165+Math.round(27*phase))+
      ' 45 L'+(169+Math.round(31*phase))+' 65 Z" fill="'+col+'"/></g>':'';
    const impact=pose==='impact'?'<path class="foe-impact-mark" d="M58 51 L50 29 L67 37 L78 20 L75 48 L92 57 L70 60 L65 78 Z" fill="#ffe0aa"/>':'';
    const circle='<circle cx="107" cy="114" r="'+gearR+'" stroke="'+col+'" fill="none" opacity=".3" stroke-width="3"/>';
    const painted=litPalette('hound-light-'+n+'-',[
      [model.body,true],[model.metal,true],[model.color,true]
    ]);
    return painted.shade('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 240" class="foe-body-illustration"'+
      ' data-foe-id="'+model.id+'" data-foe-rank="'+n+'" data-pose="'+pose+'" data-frame="'+f+'" role="img" aria-hidden="true">'+
      '<defs>'+painted.defs+'</defs>'+
      '<desc>Original individual '+model.name+' clockwork canine fighter, '+pose+' pose.</desc>'+
      '<ellipse cx="109" cy="222" rx="66" ry="11" fill="#07152b" opacity=".34"/>'+
      '<g class="foe-gear-frame">'+circle+teeth+'</g>'+
      '<g class="foe-motion-body" transform="translate('+x+' '+y+') rotate('+Math.round(earTilt/2)+' 107 145)">'+
      '<path d="'+tail+'" stroke="'+model.body+'" stroke-width="'+(13+n%4*3)+'" fill="none" stroke-linecap="round"/>'+
      '<path d="'+tail+'" stroke="'+col+'" stroke-width="5" fill="none" stroke-linecap="round"/>'+
      hindLeg(72,163,-13)+hindLeg(142,162,12)+
      '<path d="M67 128 Q107 '+(91-n%5)+' 147 129 L157 181 Q110 213 57 184 Z" fill="'+model.body+
      '" stroke="'+col+'" stroke-width="'+(3+Math.floor(n/6))+'"/>'+
      armor+crest+
      limb(true)+limb(false)+
      '<g class="foe-head" transform="rotate('+earTilt+' 109 '+neckY+')">'+
      '<path d="'+earLeft+'" fill="'+model.body+'" stroke="'+col+'" stroke-width="5"/>'+
      '<path d="'+earRight+'" fill="'+model.body+'" stroke="'+col+'" stroke-width="5"/>'+
      horns+
      '<path d="M51 68 Q76 '+(29+n%8)+' 108 '+(46-n%3)+' Q140 37 165 70 L169 118 Q152 147 107 149 Q56 146 46 115 Z" fill="'+model.body+
      '" stroke="'+col+'" stroke-width="5"/>'+
      cheek+muzzle+
      '<path d="M63 89 L88 91 L86 105 L65 102 Z M127 92 L149 89 L148 103 L128 106 Z" fill="'+eyeGlare+
      '" stroke="#303244" stroke-width="3"/>'+
      '<path d="M91 126 L119 126 L107 140 Z" fill="#2c374a" stroke="'+col+'" stroke-width="2"/>'+
      '<path d="M93 145 Q106 '+(155+n%5)+' 123 145" fill="none" stroke="'+model.eye+'" stroke-width="3"/>'+
      '</g>'+frost+sparks+boss+'</g>'+
      shield+attack+charge+impact+
      (pose==='victory'?'<path d="M62 22 L72 3 L81 22 L104 27 L80 33 L73 55 L63 34 L44 28 Z" fill="'+model.eye+'" opacity=".85"/>':'')+
      '</svg>');
  }

  // Each painting is fetched only when its challenger is shown.
  const paintedDogs=new Set([
    "foe-1",
    "dog-pomeranian",
    "dog-biewer-terrier",
    "dog-russian-toy",
    "dog-toy-fox-terrier",
    "dog-maltese",
    "foe-2",
    "dog-russian-tsvetnaya-bolonka",
    "dog-affenpinscher",
    "foe-3",
    "dog-brussels-griffon",
    "dog-japanese-chin",
    "dog-miniature-pinscher",
    "dog-chinese-crested",
    "dog-havanese",
    "dog-silky-terrier",
    "dog-italian-greyhound",
    "dog-english-toy-spaniel",
    "foe-4",
    "dog-portuguese-podengo-pequeno",
    "dog-toy-manchester-terrier",
    "dog-coton-de-tulear",
    "dog-norfolk-terrier",
    "dog-norwich-terrier",
    "dog-russell-terrier",
    "dog-tibetan-spaniel",
    "dog-shih-tzu",
    "dog-lancashire-heeler",
    "dog-schipperke",
    "dog-border-terrier",
    "dog-cairn-terrier",
    "dog-pekingese",
    "dog-bichon-frise",
    "dog-lhasa-apso",
    "dog-lowchen",
    "dog-norwegian-lundehund",
    "dog-parson-russell-terrier",
    "dog-cavalier-king-charles-spaniel",
    "dog-miniature-schnauzer",
    "dog-pug",
    "dog-smooth-fox-terrier",
    "dog-teddy-roosevelt-terrier",
    "dog-lakeland-terrier",
    "dog-manchester-terrier",
    "dog-wire-fox-terrier",
    "dog-australian-terrier",
    "dog-danish-swedish-farmdog",
    "dog-rat-terrier",
    "dog-west-highland-white-terrier",
    "foe-5",
    "dog-cesky-terrier",
    "dog-american-hairless-terrier",
    "dog-bedlington-terrier",
    "dog-scottish-terrier",
    "dog-shetland-sheepdog",
    "dog-shiba-inu",
    "dog-welsh-terrier",
    "dog-american-eskimo-dog",
    "dog-dandie-dinmont-terrier",
    "dog-dachshund",
    "foe-6",
    "dog-pyrenean-shepherd",
    "dog-basenji",
    "dog-cirneco-delletna",
    "dog-miniature-bull-terrier",
    "dog-mudi",
    "dog-sealyham-terrier",
    "dog-tibetan-terrier",
    "dog-cocker-spaniel",
    "dog-nederlandse-kooikerhondje",
    "dog-pumi",
    "dog-irish-terrier",
    "dog-finnish-spitz",
    "dog-icelandic-sheepdog",
    "dog-swedish-vallhund",
    "dog-french-bulldog",
    "dog-pembroke-welsh-corgi",
    "dog-lagotto-romagnolo",
    "foe-7",
    "dog-miniature-american-shepherd",
    "dog-puli",
    "dog-basset-fauve-de-bretagne",
    "dog-staffordshire-bull-terrier",
    "dog-cardigan-welsh-corgi",
    "dog-boykin-spaniel",
    "dog-petit-basset-griffon-vendeen",
    "dog-whippet",
    "dog-xoloitzcuintli",
    "dog-norwegian-buhund",
    "dog-american-water-spaniel",
    "dog-brittany",
    "dog-german-pinscher",
    "dog-soft-coated-wheaten-terrier",
    "dog-glen-of-imaal-terrier",
    "dog-kerry-blue-terrier",
    "dog-keeshond",
    "dog-polish-lowland-sheepdog",
    "dog-skye-terrier",
    "dog-spanish-water-dog",
    "dog-spinone-italiano",
    "dog-standard-schnauzer",
    "dog-sussex-spaniel",
    "dog-nova-scotia-duck-tolling-retriever",
    "dog-australian-cattle-dog",
    "foe-8",
    "dog-field-spaniel",
    "dog-grand-basset-griffon-vendeen",
    "dog-finnish-lapphund",
    "dog-azawakh",
    "dog-bulldog",
    "dog-canaan-dog",
    "dog-english-springer-spaniel",
    "dog-welsh-springer-spaniel",
    "dog-boxer",
    "dog-ibizan-hound",
    "dog-irish-red-white-setter",
    "dog-portuguese-water-dog",
    "dog-siberian-husky",
    "dog-barbet",
    "dog-bearded-collie",
    "dog-pharaoh-hound",
    "dog-plott-hound",
    "dog-samoyed",
    "dog-norwegian-elkhound",
    "dog-vizsla",
    "dog-australian-shepherd",
    "dog-basset-hound",
    "dog-chinese-shar-pei",
    "dog-entlebucher-mountain-dog",
    "dog-harrier",
    "dog-saluki",
    "dog-wirehaired-pointing-griffon",
    "dog-afghan-hound",
    "dog-american-english-coonhound",
    "dog-american-staffordshire-terrier",
    "dog-poodle",
    "dog-sloughi",
    "dog-wirehaired-vizsla",
    "dog-irish-water-spaniel",
    "dog-chow-chow",
    "dog-dalmatian",
    "dog-german-shorthaired-pointer",
    "dog-redbone-coonhound",
    "dog-airedale-terrier",
    "dog-belgian-laekenois",
    "dog-belgian-malinois",
    "dog-belgian-sheepdog",
    "dog-belgian-tervuren",
    "dog-berger-picard",
    "dog-bull-terrier",
    "dog-german-wirehaired-pointer",
    "dog-pointer",
    "dog-treeing-walker-coonhound",
    "dog-bluetick-coonhound",
    "dog-collie",
    "dog-english-setter",
    "dog-gordon-setter",
    "dog-american-foxhound",
    "dog-flat-coated-retriever",
    "dog-golden-retriever",
    "dog-greyhound",
    "dog-irish-setter",
    "dog-chesapeake-bay-retriever",
    "dog-english-foxhound",
    "foe-9",
    "dog-bergamasco",
    "dog-chinook",
    "dog-clumber-spaniel",
    "dog-german-shepherd-dog",
    "dog-bracco-italiano",
    "dog-weimaraner",
    "dog-giant-schnauzer",
    "dog-briard",
    "dog-curly-coated-retriever",
    "dog-rhodesian-ridgeback",
    "dog-alaskan-malamute",
    "dog-doberman-pinscher",
    "dog-old-english-sheepdog",
    "dog-borzoi",
    "dog-black-and-tan-coonhound",
    "dog-beauceron",
    "dog-bouvier-des-flandres",
    "dog-dogo-argentino",
    "dog-komondor",
    "dog-scottish-deerhound",
    "dog-bernese-mountain-dog",
    "dog-great-pyrenees",
    "dog-kuvasz",
    "dog-bloodhound",
    "dog-otterhound",
    "dog-akita",
    "dog-dogue-de-bordeaux",
    "dog-black-russian-terrier",
    "dog-cane-corso",
    "foe-10",
    "dog-tibetan-mastiff",
    "dog-greater-swiss-mountain-dog",
    "dog-irish-wolfhound",
    "dog-anatolian-shepherd-dog",
    "dog-bullmastiff",
    "dog-newfoundland",
    "dog-leonberger",
    "dog-neapolitan-mastiff",
    "dog-great-dane",
    "dog-saint-bernard",
    "dog-boerboel",
    "foe-11"
  ]);
  const paintings=new Map();
  const activeCanvases=new WeakMap();
  function paintingRecord(model){
    if(!paintedDogs.has(model.id))return null;
    if(paintings.has(model.id)){
      const record=paintings.get(model.id);
      paintings.delete(model.id);
      paintings.set(model.id,record);
      return record;
    }
    const image=new window.Image();
    const record={image,state:'loading',targets:new Set()};
    paintings.set(model.id,record);
    image.onload=()=>{
      record.state='ready';
      for(const target of record.targets){
        if(target.dataset.foe===model.id)paint(target,model.id,target.dataset.pose,Number(target.dataset.frame),target.dataset.fromPose);
      }
      record.targets.clear();
    };
    image.onerror=()=>{
      record.state='failed';
      record.targets.clear();
    };
    image.src='assets/scenes/pawtopia-dogs/'+model.id+'.png';
    if(paintings.size>12){
      for(const [id,entry] of paintings){
        if(entry.state==='loading'||id===model.id)continue;
        paintings.delete(id);
        break;
      }
    }
    return record;
  }

  function paintPainting(container,model,pose,frame,record,fromPose){
    const puppet=window.PawtopiaBattlePuppet;
    const doc=container.ownerDocument;
    if(!puppet||!doc)return false;
    try{
      if(record.rig===undefined)record.rig=puppet.prepare(record.image,model,doc);
      if(!record.rig)return false;
      let state=activeCanvases.get(container);
      if(!state){
        const canvas=doc.createElement('canvas');
        canvas.className='battle-dog-painting';
        canvas.setAttribute('aria-hidden','true');
        state={canvas,ctx:canvas.getContext('2d')};
        activeCanvases.set(container,state);
      }
      if(!state.ctx)return false;
      const {canvas,ctx}=state;
      const recover=pose==='recover';
      const markup=dogDrawing(model,recover?fromPose:pose,Math.round(recover?5-frame:frame),true);
      puppet.draw(ctx,canvas,record.rig,model,pose,frame,fromPose);
      if(canvas.parentNode===container)container.firstElementChild.outerHTML=markup;
      else{
        container.innerHTML=markup;
        container.append(canvas);
      }
      container.style.setProperty('--dog-scale',String(model.size));
      return true;
    }catch{
      record.rig=null;
      return false;
    }
  }

  function paint(container,foe,pose='idle',frame=3,fromPose='guard') {
    if(!container)return false;
    const model=profile(foe);
    if(!model)return false;
    pose=states.includes(pose)||pose==='recover'?pose:'idle';
    fromPose=states.includes(fromPose)?fromPose:'guard';
    frame=Number.isFinite(frame)?Math.min(5,Math.max(0,frame)):3;
    container.dataset.foe=model.id;
    container.dataset.pose=pose;
    container.dataset.frame=String(frame);
    container.dataset.fromPose=fromPose;
    const record=model.dog&&typeof window.Image==='function'?paintingRecord(model):null;
    if(record?.state==='loading')record.targets.add(container);
    const painted=record?.state==='ready'&&paintPainting(container,model,pose,frame,record,fromPose);
    container.dataset.dogPainting=String(Boolean(painted));
    if(!painted)container.innerHTML=drawing(model,pose==='recover'?fromPose:pose,Math.round(pose==='recover'?5-frame:frame));
    container.setAttribute('aria-label',model.name+(model.breed?' animated dog challenger':' in his animated Clockwork Avatar'));
    return true;
  }
  window.PawtopiaBattleFoeArt=Object.freeze({models,states,frameIds,smoothFrames,profile,drawing,paint});
})();
