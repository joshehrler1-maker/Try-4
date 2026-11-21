/* Original animated hound/cyborg challenger artwork for all 12 ranks.
   No borrowed art, image calls, backend, or changes to the battle rules. */
(() => {
  'use strict';
  const foes=window.PawtopiaBattleData?.foes || [];
  const states=Object.freeze(['idle','approach','swipe','guard','impact','victory','defeat']);
  const frameIds=Object.freeze([0,1,2,3,4,5]);
  const models=Object.freeze(foes.map((foe,index)=>{
    const tiers=['trainer','scout','terrrier','garden','frost','bolt','recruit','striker','cryo','brass','commander','avatar'];
    return Object.freeze({
      id:foe.id,name:foe.name,rank:foe.rank,kind:tiers[index],
      color:foe.color,eye:index>=7?'#ffd1b4':index>=4?'#a2edff':'#ffebad',
      body:index%3===0?'#465f72':index%3===1?'#625b75':'#49576c',
      metal:index%3===0?'#9facc0':index%3===1?'#c6b6a2':'#a4b7b7',
      ear:index%4,tail:index%3,plate:index>=6,
      size:1+(index%4)*.065,
      armor:1+Math.floor(index/3),
      crest:index>=9?'crown':index>=6?'shield':index>=3?'bolt':'paw',
      gearTeeth:7+index,tag:'hound-'+(index+1)
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
  function drawing(model,state='idle',frame=3) {
    const pose=states.includes(state)?state:'idle';
    const f=clampFrame(frame),phase=[0,-.15,.35,1,.66,.1][f];
    const n=model.rank,col=model.color;
    const forward=pose==='approach'?16+Math.floor(n/2):
      pose==='swipe'?23+Math.floor(n/2):pose==='guard'?-6:0;
    const slump=pose==='defeat'?19:pose==='impact'?7:pose==='victory'?-12:0;
    const x=Math.round(forward*phase),y=Math.round(slump*phase);
    const armExtension=pose==='swipe'?Math.round((18+n)*phase):0;
    const earTilt=pose==='impact'?Math.round(11*phase):0;
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
      const ex=Math.round((left?64:144)+dx),ey=Math.round((left?192:189)-(pose==='guard'?19*phase:pose==='swipe'&& !left?49*phase:0));
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
    const impact=pose==='impact'?'<path class="foe-impact-mark" d="M58 51 L50 29 L67 37 L78 20 L75 48 L92 57 L70 60 L65 78 Z" fill="#ffe0aa"/>':'';
    const circle='<circle cx="107" cy="114" r="'+gearR+'" stroke="'+col+'" fill="none" opacity=".3" stroke-width="3"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 240" class="foe-body-illustration"'+
      ' data-foe-id="'+model.id+'" data-foe-rank="'+n+'" data-pose="'+pose+'" data-frame="'+f+'" role="img" aria-hidden="true">'+
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
      shield+attack+impact+
      (pose==='victory'?'<path d="M62 22 L72 3 L81 22 L104 27 L80 33 L73 55 L63 34 L44 28 Z" fill="'+model.eye+'" opacity=".85"/>':'')+
      '</svg>';
  }
  function paint(container,foe,pose='idle',frame=3) {
    if(!container)return false;
    const model=profile(foe);
    if(!model)return false;
    container.innerHTML=drawing(model,pose,frame);
    container.dataset.foe=model.id;
    container.dataset.pose=pose;
    container.dataset.frame=String(clampFrame(frame));
    container.setAttribute('aria-label',model.name+' animated mechanical canine fighter');
    return true;
  }
  window.PawtopiaBattleFoeArt=Object.freeze({models,states,frameIds,profile,drawing,paint});
})();
