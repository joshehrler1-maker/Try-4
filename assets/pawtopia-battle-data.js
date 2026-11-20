/* Super Paw Heroes: 56 original adopted-cat battle rigs using the existing
   approved breed portraits. All frames/effects are original runtime transforms:
   NOT 56 separately hand-illustrated frame-by-frame animation sheets. */
(() => {
  'use strict';
  const originalBreeds = ["Maine Coon","Siamese","Bengal","British Shorthair","Ragdoll","Sphynx"];
  const catalogBreeds = ["Abyssinian","American Bobtail","American Curl","American Shorthair","American Wirehair","Balinese","Birman","Bombay","Burmese","Burmilla","Chartreux","Cornish Rex","Devon Rex","Egyptian Mau","European Shorthair","Exotic Shorthair","Havana Brown","Japanese Bobtail","Khao Manee","Korat","LaPerm","Lykoi","Manx","Nebelung","Norwegian Forest Cat","Ocicat","Oriental Shorthair","Persian","Peterbald","Pixiebob","Ragamuffin","Russian Blue","Savannah","Scottish Fold","Selkirk Rex","Siberian","Singapura","Snowshoe","Somali","Tonkinese","Toyger","Turkish Angora","Turkish Van","York Chocolate","Australian Mist","Cymric","Donskoy","German Rex","Kurilian Bobtail","Sokoke"];
  const breeds = [...originalBreeds, ...catalogBreeds];
  const uniqueSkills = ["Timber Claw","Moonlight Prism","Sunstripe Rush","Royal Shield","Velvet Comet","Phantom Glimmer","Desert Mirage","Bobtail Blitz","Crescent Ear","City Pounce","Copper Tangle","Bali Breeze","Sacred Step","Midnight Flicker","Amber Flash","Silver Ripple","Blue Ember","Spiral Sprint","Pixie Pulse","Nile Star","Trail Streak","Cloudbreaker","Cocoa Whirl","Lucky Lantern","Diamond Wink","Storm Whisper","Curling Gust","Moon Shadow","Hilltop Hop","Mistfall","Northern Roar","Ocelot Dash","Silk Lance","Silken Storm","Quickstep Echo","Pinecone Pounce","Dream Fluff","Azure Arc","Savanna Flash","Folded Comet","Rex Rumble","Snowbloom","Tiny Thunder","Froststep","Sunburst Tail","Twilight Tango","Tiger Trail","Pearl Sweep","Lake Skimmer","Cocoa Cloud","Outback Haze","Celtic Bounce","Radiant Heat","Clockhand Spin","Island Current","Canopy Zigzag"];
  const themes = [{"type":"spark","color":"#ffd56c","particle":"✦","motion":"burst","bonus":"crit"},{"type":"frost","color":"#92d6ff","particle":"❄","motion":"arc","bonus":"slow"},{"type":"leaf","color":"#a2e49f","particle":"❧","motion":"spiral","bonus":"guard"},{"type":"star","color":"#d2b0ff","particle":"★","motion":"beam","bonus":"heal"},{"type":"water","color":"#86e4e6","particle":"◈","motion":"wave","bonus":"heal"},{"type":"wind","color":"#fff5c8","particle":"➶","motion":"dash","bonus":"dodge"},{"type":"gear","color":"#eeb58f","particle":"⚙","motion":"spin","bonus":"extra"},{"type":"shadow","color":"#aeabe4","particle":"✧","motion":"feint","bonus":"pierce"}];
  const foes = [{"id":"foe-1","rank":1,"name":"Tin Training Hound","level":1,"color":"#95c6cb","glyph":"🐾","hp":20,"attack":3,"defence":0,"speed":2,"xp":3,"coins":2,"loot":"Snack chance"},{"id":"foe-2","rank":2,"name":"Copper Sniffer","level":2,"color":"#cfa67b","glyph":"⚙","hp":27,"attack":4,"defence":0,"speed":2,"xp":7,"coins":4,"loot":"Snack chance"},{"id":"foe-3","rank":3,"name":"Clockwork Terrier","level":3,"color":"#c0a6fa","glyph":"🐕","hp":33,"attack":5,"defence":0,"speed":2,"xp":10,"coins":6,"loot":"Snack chance"},{"id":"foe-4","rank":4,"name":"Garden Gearhound","level":4,"color":"#76c4a7","glyph":"🌿","hp":40,"attack":7,"defence":1,"speed":3,"xp":14,"coins":9,"loot":"Snack + crystal shard chance"},{"id":"foe-5","rank":5,"name":"Frost Fang Scout","level":5,"color":"#91cfff","glyph":"❄","hp":46,"attack":8,"defence":1,"speed":3,"xp":17,"coins":11,"loot":"Snack + crystal shard chance"},{"id":"foe-6","rank":6,"name":"Boltback Ranger","level":6,"color":"#efbc6f","glyph":"⚡","hp":52,"attack":9,"defence":1,"speed":3,"xp":21,"coins":13,"loot":"Snack + crystal shard chance"},{"id":"foe-7","rank":7,"name":"Iron Fang Recruit","level":8,"color":"#adbacb","glyph":"🦾","hp":63,"attack":12,"defence":2,"speed":4,"xp":25,"coins":16,"loot":"Crystal shards + rare toy chance"},{"id":"foe-8","rank":8,"name":"Iron Fang Striker","level":10,"color":"#d0a0cf","glyph":"⚔","hp":74,"attack":14,"defence":2,"speed":4,"xp":29,"coins":18,"loot":"Crystal shards + rare toy chance"},{"id":"foe-9","rank":9,"name":"Cryowolf Engine","level":13,"color":"#a9e9ff","glyph":"💎","hp":89,"attack":16,"defence":3,"speed":4,"xp":33,"coins":21,"loot":"Crystal shards + rare toy chance"},{"id":"foe-10","rank":10,"name":"Brass Howler","level":16,"color":"#efc17d","glyph":"🔱","hp":104,"attack":20,"defence":4,"speed":5,"xp":38,"coins":24,"loot":"Crystal shards + medal"},{"id":"foe-11","rank":11,"name":"Iron Fang Commander","level":20,"color":"#df99b0","glyph":"🛡","hp":124,"attack":24,"defence":5,"speed":5,"xp":43,"coins":27,"loot":"Crystal shards + medal"},{"id":"foe-12","rank":12,"name":"Baron's Clockwork Avatar","level":25,"color":"#faad70","glyph":"👑","hp":148,"attack":28,"defence":6,"speed":5,"xp":48,"coins":30,"loot":"Crystal shards + medal"}];
  const animationStates = Object.freeze(['idle','approach','swipe','guard','cast','impact','victory','defeat']);
  const kits = breeds.map((breed,index) => {
    const isOriginal = index < originalBreeds.length;
    const sheetIndex = index - originalBreeds.length;
    const cell = sheetIndex % 25;
    const theme = themes[index % themes.length];
    const sprite = isOriginal
      ? Object.freeze({
          src: 'assets/scenes/adopt-' + breed.toLowerCase().replaceAll(' ','-') + '.webp',
          backgroundSize: 'cover', backgroundPosition: 'center'
        })
      : Object.freeze({
          src: 'assets/scenes/adopt-catalog-' + (Math.floor(sheetIndex / 25) + 1) + '.webp',
          backgroundSize: '500% 500%',
          backgroundPosition: (cell % 5 * 25) + '% ' + (Math.floor(cell / 5) * 25) + '%'
        });
    return Object.freeze({
      id: 'cat-kit-' + String(index+1).padStart(2,'0'), breed, sprite,
      signature: uniqueSkills[index], ultimate: uniqueSkills[index] + ' Finale',
      theme: Object.freeze(theme), movement: ['bounce','dash','sway','spring','glide','spin','float','sprint'][index%8],
      animations: animationStates
    });
  });
  function kitFor(breed) {
    return kits.find(kit => kit.breed === breed) || kits[0];
  }
  function movesFor(cat) {
    const kit = kitFor(cat?.breed);
    return [
      { id:'swipe', name:'Paw Swipe', level:1, description:'Shared reliable basic attack' },
      { id:'guard', name:'Guard Curl', level:3, description:'Block and counter a portion of the next blow' },
      { id:'signature', name:kit.signature, level:6, description:'Unique ' + kit.theme.type + ' technique · ' + kit.theme.bonus },
      { id:'ultimate', name:kit.ultimate, level:10, description:'Powerful once-per-battle signature finale' }
    ];
  }
  window.PawtopiaBattleData = Object.freeze({
    breeds: Object.freeze(breeds), kits: Object.freeze(kits),
    foes: Object.freeze(foes), themes: Object.freeze(themes),
    animationStates, kitFor, movesFor
  });
})();