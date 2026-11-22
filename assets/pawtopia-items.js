
(() => {
  'use strict';
  const items = [
    // ID, name, category, price (or zero for an earned/crafted item), effect, options
    ['sunfish-bites','Sunfish Bites','Food',3,'Restore 18 fullness and 4 happiness.',{care:[18,4,0]}],
    ['creekfish-stew','Creekfish Stew','Food',5,'Restore 34 fullness.',{care:[34,0,0]}],
    ['supper-skewer','Firefly Supper Skewer','Food',6,'Restore 24 fullness and earn 2 friendship.',{care:[24,0,2]}],
    ['moon-milk','Moon Meadow Milk','Food',4,'Restore 8 fullness and 14 happiness.',{care:[8,14,0]}],
    ['packed-lunch','Meadow Scout Lunch','Food',7,'Restore 12 fullness and earn 5 friendship.',{care:[12,0,5]}],
    ['warm-platter','Hearth Supper Platter','Food',10,'Restore 45 fullness and 18 happiness.',{care:[45,18,0]}],

    ['spring-mouse','Springtail Mouse','Toy',7,'Play once per day for 15 happiness and 2 friendship.',{care:[0,15,2],daily:true}],
    ['feather-kite','Chimney Feather Kite','Toy',12,'Play once per day for 26 happiness.',{care:[0,26,0],daily:true}],
    ['woven-ball','Moonthread Tumble Ball','Toy',9,'Play once per day for 8 happiness and 5 friendship.',{care:[0,8,5],daily:true}],
    ['puzzle-box','Bolt’s Breakfast Puzzle','Toy',14,'Play once per day for 19 happiness and 3 friendship.',{care:[0,19,3],daily:true}],

    ['soothing-wrap','Purrweave Comfort Wrap','Remedy',7,'Restore 30 happiness when happiness is below 50.',{care:[0,30,0],below:['happiness',50]}],
    ['recovery-broth','Frost Pass Recovery Broth','Remedy',8,'Restore 40 fullness when fullness is below 45.',{care:[40,0,0],below:['fullness',45]}],
    ['calm-drops','Quiet Window Drops','Remedy',9,'Restore 12 happiness and earn 6 friendship when happiness is below 60.',{care:[0,12,6],below:['happiness',60]}],

    ['paw-spring','Paw Spring Bracer','Weapon',8,'Your first Paw Swipe in each battle deals 4 extra damage.',{slot:'weapon',arena:{firstSwipe:4}}],
    ['glass-needle','Grotto Glass Needle','Weapon',13,'Your attacks ignore up to 3 points of the foe’s Iron Guard.',{slot:'weapon',arena:{pierce:3}}],
    ['gear-ram','Cushioned Gear Ram','Weapon',15,'Your attacks deal 2 extra damage on rounds divisible by three.',{slot:'weapon',arena:{thirdHit:2}}],
    ['dawn-fork','Dawn Tuning Fork','Weapon',20,'Your signature skills deal 3 extra damage.',{slot:'weapon',arena:{signature:3}}],
    ['last-light','Last Light Bell','Weapon',24,'Your ultimate deals 6 extra damage.',{slot:'weapon',arena:{ultimate:6}}],
    ['hinge-hammer','Quiet Hinge Hammer','Weapon',16,'Your attacks deal 4 extra damage while your cat is below half health.',{slot:'weapon',arena:{lowHp:4}}],

    ['reed-buckler','Reedwall Buckler','Armor',9,'Block up to 3 damage from the first enemy hit each battle.',{slot:'armor',arena:{firstBlock:3}}],
    ['wool-lining','Frostwool Lining','Armor',12,'Reduce every heavy enemy attack by 2 damage.',{slot:'armor',arena:{heavyBlock:2}}],
    ['copper-padding','Copperpaw Padding','Armor',14,'Reduce damage from critical enemy attacks by 1.',{slot:'armor',arena:{critBlock:1}}],
    ['curled-plates','Curled Bark Plates','Armor',18,'Guard Curl blocks 3 more damage.',{slot:'armor',arena:{guard:3}}],
    ['rest-shell','Hushwood Rest Shell','Armor',0,'Restore up to 2 HP whenever you use Guard Curl.',{slot:'armor',arena:{guardHeal:2},recipe:{'grotto-glass':2}}],

    ['quickstep','Quickstep Ribbon','Relic',10,'Get 3 extra initiative on the first turn.',{slot:'relic',arena:{initiative:3}}],
    ['steady-spark','Steady Spark Token','Relic',15,'Add 2 HP whenever you start a match.',{slot:'relic',arena:{health:2}}],
    ['salvage-ring','Clockwork Salvage Ring','Relic',16,'Earn 1 extra Paw Coin for arena victories.',{slot:'relic',arena:{winCoin:1}}],
    ['hush-coil','Hush Coil','Relic',0,'Your first signature hit slows an opponent, reducing its next attack by 2.',{slot:'relic',arena:{firstSlow:1},recipe:{'garden-cog':2,'grotto-glass':1}}],
    ['trail-knot','Wildflower Trail Knot','Relic',11,'When this cat solves a Scout Trail clue, earn 1 extra friendship.',{slot:'relic',scoutBond:1}],
    ['field-scope','Scoutglass Lens','Relic',0,'When this cat solves a Scout Trail clue, earn 1 extra Paw Coin.',{slot:'relic',scoutCoins:1,recipe:{'sunleaf-silk':2,'grotto-glass':1}}],
    ['harvest-loop','Frostbell Harvest Loop','Relic',0,'Earn an extra Frostbell Flake whenever this cat solves Frostbell Pass.',{slot:'relic',scoutMaterial:'frostbell-flake',recipe:{'frostbell-flake':2,'garden-cog':1}}],

    ['ivys-notebook','Ivy’s Trail Notebook','Book',6,'Read once per cat to earn 8 friendship.',{read:{bond:8}}],
    ['alley-fieldbook','Alley Sparring Fieldbook','Book',13,'Read once per cat to gain 1 strength.',{read:{strength:1}}],
    ['footwork-reader','Window Ledge Footwork','Book',12,'Read once per cat to gain 1 movement.',{read:{movement:1}}],
    ['brace-reader','Bolt’s Art of Bracing','Book',14,'Read once per cat to gain 1 defence.',{read:{defence:1}}],
    ['mechanic-reader','Notes from the Grotto Mechanic','Book',15,'Read once per cat to gain 1 intelligence.',{read:{intelligence:1}}],

    ['sunleaf-silk','Sunleaf Silk','Material',0,'Found by solving Sunleaf Meadow. Craft a Scoutglass Lens, mantle or cushion.',{trail:'meadow'}],
    ['grotto-glass','Starlit Glass Chip','Material',0,'Found by solving Starlight Grotto. Craft a Rest Shell, Hush Coil or Scoutglass Lens.',{trail:'grotto'}],
    ['garden-cog','Garden Clock Cog','Material',0,'Found by solving Clockwork Garden. Craft a Hush Coil, Harvest Loop or window lamp.',{trail:'garden'}],
    ['frostbell-flake','Frostbell Flake','Material',0,'Found by solving Frostbell Pass. Craft a Harvest Loop, mantle or window lamp.',{trail:'frost'}],

    ['festival-mantle','Sunset Scout Mantle','Wearable',0,'Show an amber mantle badge on the cat’s Cottage portrait.',{slot:'wearable',badge:'🧣',recipe:{'sunleaf-silk':1,'frostbell-flake':1}}],
    ['moonflower-pin','Moonflower Lapel Pin','Wearable',8,'Show a moonflower badge on the cat’s Cottage portrait.',{slot:'wearable',badge:'🌼'}],
    ['gear-crown','Clocktower Crown','Wearable',17,'Show a miniature clocktower crown beside the cat’s Cottage portrait.',{slot:'wearable',badge:'👑'}],

    ['woven-cushion','Sunleaf Window Cushion','Furnishing',0,'Place it for a daily rest that restores 22 happiness and earns 1 friendship.',{care:[0,22,1],daily:true,recipe:{'sunleaf-silk':2}}],
    ['window-lamp','Frostglass Window Lamp','Furnishing',0,'Place it for a daily rest that restores 9 happiness and earns 4 friendship.',{care:[0,9,4],daily:true,recipe:{'frostbell-flake':1,'garden-cog':1}}],
    ['scratch-deck','Rafter Scratch Deck','Furnishing',13,'Place it for a daily stretch that restores 11 happiness and earns 6 friendship.',{care:[0,11,6],daily:true}],

    ['copper-hound-sketch','Tin Hound Workshop Sketch','Collectible',0,'Win a Tier 1 Arena battle to archive Bolt’s first training bot sketch.',{rank:1,lore:'Its paws were cut from spare teapot lids.'}],
    ['iron-fang-blueprint','Iron Fang Blueprint Fragment','Collectible',0,'Win a Tier 8 Arena battle to archive a fragment of the Iron Fang blueprint.',{rank:8,lore:'A second hinge lets its tail fold flat during a charge.'}],
    ['baron-invitation','Baron’s Sealed Challenge','Collectible',0,'Defeat Baron’s Clockwork Avatar to archive the final challenge letter.',{rank:12,lore:'The wax seal bears a tiny gear with one missing tooth.'}]
  ].map(([id,name,category,price,description,effect]) => ({id,name,category,price,description,...effect}));

  const tiers = window.PawtopiaItemTiers;
  items.push(...(tiers?.items || []));
  const byId = new Map(items.map(item => [item.id,item]));
  const day = () => new Date().toISOString().slice(0,10);
  const count = (value,fallback=0) => Number.isSafeInteger(value) && value>=0 ? value : fallback;
  const stock = (progress,id) => count(progress?.catalogItems?.[id]);
  function add(progress,id,delta) {
    const next = {...progress.catalogItems};
    const total = Math.max(0,Math.min(999,stock(progress,id)+delta));
    if (total) next[id] = total;
    else delete next[id];
    progress.catalogItems = next;
  }
  const stackable = item => ['Food','Remedy','Material'].includes(item.category);
  function buy(progress,id) {
    const item = byId.get(id);
    if (!item?.price) return 'Find or craft this item.';
    if (stock(progress,id) && !stackable(item)) return 'You already own this item.';
    if (stock(progress,id)>=999) return 'Your stack is full.';
    if (count(progress.coins)<item.price) return 'You need more Paw Coins.';
    progress.coins -= item.price;
    add(progress,id,1);
    return 'Purchased ' + item.name + '.';
  }
  function hasClaimed(progress,item) {
    return Boolean(progress.catalogClaims?.[item.id]);
  }
  function achievementProgress(progress,item) {
    return tiers?.progressFor(progress,item) || [];
  }
  function claim(progress,id) {
    const item = byId.get(id);
    if (!item?.achievement) return 'This item is available elsewhere.';
    if (hasClaimed(progress,item) || stock(progress,id)) return 'This achievement reward was already collected.';
    if (!achievementProgress(progress,item).every(goal => goal.current>=goal.target)) {
      return 'Complete the listed achievement goals first.';
    }
    add(progress,id,1);
    progress.catalogClaims = {...progress.catalogClaims,[id]:true};
    return 'Achievement complete. Collected '+item.name+'.';
  }
  function craft(progress,id) {
    const item = byId.get(id);
    if (!item?.recipe || stock(progress,id)) return 'You already have this item or it cannot be crafted.';
    if (Object.entries(item.recipe).some(([material,amount]) => stock(progress,material)<amount)) {
      return 'Scout the trails for more materials.';
    }
    for (const [material,amount] of Object.entries(item.recipe)) add(progress,material,-amount);
    add(progress,id,1);
    return 'Crafted ' + item.name + '.';
  }
  function refine(progress,id) {
    const item = byId.get(id);
    if (!item?.refine || !stock(progress,id)) return 'Obtain the material before refining it.';
    const {shards,silk,cogs} = item.refine;
    add(progress,id,-1);
    progress.shards=Math.min(Number.MAX_SAFE_INTEGER,count(progress.shards)+shards);
    if (silk) add(progress,'sunleaf-silk',silk);
    if (cogs) add(progress,'garden-cog',cogs);
    return 'Refined '+item.name+'.';
  }
  function workshop(progress,id) {
    const item = byId.get(id);
    const project = byId.get(item?.workshopTarget);
    if (!project?.recipe || !stock(progress,id)) return 'Obtain the material before crafting.';
    if (stock(progress,project.id)) return 'You already have '+project.name+'.';
    add(progress,id,-1);
    add(progress,project.id,1);
    return 'Crafted '+project.name+'.';
  }
  function exhibition(progress) {
    const current = byId.get(progress.catalogDisplay);
    return current?.exhibit && stock(progress,current.id) ? current : null;
  }
  function display(progress,id) {
    const item = byId.get(id);
    if (!item?.exhibit || !stock(progress,id)) return 'Obtain this collectible first.';
    const alreadyOnDisplay=progress.catalogDisplay===id;
    progress.catalogDisplay=alreadyOnDisplay?'':id;
    return alreadyOnDisplay?'Removed '+item.name+' from display.':'Displayed '+item.name+'.';
  }
  function equip(progress,id,cat=progress.companion) {
    const item = byId.get(id);
    const cats=[progress.companion,...(Array.isArray(progress.otherCompanions)?progress.otherCompanions:[])].filter(Boolean);
    if (!cats.includes(cat) || !item?.slot || !stock(progress,id)) return 'Choose an owned item and an active cat.';
    const next = {...cat.catalogGear};
    if (next[item.slot] === id) {
      delete next[item.slot];
      cat.catalogGear = next;
      return 'Unequipped ' + item.name + '.';
    }
    if (cats.some(other => other!==cat && other.catalogGear?.[item.slot]===id)) return 'Another cat is wearing this item.';
    cat.catalogGear = {...next,[item.slot]:id};
    return 'Equipped ' + item.name + '.';
  }
  function wishlist(progress,id) {
    if (!byId.has(id)) return 'Item unavailable.';
    const saved = Array.isArray(progress.itemWishlist) ? progress.itemWishlist : [];
    if (saved.includes(id)) {
      progress.itemWishlist = saved.filter(item => item!==id);
      return 'Removed from wishlist.';
    }
    if (saved.length>=100) return 'Your wishlist holds up to 100 items.';
    progress.itemWishlist = [...saved,id];
    return 'Saved to wishlist.';
  }
  function use(progress,id) {
    const item = byId.get(id), cat = progress.companion;
    if (!cat || !item || !stock(progress,id)) return 'Adopt a cat and obtain this item first.';
    if (item.read) {
      const books = Array.isArray(cat.catalogBooks) ? cat.catalogBooks : [];
      if (books.includes(id)) return 'This cat already read that book.';
      const nextStats = {...cat.stats};
      const studyLevel=Math.max(1,count(cat.stats?.level,1));
      let bond = count(cat.bondPoints);
      let increased = false;
      for (const [stat,amount] of Object.entries(item.read)) {
        if (stat === 'bond') {
          const nextBond = Math.min(100,bond+amount);
          increased ||= nextBond>bond;
          bond = nextBond;
        } else {
          const current = count(cat.stats?.[stat],2);
          const perLevel=stat==='endurance'?3:2;
          const ceiling=Math.min(200,studyLevel*perLevel+4);
          if(current+amount>ceiling){
            const neededLevel=Math.ceil((current+amount-4)/perLevel);
            return current+amount>200
              ?'This cat is too close to the permanent '+stat+' limit for this book.'
              :'Train to level '+neededLevel+' to gain the full '+stat+' bonus from this book.';
          }
          const next=current+amount;
          increased ||= next>current;
          nextStats[stat] = next;
        }
      }
      if (!increased) return 'This cat has reached the limits for these book bonuses.';
      cat.stats = nextStats;
      cat.bondPoints = bond;
      cat.catalogBooks = [...books,id];
      return 'Read ' + item.name + ' together.';
    }
    if (!item.care) return 'This item has no direct use.';
    if (item.daily && progress.catalogDaily?.[id]===day()) return 'Try this again tomorrow.';
    const now = Date.now();
    const days = Math.max(0,Math.floor((now-count(cat.updatedAt,now))/86400000));
    const fullness = Math.min(100,Math.max(25,count(cat.fullness,65)-days*15));
    const happiness = Math.min(100,Math.max(25,count(cat.happiness,65)-days*10));
    if (item.below && (item.below[0]==='fullness'?fullness:happiness)>=item.below[1]) {
      return 'Save this remedy for when your cat drops below its listed threshold.';
    }
    const [food,fun,bond] = item.care;
    const nextFullness = Math.min(100,fullness+food), nextHappiness = Math.min(100,happiness+fun);
    const nextBond = Math.min(100,count(cat.bondPoints)+bond);
    if (nextFullness===fullness && nextHappiness===happiness && nextBond===count(cat.bondPoints)) {
      return 'Your cat’s affected meters are already full.';
    }
    Object.assign(cat,{fullness:nextFullness,happiness:nextHappiness,bondPoints:nextBond,updatedAt:now});
    if (item.daily) progress.catalogDaily = {...progress.catalogDaily,[id]:day()};
    else add(progress,id,-1);
    if (item.category==='Food' || item.category==='Toy') {
      const previous = cat.itemExperiences?.[item.category];
      const seen = Array.isArray(previous) ? previous : [];
      if (!seen.includes(id)) cat.itemExperiences = {...cat.itemExperiences,[item.category]:[...seen,id]};
    }
    return 'Used ' + item.name + '.';
  }
  function worn(progress,cat,slot) {
    const item = byId.get(cat?.catalogGear?.[slot]);
    return item && item.slot===slot && stock(progress,item.id) ? item : null;
  }
  function arena(progress,cat) {
    return Object.assign({},...['weapon','armor','relic','wearable'].map(slot => worn(progress,cat,slot)?.arena));
  }
  function scoutReward(progress,pet,area) {
    const material = items.find(item => item.trail===area);
    if (!material) return '';
    const relic = worn(progress,pet,'relic');
    const display = exhibition(progress);
    const prize = display && progress.catalogExhibitionDay!==day() ? display.exhibit : null;
    if (prize) progress.catalogExhibitionDay=day();
    const amount = (relic?.scoutMaterial===material.id ? 2 : 1)+(prize?.materials||0);
    add(progress,material.id,amount);
    pet.bondPoints = Math.min(100,count(pet.bondPoints)+(relic?.scoutBond || 0)+(prize?.bond||0));
    progress.coins = Math.min(Number.MAX_SAFE_INTEGER,count(progress.coins)+(relic?.scoutCoins || 0)+(prize?.coins||0));
    return ' Found ' + amount + ' × ' + material.name + '.' +
      (relic?.scoutBond?' Bonus friendship +1.':'') + (relic?.scoutCoins?' Bonus Paw Coin +1.':'')+(prize?' The displayed collectible granted its daily trail bonus.':'');
  }
  function arenaReward(progress,rank) {
    const collectible = items.find(item => item.rank===rank);
    if (!collectible || stock(progress,collectible.id)) return null;
    add(progress,collectible.id,1);
    return collectible.name;
  }
  window.PawtopiaItems = Object.freeze({items,byId,stock,buy,craft,equip,use,wishlist,worn,arena,scoutReward,arenaReward,claim,hasClaimed,achievementProgress,refine,workshop,exhibition,display,stackable});
})();
