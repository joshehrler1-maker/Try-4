
(() => {
  'use strict';

  const districts = [
    'Sunleaf','Frostbell','Moonwharf','Thistlebrook','Lantern Quay','Mossglass',
    'Stormfern','Emberbank','Glimmerfen','Rafterhill','Copper Orchard','Starling Hollow',
    'Honeybrook','Dewspire'
  ];
  const forms = {
    Food: ['Fish Bowl','Supper Roll','Creek Stew','Meadow Pâté','Sardine Parcel','Broth Cup',
      'Picnic Flakes','Roasted Bites','Trout Medallion','Pantry Plate','Snowday Mousse',
      'Hearth Snack','Market Fillet','River Crisp','Trail Terrine'],
    Toy: ['Ribbon Wand','Rattle Drum','Perch Puzzle','Feather Spinner','Tumble Hoop','Pendulum Box',
      'Rolling Shuttle','Pounce Pad','Tin Kite','Shadow Theater','Swing Mouse','Puzzle Tower',
      'Bell Maze','Bouncing Bobbin','Treat Track'],
    Book: ['Field Almanac','Study of Balance','Sparring Journal','Cottage Handbook','Trail Atlas',
      'Clockwork Primer','Scout Diary','Archive Notes','Songs of Courage','Ledger of Lessons',
      'Perch Manual','Guide to Quiet Paws','Workshop Codex','Tales of Teamwork','Strategy Papers'],
    Wearable: ['Sash','Neckerchief','Collar','Festival Bow','Mantle','Cap','Badge','Brooch','Kerchief',
      'Crown','Medallion','Hood','Cuff','Harness','Rosette'],
    'Battle Gear': ['Pounce Bracer','Reed Guard','Trail Charm','Bumper Mitt','Padded Vest',
      'Lantern Stone','Spring Cuff','Hinge Shield','Dusk Sigil','Counter Baton','Felt Shell',
      'Forge Token','Wind Gauntlet','Birch Buckler','Compass Seal']
  };
  Object.assign(forms, {
    "Remedy": [
      "Calming Balm",
      "Restorative Tonic",
      "Soothing Poultice",
      "Mint Compress",
      "Warm Infusion",
      "Sleep Salve",
      "Honey Liniment",
      "Cottage Elixir",
      "Mist Vapor",
      "Gentle Ointment",
      "Recovery Draught",
      "Herbal Patch",
      "Cooling Rub",
      "Comfort Tea",
      "Bramble Syrup"
    ],
    "Weapon": [
      "Drive Knuckle",
      "Sparring Fan",
      "Arc Baton",
      "Counter Bell",
      "Pulse Rod",
      "Joust Paddle",
      "Ridge Club",
      "Tempo Mallet",
      "Snap Flail",
      "Rune Wand",
      "Braid Whip",
      "Clatter Cane",
      "Cushion Saber",
      "Tuning Staff",
      "Pounce Hook"
    ],
    "Armor": [
      "Quilted Carapace",
      "Brace Vest",
      "Rebound Suit",
      "Petal Cuirass",
      "Letdown Plate",
      "Ridge Cloak",
      "Softsteel Guard",
      "Timber Harness",
      "Buckle Shell",
      "Bristle Wrap",
      "Tumble Pads",
      "Bark Brigandine",
      "Weave Jacket",
      "Felt Panoply",
      "Copper Coating"
    ],
    "Relic": [
      "Recall Prism",
      "Steady Hourglass",
      "Coiled Amulet",
      "Northlight Lens",
      "Folded Mapstone",
      "Trail Seal",
      "Tempo Lodestone",
      "Breeze Effigy",
      "Moon Dial",
      "Hint Tablet",
      "Rest Gem",
      "Resonance Bead",
      "Quiet Idol",
      "Skylight Totem",
      "Glass Compass"
    ],
    "Material": [
      "Timber Blank",
      "Felt Coil",
      "Glass Bead",
      "Cotton Spool",
      "Brass Offcut",
      "Copper Foil",
      "Cottage Rivet",
      "Root Fiber",
      "Clay Lump",
      "Quartz Sliver",
      "Harbor Button",
      "Lantern Cord",
      "Pressed Leaf",
      "Crystal Thread",
      "Carved Dowel"
    ],
    "Furnishing": [
      "Nap Hammock",
      "Reading Nook",
      "Porch Perch",
      "Breeze Screen",
      "Window Bench",
      "Snooze Mat",
      "Braid Basket",
      "Hearth Lounger",
      "Paw Washstand",
      "Loft Cushion",
      "Willow Chair",
      "Climbing Shelf",
      "Quiet Tent",
      "Cat Tunnel",
      "Sunroom Cot"
    ],
    "Collectible": [
      "Trail Postcard",
      "Founders’ Cameo",
      "Parade Pennant",
      "Clockwork Etching",
      "Festival Plate",
      "Copper Foil Print",
      "Miniature Diorama",
      "Scout Album Page",
      "Town Portrait",
      "Enamel Token",
      "Story Scroll",
      "Porcelain Figure",
      "Route Rubbing",
      "Moon Map",
      "Sparring Lithograph"
    ]
  });
  const categoryIds = {Food:'food',Toy:'toy',Book:'book',Wearable:'wearable','Battle Gear':'gear',
    Remedy:'remedy',Weapon:'weapon',Armor:'armor',Relic:'relic',Material:'material',
    Furnishing:'furnishing',Collectible:'collectible'};
  const guides = {
    care: ['care moments','pawtopia-companions.html'],
    game: ['original game milestones','pawtopia-arcade.html'],
    battle: ['Arena wins','pawtopia-battle-arena.html'],
    scout: ['Scout Trail clues solved','pawtopia-scout-trails.html'],
    town: ['town deliveries','pawtopia-town.html#quests'],
    rank: ['highest Arena rank defeated','pawtopia-battle-arena.html']
  };
  const categories = Object.keys(forms);
  const bands = [
    {tier:'Low', count:120, quests:20, min:4, max:9, price:4, priceEvery:9, priceStep:1},
    {tier:'Mid', count:50, quests:15, min:10, max:13, price:45, priceEvery:1, priceStep:1},
    {tier:'High', count:20, quests:0, min:14, max:16, price:135, priceEvery:1, priceStep:5},
    {tier:'High', count:20, quests:20, min:17, max:20, price:0}
  ];
  const oldFoodStats = ['18,4,0','34,0,0','24,0,2','8,14,0','12,0,5','45,18,0'];
  const oldToyStats = ['15,2','26,0','8,5','19,3'];
  const slotNames = ['weapon','armor','relic'];
  const badges = ['🎗️','🧣','🔔','🎀','🧤','🧢','🏵️','💠','🌙','👑','🏅','🍂','⭐','🪶','🌼'];
  const studyStats = ['strength','defence','movement','endurance','intelligence','bond'];
  const statNames = {strength:'strength',defence:'defence',movement:'movement',endurance:'endurance',
    intelligence:'intelligence',bond:'friendship'};

  function allocations(minimum, maximum, bounds) {
    const list = [];
    function allocate(total, values) {
      if (values.length === bounds.length) {
        if (!total) list.push(values);
        return;
      }
      const [min,max] = bounds[values.length];
      for (let value=min; value<=Math.min(max,total); value++) allocate(total-value,[...values,value]);
    }
    for (let total=minimum; total<=maximum; total++) allocate(total,[]);
    return list;
  }

  function sample(list, index, count) {
    if (list.length<count) throw new Error('Item stat range cannot provide distinct combinations.');
    return list[Math.floor(index*(list.length-1)/Math.max(1,count-1))];
  }

  function challenge(categoryIndex, band, rank) {
    const activity = ['care','scout','game','town','battle'];
    const primary = activity[categoryIndex%activity.length], secondary = activity[(categoryIndex+1)%activity.length];
    const tertiary = activity[(categoryIndex+2)%activity.length];
    const n = rank+1;
    let requirements;
    if (band===0) requirements = [[primary,1+Math.floor(rank/4)],[secondary,rank%4]];
    else if (band===1) requirements = [[primary,7+n],[secondary,3+Math.floor(n/2)],[tertiary,2+n%3]];
    else requirements = [[primary,22+3*n],[secondary,12+n],[tertiary,6+Math.floor(n/2)],['rank',8+Math.floor(rank/4)]];
    if (categoryIndex>=5) {
      const offset=1+categoryIndex-5;
      requirements[0][1]+=band===0 ? offset%3 : offset;
      if (band===0) requirements.push([tertiary,1+Math.floor((offset-1)/3)]);
      if (band===3) requirements.push([activity[(categoryIndex+3)%activity.length],3+offset+Math.floor(rank/2)]);
    }
    return requirements.filter(([,target]) => target>0)
      .map(([key,target]) => ({key,target,label:guides[key][0],href:guides[key][1]}));
  }

  function describeCare(care) {
    return care.map((value,i) => value ? '+'+value+' '+['fullness','happiness','friendship'][i] : '')
      .filter(Boolean).join(', ');
  }

  function battleEffect(slot, value) {
    const [a,b,c]=value;
    if (slot==='weapon') return {
      arena:{marketOpening:a,marketSignature:b,marketFinisher:c},
      description:[a&&'First attack: +'+a+' damage',b&&'Signature: +'+b+' damage',
        c&&'Ultimate: +'+c+' damage'].filter(Boolean).join(' · ')+'.'
    };
    if (slot==='armor') return {
      arena:{marketHealth:a,marketHeavy:b,marketCurl:c},
      description:[a&&'+'+a+' Arena max HP',b&&'Block '+b+' from heavy hits',c&&'Guard Curl blocks '+c+' more']
        .filter(Boolean).join(' · ')+'.'
    };
    return {
      arena:{marketSpeed:a,marketMend:b,marketReward:c},
      description:[a&&'+'+a+' opening initiative',b&&'First Guard Curl heals '+b+' HP',
        c&&'+'+c+' Paw Coins per Arena win'].filter(Boolean).join(' · ')+'.'
    };
  }


  const craftProjects = [
    ['rest-shell','Hushwood Rest Shell'],['hush-coil','Hush Coil'],
    ['field-scope','Scoutglass Lens'],['harvest-loop','Frostbell Harvest Loop'],
    ['festival-mantle','Sunset Scout Mantle'],['woven-cushion','Sunleaf Window Cushion'],
    ['window-lamp','Frostglass Window Lamp']
  ];
  function bonuses(values, labels) {
    return values.flatMap((amount,i) => amount ? ['+'+amount+' '+labels[i]] : []).join(' · ');
  }
  function extendedEffect(category,value,form,bandIndex) {
    const [a,b,c]=value;
    switch (category) {
      case 'Remedy': {
        const meter = form%2 ? 'fullness':'happiness';
        const limit = [50,60,70,80][bandIndex];
        return {care:value,below:[meter,limit],description:'Use when '+meter+' is below '+limit+': '+describeCare(value)+'.'};
      }
      case 'Weapon':
        return {slot:'weapon',arena:{armoryFollowup:a,armoryBreak:b,armoryCritical:c},
          description:bonuses(value,['Paw Swipe damage after a Guard Curl','damage against Iron Guard','damage on critical hits'])+'.'};
      case 'Armor':
        return {slot:'armor',arena:{armoryRecovery:a,armoryOpening:b,armoryRepeat:c},
          description:bonuses(value,['HP after surviving the first damaging hit','damage blocked in rounds 1–2','damage blocked below half HP'])+'.'};
      case 'Relic':
        return {slot:'relic',arena:{armorySecond:a,armoryVigor:b,armoryRiposte:c},
          description:bonuses(value,['initiative from round two onward','HP after using an ultimate','damage on the first Guard Curl counter'])+'.'};
      case 'Material': {
        const [id,name]=craftProjects[form%craftProjects.length];
        return {refine:{shards:a,silk:b,cogs:c},workshopTarget:id,
          description:'Refine for '+bonuses(value,['Crystal Shards','Sunleaf Silk','Garden Clock Cogs'])+
            ', or spend one to craft '+name+'.'};
      }
      case 'Furnishing':
        return {care:value,daily:true,description:'Use once per day at the Cottage: '+describeCare(value)+'.'};
      case 'Collectible':
        return {exhibit:{coins:a,bond:b,materials:c},
          description:'Display it to earn '+bonuses(value,['Paw Coins','friendship','trail materials'])+
            ' on your first completed Scout Trail each UTC day.'};
      default:
        return {};
    }
  }
  const statPools = bands.map((band,bandIndex) => {
    const [foodMin,foodMax] = [[13,29],[33,48],[52,63],[67,78]][bandIndex];
    const [toyMin,toyMax] = [[10,29],[32,42],[46,55],[59,68]][bandIndex];
    const bookPoints = [4,6,8,10][bandIndex];
    const [min,max] = [[5,12],[13,16],[17,19],[20,23]][bandIndex];
    const combinationRange = (bounds, multiplier=1) => allocations(min,max,bounds)
      .map(values => values.map(value => value*multiplier));
    return {
      Remedy: combinationRange([[1,15],[1,15],[0,8]],3),
      Weapon: combinationRange([[0,10],[0,10],[0,10]]),
      Armor: combinationRange([[0,12],[0,8],[0,10]]),
      Relic: combinationRange([[0,10],[0,12],[0,10]]),
      Material: combinationRange([[0,11],[0,9],[0,9]]),
      Furnishing: combinationRange([[1,12],[1,14],[0,9]],2),
      Collectible: combinationRange([[0,10],[0,17],[0,6]]),
      Food: allocations(foodMin,foodMax,[[7,60],[0,36],[0,18]]).filter(value => !oldFoodStats.includes(value.join(','))),
      Toy: allocations(toyMin,toyMax,[[6,52],[0,28]]).filter(value => !oldToyStats.includes(value.join(','))),
      Book: allocations(bookPoints,bookPoints,studyStats.map(() => [0,5])),
      Wearable: allocations(band.min,band.max,[[0,15],[0,8],[0,9]]).filter(([,guard,speed]) => guard || speed),
      weapon: allocations(band.min,band.max,[[0,11],[0,11],[0,13]]).filter(([opening,signature,ultimate]) => opening || signature || ultimate!==6),
      armor: allocations(band.min,band.max,[[0,18],[0,7],[0,9]]),
      relic: allocations(band.min,band.max,[[0,12],[0,12],[0,3]])
    };
  });
  const items = [];
  for (const [categoryIndex, category] of categories.entries()) {
    let index = 0;
    for (const [bandIndex, band] of bands.entries()) {
      const pools = statPools[bandIndex];
      for (let within=0; within<band.count; within++,index++) {
        const form = index%15, district = districts[Math.floor(index/15)];
        const earned = within>=band.count-band.quests;
        const entry = {
          id:'trail-supply-'+categoryIds[category]+'-'+String(index+1).padStart(3,'0'),
          name:district+' '+forms[category][form], category,
          tier:band.tier, rating:index+1,
          price:earned ? 0 : band.price+Math.floor(within/band.priceEvery)*band.priceStep,
          achievement:earned ? challenge(categoryIndex,bandIndex,within-(band.count-band.quests)) : null
        };
        if (category==='Battle Gear') {
          const offset = index-within;
          const slot = slotNames[index%slotNames.length];
          const start = (index%3-offset%3+3)%3;
          const slotCount = Math.floor((band.count-1-start)/3)+1;
          const value = sample(pools[slot],Math.floor((within-start)/3),slotCount);
          Object.assign(entry,{slot,...battleEffect(slot,value)});
        } else {
          const value = sample(pools[category],within,band.count);
          if (category==='Food') Object.assign(entry,{care:value,description:'Feed once: '+describeCare(value)+'.'});
          if (category==='Toy') {
            const care = [0,...value];
            Object.assign(entry,{care,daily:true,description:'Play once per day: '+describeCare(care)+'.'});
          }
          if (category==='Book') {
            const read = Object.fromEntries(studyStats.flatMap((key,i) => value[i] ? [[key,value[i]]] : []));
            const effects = Object.entries(read).map(([key,amount]) => '+'+amount+' '+statNames[key]).join(', ');
            Object.assign(entry,{read,description:'Read once per cat for '+effects+'.'});
          }
          if (categoryIndex>=5) Object.assign(entry,extendedEffect(category,value,form,bandIndex));
          if (category==='Wearable') {
            const [health,guard,speed] = value;
            const benefits = [health&&'+'+health+' Arena max HP',guard&&'blocks '+guard+' from the first enemy hit',
              speed&&'+'+speed+' opening initiative'].filter(Boolean);
            Object.assign(entry,{slot:'wearable',badge:badges[form],hue:(index*47)%360,
              arena:{styleHealth:health,styleGuard:guard,styleSpeed:speed},
              description:'Wear this badge. Arena: '+benefits.join(' · ')+'.'});
          }
        }
        items.push(entry);
      }
    }
  }

  function progressFor(progress,item) {
    const cats = [progress.companion,...(Array.isArray(progress.otherCompanions) ? progress.otherCompanions : [])].filter(Boolean);
    const legacyBattleWins = cats.reduce((sum,cat) => sum+(cat.battle?.wins||0),0);
    const bestRank = Math.max(0,...cats.map(cat => cat.battle?.bestRank||0));
    return (item.achievement || []).map(requirement => {
      const counter = progress.adventureTotals?.[requirement.key] || 0;
      const current = requirement.key==='rank' ? bestRank :
        requirement.key==='battle' ? Math.max(legacyBattleWins,counter) : counter;
      return {...requirement,current};
    });
  }

  window.PawtopiaItemTiers = Object.freeze({items,progressFor});
})();
