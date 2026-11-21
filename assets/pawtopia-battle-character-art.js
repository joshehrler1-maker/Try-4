/* Pawtopia battle illustrations. Full-body paintings load by breed.
   Articulated SVG drawings provide immediate and offline battle art. */
(() => {
  'use strict';
  const faces = [
    /* breed, fur, shadow, markings, eyes, coat pattern, ear, tail */
    ['Maine Coon','#c8803f','#77472e','#f3cb91','#e6b563','tabby','tuft','plume'],
    ['Siamese','#ead3ab','#6c5147','#3d312e','#80c7ff','point','large','taper'],
    ['Bengal','#cd9756','#66432b','#2d211d','#afd271','spots','upright','taper'],
    ['British Shorthair','#8c909a','#555761','#666874','#d7ac55','solid','round','thick'],
    ['Ragdoll','#ebdbc8','#8e807f','#b6a59d','#9ed6ff','point','tuft','plume'],
    ['Sphynx','#c79093','#935d69','#bb7d83','#a5cf6d','skin','large','taper'],
    ['Abyssinian','#b67a4e','#794b35','#d7a16d','#c8ca73','ticked','large','thin'],
    ['American Bobtail','#a17f6a','#69533f','#4d3e35','#d7c569','tabby','tuft','bob'],
    ['American Curl','#e7b985','#8e664a','#b77c5e','#b9cf78','patch','curl','plume'],
    ['American Shorthair','#a3a9ac','#696d79','#414957','#9cc871','tabby','upright','thick'],
    ['American Wirehair','#b5a896','#6b625a','#795f50','#c7cd77','curly','tuft','thick'],
    ['Balinese','#e5d4b8','#7c615d','#473b3c','#8abef0','point','large','plume'],
    ['Birman','#ede0c7','#8f736c','#594c52','#a2d4f7','point','tuft','plume'],
    ['Bombay','#30313c','#17191f','#484b58','#f7b958','solid','upright','taper'],
    ['Burmese','#654839','#342927','#82624e','#efbf6d','solid','round','taper'],
    ['Burmilla','#cbd0d2','#858b90','#73787d','#a1bd74','smoke','upright','thick'],
    ['Chartreux','#888e9c','#535b6c','#68717b','#e7c576','solid','round','thick'],
    ['Cornish Rex','#92717b','#55444f','#cba3ab','#cee274','wave','large','thin'],
    ['Devon Rex','#cdb9ab','#85736c','#ead5c1','#baca80','wave','large','thin'],
    ['Egyptian Mau','#c5bcae','#716c64','#434242','#bdd688','spots','large','thin'],
    ['European Shorthair','#c3a88e','#705647','#665046','#c2cf78','tabby','upright','taper'],
    ['Exotic Shorthair','#c7986c','#8a624d','#f1c793','#f1c16a','solid','round','thick'],
    ['Havana Brown','#66483c','#352c2a','#825448','#acdd86','solid','large','taper'],
    ['Japanese Bobtail','#f3eee4','#a86547','#b57648','#edc66b','calico','upright','bob'],
    ['Khao Manee','#f1f4ee','#c1c7ca','#e3e8ee','#a1daff','solid','large','thin'],
    ['Korat','#8e96a0','#505762','#a7b5c6','#abd882','solid','upright','taper'],
    ['LaPerm','#c5b9a7','#746452','#eddbc2','#e5c271','curly','tuft','plume'],
    ['Lykoi','#76777a','#414047','#9e9990','#ddc87b','shag','upright','thin'],
    ['Manx','#bb9976','#705844','#4d4139','#cbd187','tabby','round','none'],
    ['Nebelung','#818895','#4b566a','#b5b8c2','#96ce95','solid','tuft','plume'],
    ['Norwegian Forest Cat','#c4aa94','#776356','#e6d1b0','#b7d26b','tabby','tuft','plume'],
    ['Ocicat','#c29970','#755745','#513a2b','#bbd577','spots','large','taper'],
    ['Oriental Shorthair','#796b72','#473c45','#a0868e','#8cc68c','solid','large','thin'],
    ['Persian','#e5d4c9','#b4a498','#f7eadf','#e8c576','solid','round','plume'],
    ['Peterbald','#c99094','#915a61','#d6a6a4','#aed579','skin','large','thin'],
    ['Pixiebob','#ac906e','#654f41','#4d3e35','#d7cf87','spots','tuft','bob'],
    ['Ragamuffin','#d3c3b6','#907e73','#f4e8d9','#9fc8f7','point','tuft','plume'],
    ['Russian Blue','#8996a3','#495766','#b8c5d4','#a6d18b','solid','upright','taper'],
    ['Savannah','#b79b70','#65523d','#57432f','#d7c57f','spots','large','thin'],
    ['Scottish Fold','#b4b5ba','#696b71','#e0d8d7','#e2be7b','tabby','fold','thick'],
    ['Selkirk Rex','#c4b5a6','#6d635d','#e8d8c7','#d9bb73','curly','round','plume'],
    ['Siberian','#b49d7b','#6d594a','#494035','#9dc37f','tabby','tuft','plume'],
    ['Singapura','#e3cbb2','#a48766','#9e704e','#bccb70','ticked','large','thin'],
    ['Snowshoe','#eadbd3','#635354','#5e4446','#9fd7fc','point','upright','thick'],
    ['Somali','#c07a47','#805039','#e4b179','#c9ca78','ticked','tuft','plume'],
    ['Tonkinese','#a68978','#584a4b','#765e60','#9ddbc3','point','large','taper'],
    ['Toyger','#d18b4f','#854e35','#352923','#9ec26c','tabby','large','taper'],
    ['Turkish Angora','#f0ede5','#bcbeca','#dfddd6','#acd2f8','solid','tuft','plume'],
    ['Turkish Van','#f4e8db','#b0785a','#d2905a','#deb96c','patch','tuft','plume'],
    ['York Chocolate','#584238','#32292b','#785e4f','#bacb78','solid','tuft','plume'],
    ['Australian Mist','#c3aa94','#766250','#8b6a55','#bdc67e','spots','upright','taper'],
    ['Cymric','#ead4bb','#9c715f','#d08d62','#d7b96c','calico','tuft','none'],
    ['Donskoy','#c18f95','#8f626d','#dca8b4','#c9cc7d','skin','large','thin'],
    ['German Rex','#a68c7b','#615149','#cfb9a4','#d6c678','curly','large','taper'],
    ['Kurilian Bobtail','#b7a188','#725f4c','#584b40','#b9c875','tabby','tuft','bob'],
    ['Sokoke','#b29368','#6b523b','#49372d','#d5d478','spots','large','thin']
  ];
  const poseKeys = Object.freeze(['idle','walk','run','approach','swipe','guard','signature','ultimate','impact','recover','victory','defeat']);
  const specialColors = ['#ffe39e','#94d5fa','#a5ebb1','#d7b7ff','#8fe4d5','#fff0a4','#f1b58b','#b9b5ed'];
  const types = ['spark','frost','leaf','star','water','wind','gear','shadow'];
  const uniqueMoves = window.PawtopiaBattleData?.kits || [];
  // Each definition is individual and has a distinct face image, coat pattern,
  // head/body shape, tail, ears, color palette and 9 fully articulated drawings.
  // Authored individually for each approved breed and named battle skill.
  // Each fighter has a distinct fighting identity, dominant paw, reach, arc,
  // windup rhythm and balance. Styles are data, not reused silhouette motion.
  const fightingStyles = Object.freeze([
    ['Maine Coon','Timber Claw','Heavy Overhand','maul','right',33,17,7],
    ['Siamese','Moonlight Prism','Twin Moon Cross','prism','left',21,29,3],
    ['Bengal','Sunstripe Rush','Sunstripe Dash','rush','right',39,11,9],
    ['British Shorthair','Royal Shield','Royal Counter','shield','left',18,8,2],
    ['Ragdoll','Velvet Comet','Floating Comet','comet','right',31,25,8],
    ['Sphynx','Phantom Glimmer','Phantom Feint','feint','left',27,36,1],
    ['Abyssinian','Desert Mirage','Sand Mirage Feint','feint','right',30,21,5],
    ['American Bobtail','Bobtail Blitz','Bobtail Whirl','whirl','left',28,31,7],
    ['American Curl','Crescent Ear','Crescent Sweep','wave','right',24,35,6],
    ['American Shorthair','City Pounce','Rooftop Pounce','pounce','left',32,16,8],
    ['American Wirehair','Copper Tangle','Copper Snare','shield','right',25,26,4],
    ['Balinese','Bali Breeze','Breeze Glide','wave','left',29,34,5],
    ['Birman','Sacred Step','Sacred Lance','lance','right',30,14,5],
    ['Bombay','Midnight Flicker','Midnight Feint','feint','left',35,23,8],
    ['Burmese','Amber Flash','Amber Rush','rush','right',31,22,7],
    ['Burmilla','Silver Ripple','Silver Wave','wave','left',20,38,4],
    ['Chartreux','Blue Ember','Ember Strike','thunder','right',25,32,6],
    ['Cornish Rex','Spiral Sprint','Spiral Whirl','whirl','left',36,28,10],
    ['Devon Rex','Pixie Pulse','Pixie Prism','prism','right',24,27,3],
    ['Egyptian Mau','Nile Star','Nile Comet','comet','left',30,39,8],
    ['European Shorthair','Trail Streak','Trail Dash','rush','right',34,17,6],
    ['Exotic Shorthair','Cloudbreaker','Cloud Smash','maul','left',28,35,4],
    ['Havana Brown','Cocoa Whirl','Cocoa Corkscrew','whirl','right',24,42,5],
    ['Japanese Bobtail','Lucky Lantern','Lantern Spiral','prism','left',22,33,4],
    ['Khao Manee','Diamond Wink','Diamond Precision','lance','right',27,19,3],
    ['Korat','Storm Whisper','Storm Lance','lance','left',34,26,7],
    ['LaPerm','Curling Gust','Curling Wave','wave','right',23,37,5],
    ['Lykoi','Moon Shadow','Moon Shadow Feint','feint','left',32,29,8],
    ['Manx','Hilltop Hop','Hilltop Pounce','pounce','right',27,40,9],
    ['Nebelung','Mistfall','Mist Glide','comet','left',26,35,7],
    ['Norwegian Forest Cat','Northern Roar','Northern Maul','maul','right',39,24,11],
    ['Ocicat','Ocelot Dash','Ocelot Rush','rush','left',38,19,10],
    ['Oriental Shorthair','Silk Lance','Silk Spear','lance','right',40,13,6],
    ['Persian','Silken Storm','Silken Spiral','whirl','left',25,41,4],
    ['Peterbald','Quickstep Echo','Echo Feint','feint','right',37,18,10],
    ['Pixiebob','Pinecone Pounce','Pinecone Leap','pounce','left',33,22,6],
    ['Ragamuffin','Dream Fluff','Dream Comet','comet','right',28,32,5],
    ['Russian Blue','Azure Arc','Azure Sweep','wave','left',32,27,6],
    ['Savannah','Savanna Flash','Savanna Lunge','rush','right',41,17,11],
    ['Scottish Fold','Folded Comet','Folded Guard','shield','left',25,25,4],
    ['Selkirk Rex','Rex Rumble','Rumble Smash','maul','right',37,30,9],
    ['Siberian','Snowbloom','Snowflake Prism','prism','left',29,37,8],
    ['Singapura','Tiny Thunder','Thunder Jab','thunder','right',22,21,11],
    ['Snowshoe','Froststep','Frost Glide','wave','left',31,36,8],
    ['Somali','Sunburst Tail','Sunburst Tailspin','whirl','right',34,40,10],
    ['Tonkinese','Twilight Tango','Twilight Dance','prism','left',30,24,9],
    ['Toyger','Tiger Trail','Tiger Overhand','maul','right',40,27,12],
    ['Turkish Angora','Pearl Sweep','Pearl Crescent','wave','left',35,34,9],
    ['Turkish Van','Lake Skimmer','Lake Pounce','pounce','right',31,29,8],
    ['York Chocolate','Cocoa Cloud','Cocoa Shield','shield','left',27,28,4],
    ['Australian Mist','Outback Haze','Outback Mirage','feint','right',33,31,7],
    ['Cymric','Celtic Bounce','Celtic Pounce','pounce','left',29,34,7],
    ['Donskoy','Radiant Heat','Radiant Thunder','thunder','right',36,16,10],
    ['German Rex','Clockhand Spin','Clockhand Whirl','whirl','left',37,20,9],
    ['Kurilian Bobtail','Island Current','Island Flow','wave','right',32,33,7],
    ['Sokoke','Canopy Zigzag','Canopy Rush','rush','left',42,23,12]
  ].map(([breed,signature,label,technique,lead,reach,arc,tempo],index)=>Object.freeze({
    breed,signature,label,technique,lead,reach,arc,tempo,serial:index+1
  })));
  // Geometry is authored per technique, then personalized by all 56 individual
  // profiles. Six key-positions cover recoil, anticipation, contact and recovery.
  const techniqueRoutes=Object.freeze({
    maul:Object.freeze({lead:[[0,0],[-15,-26],[-9,-43],[28,-15],[23,13],[0,0]],off:[[0,0],[7,-8],[-5,-12],[2,5],[-4,6],[0,0]],body:[[0,0],[-6,-4],[-8,-12],[16,8],[7,4],[0,0]]}),
    prism:Object.freeze({lead:[[0,0],[-9,-8],[-22,-30],[24,-25],[17,9],[0,0]],off:[[0,0],[14,-5],[23,-28],[-19,-27],[-9,7],[0,0]],body:[[0,0],[2,-4],[-7,-9],[7,-5],[3,2],[0,0]]}),
    rush:Object.freeze({lead:[[0,0],[-10,-6],[8,-8],[35,-3],[29,4],[0,0]],off:[[0,0],[-11,6],[-8,0],[12,7],[6,2],[0,0]],body:[[0,0],[-7,3],[-12,0],[24,0],[14,4],[0,0]]}),
    shield:Object.freeze({lead:[[0,0],[-11,-4],[-27,-15],[-6,-31],[22,-11],[0,0]],off:[[0,0],[8,-12],[27,-18],[20,-24],[-3,-3],[0,0]],body:[[0,0],[-4,2],[-8,6],[-3,-9],[5,-3],[0,0]]}),
    comet:Object.freeze({lead:[[0,0],[4,-12],[-10,-33],[10,-45],[28,-14],[0,0]],off:[[0,0],[-13,-5],[-17,-20],[15,-21],[3,8],[0,0]],body:[[0,0],[1,-7],[-2,-18],[14,-22],[10,-5],[0,0]]}),
    feint:Object.freeze({lead:[[0,0],[-18,9],[-29,18],[27,-22],[15,4],[0,0]],off:[[0,0],[8,-7],[25,-13],[-9,-30],[-4,4],[0,0]],body:[[0,0],[-8,5],[-18,11],[17,-10],[4,-3],[0,0]]}),
    whirl:Object.freeze({lead:[[0,0],[-20,-3],[-14,-36],[21,-32],[25,9],[0,0]],off:[[0,0],[12,-7],[26,-25],[-19,-19],[-7,12],[0,0]],body:[[0,0],[-5,-3],[-12,-8],[11,-5],[6,2],[0,0]]}),
    lance:Object.freeze({lead:[[0,0],[-23,-5],[-29,-6],[40,-14],[28,-5],[0,0]],off:[[0,0],[-8,-3],[-14,-12],[5,7],[6,4],[0,0]],body:[[0,0],[-7,2],[-12,-3],[21,-5],[9,0],[0,0]]}),
    pounce:Object.freeze({lead:[[0,0],[-12,-8],[-16,-21],[33,-31],[22,4],[0,0]],off:[[0,0],[-7,-13],[-10,-25],[26,-20],[13,7],[0,0]],body:[[0,0],[-8,3],[-17,-17],[22,-24],[10,-5],[0,0]]}),
    wave:Object.freeze({lead:[[0,0],[-7,2],[-24,-17],[18,-39],[32,-9],[0,0]],off:[[0,0],[6,-3],[18,-14],[17,-36],[-10,-14],[0,0]],body:[[0,0],[-5,3],[-9,-5],[8,-11],[11,0],[0,0]]}),
    thunder:Object.freeze({lead:[[0,0],[-19,-29],[-16,-46],[20,12],[16,17],[0,0]],off:[[0,0],[-8,-8],[7,-15],[18,6],[-4,5],[0,0]],body:[[0,0],[-7,-4],[-13,-15],[14,14],[5,7],[0,0]]})
  });
  function identityFor(breed){
    return fightingStyles.find(style=>style.breed===breed)||fightingStyles[0];
  }
  const collection = Object.freeze(faces.map((a,index) => Object.freeze({
    breed:a[0], fur:a[1], shade:a[2], marks:a[3], eyes:a[4],
    pattern:a[5], ears:a[6], tail:a[7],
    cape:index%4===0?'#643ca9':index%4===1?'#503b91':index%4===2?'#7544a8':'#593c83',
    motion:index%8, color:specialColors[index%8], style:types[index%8],
    uniq:index, kit:uniqueMoves[index]?.id || 'cat-kit-'+String(index+1).padStart(2,'0'),
    skill:uniqueMoves[index]?.signature || 'Hero Spark',
    fightingStyle:fightingStyles[index],
    choreography:Object.freeze({
      reach:8+((index*13+5)%33),
      arc:11+((index*17+9)%31),
      castLift:7+((index*19+3)%27),
      counter:4+((index*7+11)%19),
      tempo:55+((index*11)%44),
      tailSwing:5+((index*23+6)%19)
    }),
    poses:poseKeys
  })));
  function getArt(breed) {
    return collection.find(profile=>profile.breed===breed)||collection[0];
  }
  function safeColor(value,fallback) {
    return /^#[0-9a-f]{6}$/i.test(value)?value:fallback;
  }
  function portrait(art) {
    const kit=window.PawtopiaBattleData?.kitFor(art.breed);
    if(!kit)return '';
    const sprite=kit.sprite;
    const src=sprite.src;
    if(!/^assets\/scenes\/adopt-[a-z-]+\.webp$/.test(src) &&
       !/^assets\/scenes\/adopt-catalog-[12]\.webp$/.test(src))return '';
    let x=45,y=12,w=130,h=130;
    if(src.includes('adopt-catalog-')){
      const n=art.uniq-6,cell=(n%25+25)%25;
      const col=cell%5,row=Math.floor(cell/5);
      x=45-col*130;y=12-row*130;w=650;h=650;
    }
    return '<image href="'+src+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+
      '" preserveAspectRatio="none" clip-path="url(#face)" />';
  }
  function furMarkings(art,pose) {
    const base = art.pattern;
    const n=art.uniq;
    const shapes=[];
    if(base==='tabby'||base==='ticked'){
      for(let i=0;i<(base==='tabby'?5:3);i++){
        const x=87+(i%2)*22+((n*3+i)%7-3),y=141+i*10;
        shapes.push('<path d="M'+x+' '+y+' q'+(i%2?13:-13)+' -5 '+(i%2?15:-15)+' 9" stroke="'+art.marks+'" stroke-width="'+(base==='tabby'?4:2.5)+'" stroke-linecap="round" fill="none" opacity=".73"/>');
      }
    } else if(base==='spots'){
      for(let i=0;i<8;i++){
        const x=80+(i*19+n*3)%62,y=141+Math.floor(i/3)*17;
        shapes.push('<ellipse cx="'+x+'" cy="'+y+'" rx="'+(3+i%3)+'" ry="'+(4+(i+n)%2)+'" fill="'+art.marks+'" opacity=".7"/>');
      }
    } else if(base==='point'){
      shapes.push('<path d="M89 139 Q112 162 136 139 L127 187 Q112 176 96 187 Z" fill="'+art.shade+'" opacity=".75"/>');
    } else if(base==='calico'||base==='patch'){
      shapes.push('<path d="M91 136 Q106 148 99 179 Q87 168 80 153 Z M128 139 Q140 151 135 170 Q122 178 116 163 Z" fill="'+art.marks+'" opacity=".62"/>');
    } else if(base==='curly'||base==='wave'||base==='shag'){
      for(let i=0;i<9;i++){
        const x=78+(i%3)*21,y=147+Math.floor(i/3)*18;
        shapes.push('<path d="M'+x+' '+y+' q10 -8 10 1 q-1 9 -10 7" stroke="'+art.marks+'" stroke-width="2.8" fill="none" opacity=".55"/>');
      }
    } else if(base==='skin'){
      for(let i=0;i<4;i++){
        const y=145+i*11;shapes.push('<path d="M95 '+y+' q18 6 32 -1" fill="none" stroke="'+art.shade+'" stroke-width="2" opacity=".55"/>');
      }
    } else if(base==='smoke'){
      shapes.push('<path d="M89 136 Q106 151 108 174 Q129 164 134 136" fill="none" stroke="'+art.marks+'" stroke-width="7" opacity=".5"/>');
    }
    return shapes.join('');
  }
  function ears(art){
    const {fur,shade,marks}=art;
    const left=art.ears==='round'?'M57 55 Q43 4 80 26 L91 49 Z':
      art.ears==='fold'?'M58 54 Q33 20 75 37 L86 55 Z':
      art.ears==='curl'?'M56 55 Q29 16 53 18 Q81 13 86 51 Z':
      'M55 55 L47 '+(art.ears==='tuft'?1:11)+' Q65 16 86 53 Z';
    const right=art.ears==='round'?'M134 49 L147 25 Q182 3 163 58 Z':
      art.ears==='fold'?'M135 55 L151 35 Q191 18 164 54 Z':
      art.ears==='curl'?'M134 50 Q148 11 173 18 Q189 28 164 55 Z':
      'M134 53 Q161 17 173 '+(art.ears==='tuft'?2:12)+' L167 57 Z';
    return '<g class="art-ear-flex" fill="'+fur+'" stroke="'+shade+'" stroke-width="4" stroke-linejoin="round"><path d="'+left+'"/><path d="'+right+'"/></g><g fill="'+marks+'" opacity=".55"><path d="M61 42 L57 22 Q71 33 75 48 Z"/><path d="M147 48 L163 23 L161 47 Z"/></g>';
  }
  function tail(art,pose,frame=3) {
    if(art.tail==='none')return '';
    const phase=Math.max(0,Math.min(5,Number.isFinite(frame)?frame:3))/5;
    const envelope=Math.sin(Math.PI*phase);
    const offset=pose==='victory'?24:pose==='swipe'?-22:pose==='defeat'?-10:
      pose==='ultimate'?20:pose==='run'?-17:pose==='walk'?-8:pose==='signature'?14:0;
    // Tail swing lags behind the torso and settles naturally at neutral.
    const raw=art.uniq%3*7-7+
      (offset+Math.sin((phase-.18)*Math.PI*2)*art.choreography.tailSwing*.65)*envelope;
    // Bound the secondary swing inside the 220px SVG viewBox. The previous
    // tail extended to x246 on some breeds and clipped at the right edge.
    const s=Math.round(Math.tanh(raw/20)*17);
    const d=art.tail==='bob'?
      'M141 176 Q'+(169+s*.2)+' 166 '+(174+s*.45)+' 151':
      'M142 175 Q'+(169+s*.55)+' 205 '+(177+s)+' 133 Q'+(184+s)+' 103 '+(169+s)+' 92';
    const width=art.tail==='plume'?25:art.tail==='thick'?20:art.tail==='taper'?12:9;
    const brush=art.tail==='plume'?'<path d="M'+(169+s)+' 119 l-8 -13 l17 3 l-3 -19 l13 13" stroke="'+art.fur+'" stroke-width="4" fill="none"/>':'';
    return '<g class="art-tail-flex"><path d="'+d+'" fill="none" stroke="'+art.shade+'" stroke-width="'+(width+5)+'" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="'+art.fur+'" stroke-width="'+width+'" stroke-linecap="round"/>'+brush+'</g>';
  }
  function paw(art,x1,y1,x2,y2,side,pose) {
    const dx=x2-x1,dy=y2-y1;
    const thick=art.ears==='large'?17:art.tail==='plume'?21:19;
    const stroke=art.fur,outline=art.shade;
    const claw=pose==='swipe'||pose==='signature'||pose==='ultimate';
    const back='<path d="M'+x1+' '+y1+' Q'+(x1+dx*.62+(side?12:-12))+' '+(y1+dy*.4-7)+' '+x2+' '+y2+
      '" fill="none" stroke="'+outline+'" stroke-width="'+(thick+7)+'" stroke-linecap="round"/>';
    const limb='<path d="M'+x1+' '+y1+' Q'+(x1+dx*.62+(side?12:-12))+' '+(y1+dy*.4-7)+' '+x2+' '+y2+
      '" fill="none" stroke="'+stroke+'" stroke-width="'+thick+'" stroke-linecap="round"/>';
    const tip='<ellipse cx="'+x2+'" cy="'+y2+'" rx="'+(thick/1.3)+'" ry="'+(thick/1.35)+'" fill="'+stroke+'" stroke="'+outline+'" stroke-width="2.8" transform="rotate('+(side?12:-12)+' '+x2+' '+y2+')"/>';
    const toe=Array.from({length:3},(_,i)=>{
      const ox=(i-1)*6;
      return '<path d="M'+(x2+ox)+' '+(y2+7)+' l'+ox*.12+' 5" stroke="'+outline+'" stroke-linecap="round" opacity=".62" stroke-width="1.7"/>';
    }).join('');
    const claws=claw?Array.from({length:3},(_,i)=>{
      const ox=(i-1)*6;
      return '<path d="M'+(x2+ox)+' '+(y2-9)+' q'+(side?6:-6)+' -7 '+(side?9:-9)+' -12" fill="none" stroke="#f6e9d9" stroke-width="2.2" stroke-linecap="round"/>';
    }).join(''):'';
    return '<g class="art-paw art-paw-'+(side?'right':'left')+'">'+back+limb+tip+toe+claws+'</g>';
  }
  function abilityArt(art,pose,frame=3){
    if(pose!=='signature'&&pose!=='ultimate')return '';
    const ultimate=pose==='ultimate',cnt=ultimate?9:5;
    const pulse=keyframeValue([.28,.5,.8,1,1.14,.86],frame);
    const r=Math.round((ultimate?73:48)*pulse),cx=ultimate?109:167,cy=ultimate?105:73;
    const glyph=art.style==='frost'?'❄':art.style==='leaf'?'❧':art.style==='star'?'✦':
      art.style==='water'?'◇':art.style==='wind'?'➳':art.style==='gear'?'⚙':
      art.style==='shadow'?'✧':'✴';
    const size=ultimate?19:15;
    let fx='<g class="art-ability" fill="'+art.color+'" stroke="'+art.color+'" opacity=".95"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" stroke-width="'+(ultimate?5:3)+'" fill="none" opacity=".48"/>';
    for(let i=0;i<cnt;i++){
      const a=(i*2*Math.PI/cnt)+art.uniq*.17,ex=Math.round(cx+Math.cos(a)*r),ey=Math.round(cy+Math.sin(a)*r);
      fx+='<circle cx="'+ex+'" cy="'+ey+'" r="'+(2+(i+art.uniq)%4)+'" opacity=".9"/>';
      fx+='<path d="M'+ex+' '+(ey-10)+' l4 10 l-4 10 l-4 -10 Z" fill="'+art.color+'"/>';
    }
    fx+='</g><text x="'+cx+'" y="'+(cy+size*.34)+'" text-anchor="middle" font-size="'+size+'" font-family="serif" fill="#fff1d4" stroke="#564778" stroke-width="1" paint-order="stroke">'+glyph+'</text>';
    if(ultimate)fx+='<path d="M41 147 Q110 '+(60+(art.uniq%5)*3)+' 179 147" fill="none" stroke="'+art.color+'" stroke-width="6" stroke-linecap="round" opacity=".85"/>';
    return fx;
  }

  /* An original, recognizable visual signature for EACH of 56 breeds.
     Individual skill titles determine the seal initials. Its geometry depends
     on the breed's own seed, cast posture and action frame, not just 8 themes. */
  function signatureSeal(art,pose,frame=3) {
    if(pose!=='signature'&&pose!=='ultimate')return '';
    const final=pose==='ultimate';
    const seed=art.uniq+1;
    const cycle=Math.max(0,Math.min(5,frame));
    const growth=keyframeValue([.25,.46,.74,1,1.12,.79],cycle);
    const x=final?113:166,y=final?105:75;
    const radius=Math.round((final?61:35)*growth);
    const corners=5+seed%6;
    const rotation=seed*.32+(cycle-3)*.09;
    const outer=[],inner=[];
    for(let i=0;i<corners;i++){
      const angle=rotation+Math.PI*2*i/corners-Math.PI/2;
      const depth=.33+(seed*7+i*3)%7/25;
      outer.push([Math.round(x+Math.cos(angle)*radius),Math.round(y+Math.sin(angle)*radius)]);
      inner.push([Math.round(x+Math.cos(angle+.19)*(radius*depth)),Math.round(y+Math.sin(angle+.19)*(radius*depth))]);
    }
    const coords=outer.flatMap((p,i)=>[p,inner[i]]);
    const path='M'+coords.map(p=>p[0]+' '+p[1]).join(' L')+' Z';
    const label=String(art.skill).split(/\s+/).slice(0,2).map(s=>s[0]||'').join('').toUpperCase();
    const arcs=Array.from({length:3+(seed%3)},(_,i)=>{
      const a=rotation+Math.PI*2*i/(3+seed%3);
      const r=Math.max(8,radius*(.57+i%2*.15));
      const x1=Math.round(x+Math.cos(a)*r),y1=Math.round(y+Math.sin(a)*r);
      const x2=Math.round(x+Math.cos(a+.72)*r),y2=Math.round(y+Math.sin(a+.72)*r);
      return '<path d="M'+x1+' '+y1+' Q'+Math.round(x+Math.cos(a+.3)*(r+8))+' '+
        Math.round(y+Math.sin(a+.3)*(r+8))+' '+x2+' '+y2+
        '" fill="none" stroke="'+(i%2?art.eyes:art.color)+'" stroke-width="'+(final?3:2)+'" opacity=".8"/>';
    }).join('');
    const accent=final?'M'+x+' '+(y-radius-9)+' L'+(x+7)+' '+y+' L'+x+' '+(y+radius+9)+' L'+(x-7)+' '+y+' Z':'';
    return '<g class="art-skill-sigil" data-skill-id="'+(seed)+'" data-skill-pose="'+pose+'">'+
      '<path d="'+path+'" stroke="'+art.color+'" stroke-width="'+(final?3:2.2)+
      '" fill="'+art.shade+'" fill-opacity=".37" stroke-linejoin="round"/>'+
      (accent?'<path d="'+accent+'" stroke="'+art.eyes+'" stroke-width="1.5" fill="none" opacity=".8"/>':'')+
      arcs+
      '<text x="'+x+'" y="'+(y+5)+'" fill="#fff7dd" stroke="'+art.shade+
      '" stroke-width="2" paint-order="stroke" font-size="'+(final?16:12)+
      '" font-weight="900" text-anchor="middle">'+label+'</text></g>';
  }
  function individualAttackTrail(art,pose,frame=3) {
    if(!['swipe','guard','approach','impact'].includes(pose))return '';
    const phase=Math.max(0,Math.min(5,frame));
    const seed=art.uniq+1;
    const brightness=keyframeValue([.2,.38,.65,1,.7,.23],phase);
    if(pose==='guard'){
      const span=33+seed%17,y=149;
      return '<g class="art-personal-guard" data-guard-id="'+seed+'" opacity="'+brightness+'">'+
        '<path d="M111 '+(y-span)+' Q'+(168+seed%11)+' '+(y-12)+' 111 '+(y+span)+
        ' Q'+(54-seed%9)+' '+(y-12)+' 111 '+(y-span)+' Z" fill="'+art.color+
        '" fill-opacity=".16" stroke="'+art.eyes+'" stroke-width="4"/>'+
        '<path d="M111 '+(y-span+12)+' V'+(y+span-10)+' M'+(111-span/2)+' '+y+' H'+(111+span/2)+
        '" stroke="'+art.color+'" stroke-width="3" fill="none"/></g>';
    }
    if(pose==='impact'){
      const x=141+seed%9,y=100;
      return '<g class="art-personal-impact" opacity="'+brightness+'"><path d="M'+x+' '+(y-18)+' l'+
        (8+seed%8)+' '+(11+seed%5)+' l17 -4 l-12 12 l8 14 l-19 -8 l-12 12 l4 -20 Z" stroke="'+art.color+
        '" stroke-width="2" fill="'+art.eyes+'"/></g>';
    }
    const x=pose==='swipe'?152:55,y=pose==='swipe'?84:161;
    const stroke=art.color,lines=2+seed%3, length=22+seed%17;
    const marks=Array.from({length:lines},(_,i)=>{
      const offset=i*9-11;
      const xx=pose==='swipe'?x+offset:x-offset;
      const yy=y+offset;
      const end=pose==='swipe'?xx+length:xx-length;
      return '<path d="M'+xx+' '+(yy+length*.45)+' Q'+(xx+end)/2+' '+(yy-length*.58-seed%9)+
        ' '+end+' '+(yy-length*.24)+'" stroke="'+stroke+'" fill="none" stroke-width="'+(2+(seed+i)%3)+
        '" stroke-linecap="round"/>';
    }).join('');
    return '<g class="art-personal-motion" data-motion-id="'+seed+'" opacity="'+brightness+'">'+marks+'</g>';
  }
  const poseDef={
    idle:[[68,149,57,188],[152,149,164,190],[78,207,0],[141,206,0],0],
    walk:[[66,145,53,174],[151,144,170,172],[84,207,0],[145,207,0],-3],
    run:[[66,138,50,153],[152,137,179,155],[89,205,0],[148,204,0],-8],
    approach:[[66,143,51,162],[152,141,177,158],[89,206,-7],[151,208,6],-8],
    swipe:[[69,143,58,169],[151,139,193,86],[85,211,0],[152,207,-5],-14],
    guard:[[70,137,104,139],[150,136,114,151],[81,209,0],[146,209,0],0],
    signature:[[66,145,61,161],[151,134,173,65],[85,210,-5],[151,206,0],-16],
    ultimate:[[69,135,41,64],[150,134,179,59],[82,213,-8],[148,211,7],-8],
    impact:[[69,142,48,166],[151,144,166,163],[80,213,-12],[146,210,10],12],
    recover:[[68,149,57,188],[152,149,164,190],[78,207,0],[141,206,0],0],
    victory:[[69,137,43,70],[151,136,172,65],[83,209,0],[145,205,0],-10],
    defeat:[[66,158,54,209],[151,157,165,213],[91,223,10],[144,222,14],17]
  };
  const animationFrames=Object.freeze([0,1,2,3,4,5]);
  // Half-step in-betweens improve the motion without a new paid sprite pipeline.
  // Six original poses are preserved for older previews and regression tests.
  const smoothFrames=Object.freeze([0,.5,1,1.5,2,2.5,3,3.5,4,4.5,5]);
  const flowFrames=Object.freeze(Array.from({length:21},(_,i)=>i/4));
  const motionWeight=Object.freeze([0,-.18,.25,1,.73,.13]);
  function keyframeValue(values,frame=3) {
    const phase=Number.isFinite(frame)?Math.max(0,Math.min(5,frame)):3;
    const start=Math.floor(phase),end=Math.min(start+1,5);
    const amount=phase-start;
    return values[start]+(values[end]-values[start])*amount;
  }
  function recoveryPose(art,fromPose,frame) {
    const source=['swipe','signature','ultimate','guard','impact','approach','walk','run','victory','defeat'].includes(fromPose)?fromPose:'swipe';
    const start=choreograph(art,source,5),finish=choreograph(art,'idle',3);
    const t=Math.max(0,Math.min(1,Number.isFinite(frame)?frame/5:1));
    const eased=t*t*(3-2*t);
    return start.map((item,i)=>Array.isArray(item)?
      item.map((v,j)=>Math.round(v+(finish[i][j]-v)*eased)):
      Math.round(item+(finish[i]-item)*eased));
  }
  function flowSignature(art){
    const breath=2.45+(art.uniq%7)*.18;
    return Object.freeze({
      breathDuration:breath.toFixed(2)+'s',
      headDuration:(breath*1.8).toFixed(2)+'s',
      stanceDuration:(breath*1.5).toFixed(2)+'s',
      tailDuration:(2.7+((art.uniq*3)%11)*.17).toFixed(2)+'s',
      earDuration:(3.2+((art.uniq*5)%9)*.21).toFixed(2)+'s',
      stride:8+art.uniq%8,
      gaitLift:6+art.uniq%7,
      agility:1+art.fightingStyle.tempo/20
    });
  }
  function personalMotion(art,pose,frame=3){
    const style=art.fightingStyle||identityFor(art.breed);
    const route=techniqueRoutes[style.technique]||techniqueRoutes.maul;
    const power=pose==='ultimate'?1.25:pose==='signature'?1:
      pose==='swipe'?.65:pose==='guard'?.36:pose==='approach'?.22:0;
    const scaleX=(style.reach/32)*power;
    const scaleY=(style.arc/29)*power;
    function delta(points) {
      return [
        Math.round(keyframeValue(points.map(point=>point[0]),frame)*scaleX),
        Math.round(keyframeValue(points.map(point=>point[1]),frame)*scaleY)
      ];
    }
    const lead=delta(route.lead);
    const offhand=delta(route.off);
    const torso=delta(route.body);
    const leadIndex=style.lead==='left'?0:1;
    return Object.freeze({leadIndex,lead,offhand,torso,label:style.label,technique:style.technique});
  }
  // A small grounded weight shift makes the back/torso react to paw force.
  // Feet remain independent of the torso so they do not float with the strike.
  function torsoWeight(art,pose,frame=3) {
    const weight=keyframeValue(motionWeight,frame);
    const attack=['swipe','signature','ultimate'].includes(pose);
    const guard=pose==='guard',hit=pose==='impact',travel=['walk','run','approach'].includes(pose);
    const shift=Math.round((attack?art.choreography.reach/6:guard?-3:hit?-4:0)*weight);
    const lift=Math.round((pose==='ultimate'?-7:pose==='signature'?-5:attack?-2:hit?3:0)*Math.max(0,weight));
    const tilt=Math.round((attack?Math.min(6,art.choreography.arc/5):guard?-3:hit?-5:0)*weight);
    const personal=personalMotion(art,pose,frame);
    const gait=travel?Math.sin((frame/5)*Math.PI*2*(pose==='run'?2:1))*Math.min(3,art.choreography.arc/12):0;
    // Do not translate the feet with this body movement. The rear paws stay
    // planted even when the cat performs a forceful heavy or acrobatic move.
    return Object.freeze({
      shift:shift+Math.round(personal.torso[0]*.65)+Math.round(gait*.3),
      lift:lift+Math.round(personal.torso[1]*.5)-Math.round(Math.abs(gait)),
      tilt:tilt+Math.round(personal.torso[0]*.16)+Math.round(gait*.5)
    });
  }
  function choreograph(art,pose,frame=3) {
    const phase=Number.isFinite(frame)?Math.max(0,Math.min(5,frame)):3;
    const base=poseDef.idle,target=poseDef[pose]||base,weight=keyframeValue(motionWeight,phase);
    const {reach,arc,castLift,counter}=art.choreography;
    const active=pose!=='idle'&&pose!=='victory'&&pose!=='defeat';
    const extra=pose==='swipe'?reach:pose==='signature'?Math.round(reach*.85):
      pose==='ultimate'?reach+5:pose==='guard'?-counter:0;
    const drawn=[];
    for(let i=0;i<4;i++){
      const idle=base[i],goal=target[i],front=i===1,foot=i>=2;
      let x=Math.round(idle[0]+(goal[0]-idle[0])*weight);
      let y=Math.round(idle[1]+(goal[1]-idle[1])*weight);
      if(!foot){
        // Keep both shoulder AND paw-tip coordinates for articulated arms.
        // Earlier code dropped the fourth value, making both paws render as right paws.
        let handX=Math.round(idle[2]+(goal[2]-idle[2])*weight);
        let handY=Math.round(idle[3]+(goal[3]-idle[3])*weight);
        if(active&&front){
          handX+=Math.round(extra*weight);
          handY-=Math.round((pose==='signature'||pose==='ultimate'?castLift:arc/3)*Math.max(0,weight));
        }else if(active&&i===0){
          handX-=Math.round(counter*weight*.32);
          handY+=Math.round(arc*weight*.18);
        }
        drawn.push([x,y,handX,handY]);
      }else{
        x+=Math.round(((art.uniq%5)-2)*(i===2?1:-1)*weight);
        y+=Math.round((art.uniq%4-1.5)*Math.max(0,weight));
        drawn.push([x,y,goal[2]||0]);
      }
    }
    if(['walk','run','approach'].includes(pose)){
      const signature=flowSignature(art),cycle=pose==='run'?2:1;
      const wave=Math.sin(frame/5*Math.PI*2*cycle);
      const step=signature.stride*(pose==='walk'?.55:pose==='run'?1.15:.85);
      const lift=signature.gaitLift*(pose==='walk'?.55:pose==='run'?1.2:1);
      for(let i=2;i<4;i++){
        const stride=i===2?wave:-wave;
        drawn[i][0]+=Math.round(stride*step);
        drawn[i][1]-=Math.round(Math.max(0,stride)*lift);
      }
      drawn[0][2]-=Math.round(wave*step*.85);
      drawn[1][2]+=Math.round(wave*step*.85);
      drawn[0][3]-=Math.round(Math.max(0,-wave)*lift*.45);
      drawn[1][3]-=Math.round(Math.max(0,wave)*lift*.45);
    }
    const individual=personalMotion(art,pose,frame);
    for(let i=0;i<2;i++){
      const delta=i===individual.leadIndex?individual.lead:individual.offhand;
      drawn[i][2]=Math.min(219,Math.max(4,drawn[i][2]+delta[0]));
      drawn[i][3]=Math.min(220,Math.max(12,drawn[i][3]+delta[1]));
    }
    const headAngle=Math.round(target[4]*weight+
      (pose==='impact'?-counter*.2:0)+individual.torso[0]*.14);
    drawn.push(headAngle);
    return drawn;
  }
  function fightingStyleTrail(art,pose,frame=3){
    if(!['swipe','signature','ultimate'].includes(pose))return '';
    const style=art.fightingStyle;
    const lead=style.lead==='left'?0:1;
    const start=choreograph(art,pose,1.5)[lead];
    const apex=choreograph(art,pose,3)[lead];
    const finish=choreograph(art,pose,4.5)[lead];
    const opacity=Math.max(.12,Math.min(.9,keyframeValue([.12,.25,.58,.9,.68,.2],frame)));
    const thick=pose==='ultimate'?7:pose==='signature'?5:3;
    // This path traces the fighter's OWN animated claw trajectory, not a
    // generic star/swish duplicated across all 56 cats.
    const d='M'+start[2]+' '+start[3]+' Q'+
      Math.round((start[2]+apex[2])/2+style.arc*.15)+' '+
      Math.round((start[3]+apex[3])/2-style.arc*.4)+' '+
      apex[2]+' '+apex[3]+' Q'+
      Math.round((apex[2]+finish[2])/2+style.reach*.1)+' '+
      Math.round((apex[3]+finish[3])/2-style.arc*.28)+' '+
      finish[2]+' '+finish[3];
    return '<g class="art-fighting-style-trail" data-style="'+style.serial+
      '" data-technique="'+style.technique+'" opacity="'+opacity+'">'+
      '<path d="'+d+'" fill="none" stroke="'+art.color+'" stroke-width="'+
      thick+'" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<circle cx="'+apex[2]+'" cy="'+apex[3]+'" r="'+
      (pose==='ultimate'?7:4)+'" fill="'+art.eyes+'" opacity=".8"/></g>';
  }
  // Small bounded markup cache avoids rebuilding elaborate art geometry for
  // repeated previews. Never caches user saves or persistent data.
  const svgCache=new Map(),svgCacheLimit=96;

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

  // Width of crown, width at cheeks, muzzle width, chin depth, torso width,
  // shoulder height, reach and ear size, in artwork units. Ordered by breed.
  const anatomyProfiles=[
    [55,60,28,24,51,116,22,37], [43,36,19,28,35,111,29,43], [49,49,24,24,44,117,26,27],
    [56,56,22,18,52,121,18,19], [55,58,24,24,50,114,23,30], [45,44,19,25,41,111,26,44],
    [46,43,20,26,40,113,27,36], [52,57,25,23,49,120,21,29], [49,49,21,23,43,117,22,33],
    [52,53,25,21,47,118,23,25], [51,54,24,22,48,119,22,27], [43,37,18,29,35,109,29,45],
    [52,55,24,22,50,117,23,29], [51,52,21,20,47,118,23,26], [50,51,22,23,46,119,24,24],
    [50,51,22,22,47,117,22,29], [54,57,22,19,52,122,20,21], [41,38,17,29,34,107,30,42],
    [47,42,18,24,38,112,27,45], [48,46,22,25,42,112,28,33], [51,52,24,23,47,116,24,26],
    [57,59,18,14,52,123,16,18], [47,43,21,26,42,114,26,33], [48,45,20,29,42,115,25,31],
    [46,44,19,24,41,115,26,34], [54,51,21,21,46,119,23,31], [51,55,23,22,46,116,23,33],
    [46,45,24,25,40,116,26,30], [55,57,23,22,52,119,19,22], [47,43,18,27,41,114,26,32],
    [49,52,21,30,50,113,26,36], [48,48,25,26,46,112,28,34], [41,34,17,32,34,105,31,47],
    [58,61,17,13,53,123,16,19], [44,37,18,31,34,106,31,45], [54,59,27,26,53,113,24,33],
    [55,56,25,24,51,119,22,27], [49,44,20,24,41,114,25,31], [43,40,20,31,39,106,31,46],
    [55,58,23,19,50,121,18,17], [55,58,24,22,51,120,20,24], [54,59,25,23,53,116,23,32],
    [46,43,18,19,37,121,18,37], [48,46,21,26,45,116,24,30], [47,50,21,27,44,113,27,37],
    [49,46,22,24,42,115,25,32], [52,55,25,26,50,112,26,27], [46,42,19,27,39,111,26,36],
    [52,56,24,26,49,115,24,32], [53,55,23,24,49,120,21,24], [49,49,23,24,46,116,24,31],
    [55,59,23,21,52,120,19,23], [45,42,20,27,42,113,26,38], [50,52,21,22,46,120,21,27],
    [51,53,23,27,48,117,23,30], [45,43,22,27,41,111,29,32]
  ];
  const path=(d,fill,extra='')=>'<path d="'+d+'" fill="'+fill+'" '+extra+'/>';
  function fullHead(art,key,frame){
    const [width,cheek,muzzle,chin,,,,earSize]=anatomyProfiles[art.uniq];
    const n=art.uniq,cx=110;
    const furry=art.tail==='plume'||art.pattern==='shag'||art.pattern==='curly';
    const point=art.pattern==='point',skin=art.pattern==='skin';
    const earColor=point?art.shade:art.fur;
    const left=cx-width*.74,right=cx+width*.74;
    const folded=art.ears==='fold',rounded=art.ears==='round',curled=art.ears==='curl';
    const earTop=folded?38:Math.max(4,48-earSize),eyeY=76+(chin-22)*.21;
    const cheekY=95+(chin-22)*.26,noseY=91+(chin-22)*.52,chinY=101+chin;
    const earsMarkup=[left,right].map((x,i)=>{
      const side=i?1:-1,tip=x+side*(folded?20:rounded?11:earSize*.43);
      const d=folded?
        'M'+(x-side*14)+' 55 Q'+tip+' 26 '+(tip-side*5)+' 45 Q'+x+' 58 '+(x+side*4)+' 62 Z':
        rounded?
        'M'+(x-side*15)+' 55 Q'+(tip-side*12)+' '+(earTop-5)+' '+tip+' '+(earTop+6)+' Q'+(tip+side*11)+' 38 '+(x+side*10)+' 56 Z':
        'M'+(x-side*15)+' 54 Q'+(x-side*9)+' '+(earTop+14)+' '+tip+' '+earTop+
          (curled?' Q'+(tip+side*12)+' '+(earTop+1)+' '+(tip+side*4)+' '+(earTop+13):'')+
          ' Q'+(tip+side*4)+' 29 '+(x+side*12)+' 55 Z';
      const inner=path('M'+(x-side*4)+' 48 Q'+tip+' '+(earTop+8)+' '+(tip+side*2)+' '+(earTop+12)+
        ' Q'+x+' 40 '+(x+side*5)+' 51 Z',skin?art.marks:'#d39893','opacity=".60"');
      const tuft=art.ears==='tuft'?path('M'+(tip-side*2)+' '+(earTop+3)+' l'+(side*4)+' -8 l'+(side*1)+' 10 Z',art.shade):'';
      return path(d,earColor,'stroke="'+art.shade+'" stroke-width="2.3" stroke-linejoin="round"')+inner+tuft;
    }).join('');
    const outline='M'+(cx-width)+' 70 C'+(cx-width)+' 38 '+(cx-28-(earSize%5))+' 31 110 32 C'+(138+(muzzle%5))+' 31 '+(cx+width)+' 38 '+(cx+width)+' 70 '+
      'Q'+(cx+cheek+5)+' '+(cheekY-8)+' '+(cx+cheek-2)+' '+cheekY+
      (furry?' l-9 9 l3 6 l-13 -1':'')+
      ' Q'+(cx+cheek-13)+' '+(chinY-3)+' 110 '+chinY+
      ' Q'+(cx-cheek+13)+' '+(chinY-3)+' '+(cx-cheek+2)+' '+cheekY+
      (furry?' l-8 -1 l3 -8 l-4 -5':'')+' Q'+(cx-width-2)+' 83 '+(cx-width)+' 70 Z';
    const clipId='cat-face-contour-'+art.uniq;
    const lightId='cat-face-light-'+art.uniq;
    const faceFill='<defs><clipPath id="'+clipId+'">'+path(outline,'white')+'</clipPath>'+
      '<radialGradient id="'+lightId+'" cx="36%" cy="23%" r="76%"><stop stop-color="#ffe7cb" stop-opacity=".39"/>'+
      '<stop offset=".55" stop-color="#ffdaaa" stop-opacity=".05"/><stop offset="1" stop-color="#212b55" stop-opacity=".43"/></radialGradient></defs>';
    let marking='';
    if(point){
      marking=path('M67 80 Q86 51 110 57 Q138 54 151 78 L153 100 Q138 123 110 124 Q82 118 67 101 Z',art.shade,'opacity=".71"');
      if(['Birman','Snowshoe'].includes(art.breed))marking+=path('M109 58 Q101 78 102 92 Q110 97 116 92 L111 61 Z',art.fur);
    }else if(art.pattern==='tabby'||art.pattern==='ticked'||art.pattern==='wave'){
      marking=[0,1,2].map(j=>path('M'+(cx-width+3)+' '+(59+j*13)+' q18 -5 '+(30+j*2)+' 8 q-19 -4 -33 4 Z',art.shade,'opacity=".55"')+
        path('M'+(cx+width-3)+' '+(59+j*13)+' q-18 -6 -35 9 q22 -6 36 2 Z',art.shade,'opacity=".51"')).join('')+
        path('M92 45 Q105 54 110 62 Q116 50 129 44 Q117 51 110 70 Q104 56 92 45 Z',art.shade,'opacity=".6"');
    }else if(['patch','calico'].includes(art.pattern)){
      const flip=n%2?'translate(220 0) scale(-1 1)':'';
      marking=path('M55 42 Q102 23 115 48 Q97 53 95 78 Q80 95 52 80 Z',art.shade,'opacity=".8" transform="'+flip+'"')+
        path('M166 70 Q140 73 143 92 Q160 108 178 97 Z',art.marks,'opacity=".72" transform="'+flip+'"');
    }else if(art.pattern==='spots'){
      marking=Array.from({length:12},(_,i)=>'<ellipse cx="'+(72+(i*31+n*7)%80)+'" cy="'+(48+(i*13)%49)+
        '" rx="'+(2+i%3)+'" ry="'+(2+i%2)+'" fill="'+art.shade+'" opacity=".65"/>').join('');
    }
    if(skin)marking+=path('M88 51 Q96 45 105 52 M110 48 Q124 42 136 52 M87 58 Q98 54 108 57','none',
      'stroke="'+art.shade+'" stroke-width="1.5" stroke-linecap="round" opacity=".48"');
    const eyes=[-1,1].map((side,i)=>{
      const x=cx+side*(width*.43), y=eyeY+(i?1:-1);
      const blink=key==='defeat'||key==='impact'&&frame===3;
      const ew=11+(n%4),eh=blink?2.5:7.5+(chin%4)*.65;
      const shape='M'+(x-ew)+' '+y+' Q'+x+' '+(y-eh*1.46)+' '+(x+ew)+' '+(y-1)+
        ' Q'+x+' '+(y+eh*1.25)+' '+(x-ew)+' '+y+' Z';
      const eid='cat-eye-'+n+'-'+i;
      const iris=blink?'':'<ellipse cx="'+(x+side*1.35)+'" cy="'+y+'" rx="'+(ew*.60)+'" ry="'+(eh+1)+'" fill="'+art.eyes+'"/>'+
        '<ellipse cx="'+(x+side*1.7)+'" cy="'+y+'" rx="'+(key==='victory'?3.7:2.8)+'" ry="'+(eh+.7)+'" fill="#231c2e"/>'+
        '<circle cx="'+(x-2)+'" cy="'+(y-2.8)+'" r="1.9" fill="#fff3df"/><circle cx="'+(x+5)+'" cy="'+(y+2)+'" r=".85" fill="#daefff"/>';
      return '<defs><clipPath id="'+eid+'">'+path(shape,'white')+'</clipPath></defs>'+
        path(shape,blink?art.shade:'#ead9c7','stroke="#3b2b39" stroke-width="2.2"')+
        '<g clip-path="url(#'+eid+')">'+iris+'</g>'+
        path('M'+(x-ew)+' '+(y-2)+' Q'+x+' '+(y-eh*1.51)+' '+(x+ew)+' '+(y-2),'none',
          'stroke="'+art.shade+'" stroke-width="1.5" stroke-linecap="round"');
    }).join('');
    const muzzlePaint=skin?art.marks:point?art.marks:art.fur;
    const muzzleArt=[-1,1].map(side=>{
      const x=cx+side*muzzle*.39,tip=cx+side*(muzzle+20);
      const cap='<ellipse cx="'+x+'" cy="'+(noseY+7)+'" rx="'+muzzle*.65+'" ry="'+(9+chin*.11)+
        '" fill="'+muzzlePaint+'" stroke="'+art.shade+'" stroke-opacity=".26"/>';
      const whiskers=[-1,0,1].map(j=>path('M'+(x+side*4)+' '+(noseY+9+j*3)+' Q'+
        (cx+side*(muzzle+3))+' '+(noseY+5+j*5)+' '+tip+' '+(noseY+4+j*8),'none',
        'stroke="#e6d9c3" stroke-width="1.05" stroke-linecap="round" opacity=".8"')).join('');
      return cap+whiskers;
    }).join('');
    const nose=path('M102 '+noseY+' Q110 '+(noseY-4)+' 118 '+noseY+' Q116 '+(noseY+5)+' 110 '+(noseY+7)+
      ' Q104 '+(noseY+5)+' 102 '+noseY+' Z',point||art.breed==='Bombay'?'#593f49':'#a9626c')+
      path('M110 '+(noseY+6)+' v7 q-4 3 -9 0 M110 '+(noseY+13)+' q5 3 10 -1','none',
        'stroke="#684153" stroke-width="1.2" stroke-linecap="round"');
    return faceFill+'<g class="art-ear-flex">'+earsMarkup+'</g>'+path(outline,art.fur,'stroke="'+art.shade+'" stroke-width="2.6"')+
      '<g clip-path="url(#'+clipId+')">'+marking+path(outline,'url(#'+lightId+')')+'</g>'+eyes+muzzleArt+nose;
  }
  function svgForBreed(breed,pose='idle',frame=3,fromPose='swipe',full=false,painting=false){
    const art=getArt(breed);
    const key=poseKeys.includes(pose)?pose:'idle';
    const cacheKey=art.uniq+'|'+key+'|'+String(frame)+'|'+fromPose+'|'+full+'|'+painting;
    if(svgCache.has(cacheKey)){
      const hit=svgCache.get(cacheKey);
      svgCache.delete(cacheKey);
      svgCache.set(cacheKey,hit);
      return hit;
    }
    const p=key==='recover'?recoveryPose(art,fromPose,frame):choreograph(art,key,frame);
    const type=art.pattern;
    const mane=art.tail==='plume'||art.ears==='tuft';
    const r=art.ears==='round'?37:art.ears==='large'?33:35;
    const earsArt=ears(art);
    const glow=pose==='ultimate'?'#ffdaa6':art.color;
    const overlay=furMarkings(art,pose);
    const recoveryProgress=Math.max(0,Math.min(1,(Number.isFinite(frame)?frame:5)/5));
    const fromWeight=key==='recover'?torsoWeight(art,fromPose,5):null;
    const neutral=torsoWeight(art,'idle',3);
    const settle=1-recoveryProgress*recoveryProgress*(3-2*recoveryProgress);
    const balance=key==='recover'?{
      shift:Math.round(neutral.shift+(fromWeight.shift-neutral.shift)*settle),
      lift:Math.round(neutral.lift+(fromWeight.lift-neutral.lift)*settle),
      tilt:Math.round(neutral.tilt+(fromWeight.tilt-neutral.tilt)*settle)
    }:torsoWeight(art,key,frame);
    const bodyTransform='translate('+balance.shift+' '+balance.lift+') rotate('+balance.tilt+' 109 171)';
    const backFeet='<ellipse cx="'+p[2][0]+'" cy="'+p[2][1]+'" rx="24" ry="11" fill="'+art.shade+'" opacity=".95"/>'+
      '<ellipse cx="'+p[3][0]+'" cy="'+p[3][1]+'" rx="23" ry="11" fill="'+art.shade+'" opacity=".95"/>'+
      '<ellipse cx="'+p[2][0]+'" cy="'+p[2][1]+'" rx="20" ry="9" fill="'+art.fur+'"/>'+
      '<ellipse cx="'+p[3][0]+'" cy="'+p[3][1]+'" rx="20" ry="9" fill="'+art.fur+'"/>';
    const [, , , , torso, shoulder, reach] = anatomyProfiles[art.uniq];
    const bodyShape=full?'M'+(110-torso*.56)+' '+shoulder+' Q'+(110-torso)+' 151 '+(110-torso*.89)+' 180 Q'+
      (110-torso*.75)+' '+(210+reach*.12)+' '+(107+art.uniq*.058)+' 221 Q'+(110+torso*.72)+' 215 '+(110+torso*.88)+' 181 Q'+
      (110+torso)+' 142 '+(110+torso*.54)+' '+shoulder+' Z':null;
    const body='<g class="art-body"><path d="'+(bodyShape||'M80 116 Q'+(67+(art.uniq%9))+' 122 '+(66+(art.uniq%4))+' 180 Q68 219 108 222 Q151 220 '+(155-art.uniq%5)+' 178 Q151 120 136 115 Z')+'" fill="'+art.fur+'" stroke="'+art.shade+'" stroke-width="5"/>'+
      '<path d="M86 133 Q108 147 132 133 Q140 154 144 183 L122 211 L88 209 L72 184 Z" fill="'+art.fur+'" opacity=".9"/>'+overlay+
      '<path d="M76 142 Q110 155 142 141 L140 171 Q105 174 78 167 Z" fill="'+art.cape+'" stroke="#d8b16c" stroke-width="3.5" opacity=".96"/>'+
      '<path d="M105 151 L116 151 L125 159 L115 171 L105 171 L96 159 Z" fill="#f2bd69" stroke="#fce0a8" stroke-width="2"/>'+
      '<path d="M106 161 Q112 152 117 161 Q112 169 106 161" fill="#6b4587"/></g>';
    const capeFrame=key==='recover'?5-2*(1-settle):frame;
    const cape='<path d="M75 124 Q'+(34+art.uniq%11+Math.round((capeFrame-3)*art.choreography.arc/8))+' 145 37 '+(203-(art.uniq%9))+' Q80 '+(206+(art.uniq%7))+' 102 185 L98 122 Z" fill="'+art.cape+'" stroke="#dfb975" stroke-width="4" opacity=".88"/>';
    const head='<g class="art-head-inner" transform="rotate('+p[4]+' 109 80)">'+(full?fullHead(art,key,frame):earsArt+
      '<ellipse cx="110" cy="83" rx="'+(r+25)+'" ry="'+(r+26)+'" fill="'+art.shade+'" opacity=".9"/>'+
      '<ellipse cx="110" cy="78" rx="63" ry="64" fill="'+art.fur+'" stroke="'+art.shade+'" stroke-width="5"/>'+
      portrait(art)+
      (mane?'<path d="M60 105 l-14 25 l19 -8 l-10 28 l25 -12 M156 104 l15 27 l-17 -8 l9 22 l-28 -12" stroke="'+art.fur+'" stroke-width="8" fill="none" stroke-linejoin="round" opacity=".85"/>':'')+
      '<path d="M75 133 Q110 145 144 132" fill="none" stroke="#d5ad6b" stroke-width="4"/>')+'</g>';
    const safety='<desc>Original battle body design for '+art.breed+', retaining its existing adoption portrait. '+key+' attack pose.</desc>';
    const smallClaws=key==='swipe'?'<path d="M195 76 l22 -9 M196 85 l21 -2 M198 94 l19 7" stroke="#fff3d2" stroke-width="3" fill="none" stroke-linecap="round"/>':'';
    const defeat=key==='defeat'?'<path d="M82 183 Q107 202 129 178" fill="none" stroke="'+art.shade+'" stroke-width="5" opacity=".6"/>':'';
    const flow=flowSignature(art);
    const flowVars='--breath-period:'+flow.breathDuration+';--tail-period:'+flow.tailDuration+
      ';--ear-period:'+flow.earDuration+';--head-period:'+flow.headDuration+
      ';--stance-period:'+flow.stanceDuration;
    const fighterImage=painting?paintedFighterMarkup(art,key,frame,balance):'';
    const painted=litPalette('cat-light-'+art.uniq+'-',[
      [art.fur,false],[art.shade,false],[art.cape,false],['#f2bd69',true]
    ]);
    const markup=painted.shade('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 240" role="img" class="paw-battle-full-body" data-breed-index="'+art.uniq+'" data-pose="'+key+'" data-source-pose="'+
      (key==='recover'?fromPose:'idle')+'" style="'+flowVars+'" aria-hidden="true">'+
      safety+'<defs>'+painted.defs+'<clipPath id="face"><ellipse cx="110" cy="75" rx="59" ry="60"/></clipPath></defs>'+
      '<ellipse cx="110" cy="225" rx="72" ry="12" fill="#07192c" opacity=".35"/>'+
      (fighterImage||tail(art,key,frame)+
      '<g class="art-cape-weight" transform="'+bodyTransform+'">'+cape+'</g>'+
      backFeet+
      '<g class="art-torso-weight" transform="'+bodyTransform+'">'+body+'</g>'+
      paw(art,...p[0].map((v,i)=>full&&i===2?v-(reach-23)*.51:v),false,key)+
      paw(art,...p[1].map((v,i)=>full&&i===2?v+(reach-23)*.51:v),true,key)+
      '<g class="art-head-weight" transform="translate('+Math.round(balance.shift*.45)+' '+balance.lift+')">'+head+'</g>'+
      smallClaws+defeat)+
      abilityArt(art,key,frame)+signatureSeal(art,key,frame)+individualAttackTrail(art,key,frame)+fightingStyleTrail(art,key,frame)+
      (key==='impact'?'<path d="M158 40 l7 -12 l5 12 l13 4 l-13 5 l-5 12 l-6 -13 l-13 -4 Z" fill="#ffe17c"/>':'')+
      (key==='victory'?'<path d="M49 31 l9 -11 l6 12 l14 4 l-13 5 l-5 14 l-7 -15 Z" fill="'+glow+'"/>':'')+
      '</svg>');
    svgCache.set(cacheKey,markup);
    if(svgCache.size>svgCacheLimit)svgCache.delete(svgCache.keys().next().value);
    return markup;
  }
  function paint(container,breed,pose='idle',frame=3,fromPose='swipe',full=false,painting=false){
    if(!container)return false;
    const art=getArt(breed);
    // Avoid destroying and recreating the face texture for an unchanged
    // pose. Preserves the mounted idle CSS animations and saves mobile work.
    if(container.dataset.breed===art.breed&&container.dataset.pose===pose&&
       container.dataset.frame===String(frame)&&container.dataset.fromPose===fromPose&&container.dataset.fullArt===String(full)&&container.dataset.painting===String(painting)&&
       container.firstElementChild?.classList?.contains('paw-battle-full-body'))return true;
    // Markup contains ONLY our own trusted, fixed 56-breed design data.
    container.innerHTML=svgForBreed(art.breed,pose,frame,fromPose,full,painting);
    container.dataset.painting=String(painting);
    container.dataset.fullArt=String(full);
    container.classList.add('has-body-art');
    container.dataset.breed=art.breed;
    container.dataset.pose=pose;
    container.dataset.frame=String(frame);
    container.dataset.fromPose=fromPose;
    container.style.backgroundImage='none';
    return true;
  }
  const fighterPaintings=new Map();

  function paintingPath(art){
    return 'assets/scenes/pawtopia-fighters/cat-'+String(art.uniq+1).padStart(2,'0')+'.png';
  }

  function paintedFighterMarkup(art,pose,frame,balance){
    const effort=Math.max(0,keyframeValue(motionWeight,frame));
    const lowPose=pose==='guard'||pose==='impact'||pose==='defeat';
    const stretch=pose==='ultimate'||pose==='signature'||pose==='victory';
    const width=1+(lowPose ? .048 : stretch ? -.035 : .015)*effort;
    const height=1+(pose==='defeat' ? -.29 : lowPose ? -.10 : stretch ? .065 : 0)*effort;
    const transform='translate('+(balance.shift*.58)+' '+(balance.lift*.58)+') translate(110 221) rotate('+
      (balance.tilt*.8)+') scale('+width+' '+height+') translate(-110 -221)';
    return '<g transform="'+transform+'"><image class="painted-fighter-image" href="'+paintingPath(art)+
      '" x="8" y="16" width="204" height="205" preserveAspectRatio="none"/></g>';
  }

  function paintFighter(container,breed,pose,frame,fromPose){
    if(!container||typeof window.Image!=='function')return paint(container,breed,pose,frame,fromPose,true);
    const art=getArt(breed);
    let record=fighterPaintings.get(art.uniq);
    if(!record){
      record={state:'loading',targets:new Set()};
      fighterPaintings.set(art.uniq,record);
      const image=new window.Image();
      image.onload=()=>{
        record.state='ready';
        for(const target of record.targets){
          if(target.dataset.breed!==art.breed)continue;
          const {pose,frame,fromPose}=target.dataset;
          paint(target,art.breed,pose,Number(frame),fromPose,true,true);
        }
        record.targets.clear();
      };
      image.onerror=()=>{
        record.state='failed';
        record.targets.clear();
      };
      image.src=paintingPath(art);
    }
    if(record.state==='loading')record.targets.add(container);
    return paint(container,art.breed,pose,frame,fromPose,true,record.state==='ready');
  }

  function timingFor(breed,pose){
    const art=getArt(breed);
    const base=pose==='ultimate'?780:pose==='signature'?650:
      pose==='guard'?430:pose==='impact'?310:pose==='swipe'?480:550;
    return base+art.choreography.tempo+(art.fightingStyle?.tempo||0);
  }
  window.PawtopiaBattleCharacterArt=Object.freeze({
    collection,getArt,poseKeys,animationFrames,smoothFrames,flowFrames,keyframeValue,
    torsoWeight,personalMotion,choreograph,recoveryPose,flowSignature,timingFor,svgForBreed,paint,
    paintFighter,
    cacheSize:()=>svgCache.size,fightingStyles,identityFor
  });
})();
