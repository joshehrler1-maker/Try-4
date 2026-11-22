(() => {
  'use strict';
  const day = () => new Date().toISOString().slice(0, 10);
  const count = value => Number.isSafeInteger(value) && value > 0 ? value : 0;
  const list = value => Array.isArray(value) ? value : [];
  const categories = {Food:'Foods tried', Book:'Books read', Toy:'Toys played with'};
  const careers = {
    guide:{name:'Trail Guide', stat:'movement', material:'sunleaf-silk', path:'pawtopia-scout-trails.html'},
    baker:{name:'Cottage Baker', stat:'endurance', material:'grotto-glass', path:'pawtopia-companions.html#training-title'},
    mechanic:{name:'Gear Apprentice', stat:'intelligence', material:'garden-cog', path:'pawtopia-companions.html#training-title'}
  };
  const shops = {
    pantry:{name:'Juniper', shop:'Cottage Pantry', path:'pawtopia-shop-companion-supplies.html', material:'sunleaf-silk', favor:'Bring a bolt of sunleaf silk for the pantry baskets.'},
    forge:{name:'Copper', shop:'Defense Gear', path:'pawtopia-shop-defense-gear.html', material:'garden-cog', favor:'Bring a garden cog for the repair bench.'},
    furniture:{name:'Fern', shop:'Fine Furniture', path:'pawtopia-shop-fine-furniture.html', material:'frostbell-flake', favor:'Bring a frostbell flake to finish a frosted lamp.'}
  };
  const rescues = [
    {name:'Moss',breed:'Maine Coon',story:'Found shelter in a Scout Trail supply basket. Moss loves warm windows and quiet company.'},
    {name:'Pip',breed:'Siamese',story:'Followed the scent of bread into Town Square. Pip wants a home near a busy kitchen.'},
    {name:'Cloud',breed:'Ragdoll',story:'Waited under the festival lanterns until the rain stopped. Cloud loves a soft bed.'}
  ];
  const roomSlots = ['By the window','By the hearth','Reading corner','Display shelf'];
  const capacity = progress => window.PawtopiaSave.cottageCapacity(progress);
  const wallet = (progress, coins) => {
    progress.coins = Math.min(Number.MAX_SAFE_INTEGER, count(progress.coins)+coins);
  };
  const market = () => window.PawtopiaItems;
  function material(progress, id, delta) {
    const current = market().stock(progress,id);
    if (current + delta < 0) return false;
    const items = {...progress.catalogItems};
    const qty = Math.min(999,current+delta);
    if (qty) items[id] = qty;
    else delete items[id];
    progress.catalogItems = items;
    return true;
  }
  function collection(cat, category) {
    const saved = category === 'Book' ? cat?.catalogBooks : cat?.itemExperiences?.[category];
    return [...new Set(list(saved))].filter(id => market().byId.get(id)?.category===category);
  }
  function claimCollection(progress, category) {
    const cat = progress.companion;
    if (!cat || !Object.hasOwn(categories,category)) return 'Choose an active cat and collection.';
    const milestones = [3,10,25,50];
    const claimed = count(cat.collectionMilestones?.[category]);
    const target = milestones[claimed];
    if (!target || collection(cat,category).length < target) return 'Try more different items to unlock the next reward.';
    cat.collectionMilestones = {...cat.collectionMilestones,[category]:claimed+1};
    wallet(progress,4+4*claimed);
    const seen = new Set(collection(cat,category));
    const prize = market().items.find(item => item.category===category && item.price && item.price<=20 &&
      !seen.has(item.id) && !market().stock(progress,item.id));
    if (prize) material(progress,prize.id,1);
    return 'Collection milestone earned. Added '+(4+4*claimed)+' Paw Coins'+(prize?' and '+prize.name:'')+'.';
  }
  function shift(progress, id) {
    const job = Object.hasOwn(careers,id) && careers[id];
    const cat = progress.companion;
    if (!job || !cat) return 'Choose an active cat and career.';
    if (cat.lastCareerShift===day()) return 'This cat can work again tomorrow.';
    const stats = window.PawtopiaSave.battleStats(cat);
    if (stats[job.stat]<3) return 'Train '+job.stat+' to 3 to start this career.';
    const shifts = count(cat.careers?.[id]);
    const rank = shifts>=8 && stats[job.stat]>=8 ? 3 : shifts>=3 && stats[job.stat]>=5 ? 2 : 1;
    cat.careers = {...cat.careers,[id]:shifts+1};
    cat.lastCareerShift = day();
    wallet(progress,2+rank);
    material(progress,job.material,1);
    return job.name+' shift complete. Earned '+(2+rank)+' Paw Coins and a material.';
  }
  function favor(progress, id, deliver) {
    const keeper = Object.hasOwn(shops,id) && shops[id];
    if (!keeper) return 'Choose a shopkeeper.';
    const before = progress.shopFriendships?.[id] || {};
    const key = deliver?'delivered':'visited';
    if (before[key]===day()) return 'Come back tomorrow for another '+(deliver?'favor.':'visit.');
    if (deliver && !material(progress,keeper.material,-1)) return 'Find the requested material on Scout’s Trail first.';
    const points = Math.min(1000,count(before.points)+(deliver?2:1));
    progress.shopFriendships = {...progress.shopFriendships,[id]:{...before,[key]:day(),points}};
    if (deliver) wallet(progress, 3);
    return deliver?'Favor complete. Earned 3 Paw Coins.':'You visited '+keeper.name+'.';
  }
  function claimShop(progress,id) {
    const keeper = Object.hasOwn(shops,id) && shops[id];
    const record = progress.shopFriendships?.[id];
    if (!keeper || !record || count(record.points)<8 || record.reward) return 'Reach 8 friendship first.';
    progress.shopFriendships = {...progress.shopFriendships,[id]:{...record,reward:true}};
    material(progress,keeper.material,3);
    wallet(progress,6);
    return 'Friendship gift claimed. Earned 6 Paw Coins and 3 materials.';
  }
  function adopt(progress, index) {
    const rescue = rescues[index];
    if (!Number.isInteger(index) || !rescue || list(progress.rescuedCats).includes(index)) return 'This rescue is unavailable.';
    if ([progress.companion,...list(progress.otherCompanions)].filter(Boolean).length>=capacity(progress)) return 'Expand the Cottage before adopting again.';
    const cat = {...rescue,bio:rescue.story,fullness:65,happiness:65,updatedAt:Date.now()};
    if (progress.companion) progress.otherCompanions = [...list(progress.otherCompanions),cat];
    else progress.companion = cat;
    progress.rescuedCats = [...list(progress.rescuedCats),index];
    return rescue.name+' has a home in your Cottage.';
  }
  function expand(progress) {
    const tier = capacity(progress)-4;
    const cost = [20,35][tier];
    const needed = [3,5][tier];
    if (!cost) return 'The Cottage is fully expanded.';
    if (count(progress.coins)<cost || !material(progress,'sunleaf-silk',-needed)) return 'Gather the listed coins and silk first.';
    progress.coins -= cost;
    progress.cottageExpansion = tier+1;
    return 'A new cat slot is ready.';
  }
  function place(progress, slot, id) {
    const cat = progress.companion;
    if (!cat || !Number.isInteger(slot) || !roomSlots[slot]) return 'Choose an active cat and room spot.';
    const item = market().byId.get(id);
    const category = slot===3?'Collectible':'Furnishing';
    if (id && (item?.category!==category || !market().stock(progress,id))) return 'Choose an owned '+category.toLowerCase()+'.';
    const room = {...cat.cottageRoom};
    if (id && Object.values(room).includes(id) && room[slot]!==id) return 'Move this item out of its current spot first.';
    const otherRooms = list(progress.otherCompanions).filter(Boolean).flatMap(other => Object.values(other.cottageRoom||{}));
    if (id && otherRooms.filter(placed => placed===id).length>=market().stock(progress,id)) return 'Another cat has this item in its room.';
    if (id) room[slot] = id;
    else delete room[slot];
    cat.cottageRoom = room;
    return 'Room updated.';
  }
  window.PawtopiaLife = Object.freeze({day,categories,careers,shops,rescues,roomSlots,capacity,collection,claimCollection,shift,favor,claimShop,adopt,expand,place});
})();
