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
  const templates = [
    Object.freeze({"id":"foe-1","rank":1,"name":"Chihuahua","level":1,"color":"#95c6cb","glyph":"🐕","hp":20,"attack":3,"defence":0,"speed":2,"xp":3,"coins":2,"loot":"Snack chance","breed":"Chihuahua","sizeLabel":"Tiny","visualSize":0.5}),
    Object.freeze({"id":"foe-2","rank":2,"name":"Yorkshire Terrier","level":2,"color":"#cfa67b","glyph":"🐕","hp":27,"attack":4,"defence":0,"speed":2,"xp":7,"coins":4,"loot":"Snack chance","breed":"Yorkshire Terrier","sizeLabel":"Tiny","visualSize":0.55}),
    Object.freeze({"id":"foe-3","rank":3,"name":"Papillon","level":3,"color":"#c0a6fa","glyph":"🐕","hp":33,"attack":5,"defence":0,"speed":2,"xp":10,"coins":6,"loot":"Snack chance","breed":"Papillon","sizeLabel":"Toy","visualSize":0.61}),
    Object.freeze({"id":"foe-4","rank":4,"name":"Miniature Dachshund","level":4,"color":"#76c4a7","glyph":"🐕","hp":40,"attack":7,"defence":1,"speed":3,"xp":14,"coins":9,"loot":"Snack + crystal shard chance","breed":"Miniature Dachshund","sizeLabel":"Toy","visualSize":0.67}),
    Object.freeze({"id":"foe-5","rank":5,"name":"Boston Terrier","level":5,"color":"#91cfff","glyph":"🐕","hp":46,"attack":8,"defence":1,"speed":3,"xp":17,"coins":11,"loot":"Snack + crystal shard chance","breed":"Boston Terrier","sizeLabel":"Small","visualSize":0.74}),
    Object.freeze({"id":"foe-6","rank":6,"name":"Beagle","level":6,"color":"#efbc6f","glyph":"🐕","hp":52,"attack":9,"defence":1,"speed":3,"xp":21,"coins":13,"loot":"Snack + crystal shard chance","breed":"Beagle","sizeLabel":"Small","visualSize":0.8}),
    Object.freeze({"id":"foe-7","rank":7,"name":"English Cocker Spaniel","level":8,"color":"#adbacb","glyph":"🐕","hp":63,"attack":12,"defence":2,"speed":4,"xp":25,"coins":16,"loot":"Crystal shards + rare toy chance","breed":"English Cocker Spaniel","sizeLabel":"Medium","visualSize":0.86}),
    Object.freeze({"id":"foe-8","rank":8,"name":"Border Collie","level":10,"color":"#d0a0cf","glyph":"🐕","hp":74,"attack":14,"defence":2,"speed":4,"xp":29,"coins":18,"loot":"Crystal shards + rare toy chance","breed":"Border Collie","sizeLabel":"Medium","visualSize":0.92}),
    Object.freeze({"id":"foe-9","rank":9,"name":"Labrador Retriever","level":13,"color":"#a9e9ff","glyph":"🐕","hp":89,"attack":16,"defence":3,"speed":4,"xp":33,"coins":21,"loot":"Crystal shards + rare toy chance","breed":"Labrador Retriever","sizeLabel":"Large","visualSize":0.98}),
    Object.freeze({"id":"foe-10","rank":10,"name":"Rottweiler","level":16,"color":"#efc17d","glyph":"🐕","hp":104,"attack":20,"defence":4,"speed":5,"xp":38,"coins":24,"loot":"Crystal shards + medal","breed":"Rottweiler","sizeLabel":"Large","visualSize":1.04}),
    Object.freeze({"id":"foe-11","rank":11,"name":"English Mastiff","level":20,"color":"#df99b0","glyph":"🐕","hp":124,"attack":24,"defence":5,"speed":5,"xp":43,"coins":27,"loot":"Crystal shards + medal","breed":"English Mastiff","sizeLabel":"Giant","visualSize":1.11}),
    Object.freeze({"id":"foe-12","rank":12,"name":"Baron Brasswhirl","level":25,"color":"#faad70","glyph":"👑","hp":148,"attack":28,"defence":6,"speed":5,"xp":48,"coins":30,"loot":"Crystal shards + medal","sizeLabel":"Final boss","isBoss":true})
  ];
  // AKC recognized-breed roster, with toy Manchester and miniature Dachshund
  // as separate challengers. Weights are representative game ordering values.
  const roster = [
    ["Chihuahua",4.5,11,null,"foe-1"],
    ["Pomeranian",5,4,null,"dog-pomeranian"],
    ["Biewer Terrier",6,11,null,"dog-biewer-terrier"],
    ["Russian Toy",6.5,11,null,"dog-russian-toy"],
    ["Toy Fox Terrier",6.5,0,null,"dog-toy-fox-terrier"],
    ["Maltese",7,11,6,"dog-maltese"],
    ["Yorkshire Terrier",7,0,null,"foe-2"],
    ["Russian Tsvetnaya Bolonka",7.5,5,null,"dog-russian-tsvetnaya-bolonka"],
    ["Affenpinscher",8.5,0,null,"dog-affenpinscher"],
    ["Papillon",8.5,11,null,"foe-3"],
    ["Brussels Griffon",9,1,null,"dog-brussels-griffon"],
    ["Japanese Chin",9,1,null,"dog-japanese-chin"],
    ["Miniature Pinscher",9,0,null,"dog-miniature-pinscher"],
    ["Chinese Crested",10,10,3,"dog-chinese-crested"],
    ["Havanese",10,11,null,"dog-havanese"],
    ["Silky Terrier",10,0,null,"dog-silky-terrier"],
    ["Italian Greyhound",10.5,3,null,"dog-italian-greyhound"],
    ["English Toy Spaniel",11,7,null,"dog-english-toy-spaniel"],
    ["Miniature Dachshund",11,2,null,"foe-4"],
    ["Portuguese Podengo Pequeno",11,0,null,"dog-portuguese-podengo-pequeno"],
    ["Toy Manchester Terrier",11,0,null,"dog-toy-manchester-terrier"],
    ["Coton de Tulear",11.5,11,null,"dog-coton-de-tulear"],
    ["Norfolk Terrier",11.5,0,null,"dog-norfolk-terrier"],
    ["Norwich Terrier",12,0,null,"dog-norwich-terrier"],
    ["Russell Terrier",12,0,null,"dog-russell-terrier"],
    ["Tibetan Spaniel",12,7,null,"dog-tibetan-spaniel"],
    ["Shih Tzu",12.5,11,null,"dog-shih-tzu"],
    ["Lancashire Heeler",13,0,null,"dog-lancashire-heeler"],
    ["Schipperke",13,4,null,"dog-schipperke"],
    ["Border Terrier",13.5,0,null,"dog-border-terrier"],
    ["Cairn Terrier",13.5,0,null,"dog-cairn-terrier"],
    ["Pekingese",14,1,null,"dog-pekingese"],
    ["Bichon Frise",15,5,null,"dog-bichon-frise"],
    ["Lhasa Apso",15,11,null,"dog-lhasa-apso"],
    ["Löwchen",15,11,null,"dog-lowchen"],
    ["Norwegian Lundehund",15,4,null,"dog-norwegian-lundehund"],
    ["Parson Russell Terrier",15,0,null,"dog-parson-russell-terrier"],
    ["Cavalier King Charles Spaniel",15.5,7,null,"dog-cavalier-king-charles-spaniel"],
    ["Miniature Schnauzer",15.5,0,null,"dog-miniature-schnauzer"],
    ["Pug",16,1,null,"dog-pug"],
    ["Smooth Fox Terrier",16.5,0,null,"dog-smooth-fox-terrier"],
    ["Teddy Roosevelt Terrier",16.5,0,null,"dog-teddy-roosevelt-terrier"],
    ["Lakeland Terrier",17,0,null,"dog-lakeland-terrier"],
    ["Manchester Terrier",17,0,null,"dog-manchester-terrier"],
    ["Wire Fox Terrier",17,0,null,"dog-wire-fox-terrier"],
    ["Australian Terrier",17.5,0,null,"dog-australian-terrier"],
    ["Danish-Swedish Farmdog",17.5,0,null,"dog-danish-swedish-farmdog"],
    ["Rat Terrier",17.5,0,null,"dog-rat-terrier"],
    ["West Highland White Terrier",17.5,0,6,"dog-west-highland-white-terrier"],
    ["Boston Terrier",18.5,0,null,"foe-5"],
    ["Cesky Terrier",19,0,null,"dog-cesky-terrier"],
    ["American Hairless Terrier",20,10,null,"dog-american-hairless-terrier"],
    ["Bedlington Terrier",20,5,null,"dog-bedlington-terrier"],
    ["Scottish Terrier",20,0,null,"dog-scottish-terrier"],
    ["Shetland Sheepdog",20,8,null,"dog-shetland-sheepdog"],
    ["Shiba Inu",20,4,null,"dog-shiba-inu"],
    ["Welsh Terrier",20,0,null,"dog-welsh-terrier"],
    ["American Eskimo Dog",20.5,4,null,"dog-american-eskimo-dog"],
    ["Dandie Dinmont Terrier",21,2,null,"dog-dandie-dinmont-terrier"],
    ["Dachshund",21.5,2,null,"dog-dachshund"],
    ["Beagle",22,9,null,"foe-6"],
    ["Pyrenean Shepherd",22.5,8,null,"dog-pyrenean-shepherd"],
    ["Basenji",23,0,null,"dog-basenji"],
    ["Cirneco dell’Etna",23,3,null,"dog-cirneco-delletna"],
    ["Miniature Bull Terrier",23,0,null,"dog-miniature-bull-terrier"],
    ["Mudi",23.5,8,7,"dog-mudi"],
    ["Sealyham Terrier",23.5,0,null,"dog-sealyham-terrier"],
    ["Tibetan Terrier",24,11,null,"dog-tibetan-terrier"],
    ["Cocker Spaniel",25,7,null,"dog-cocker-spaniel"],
    ["Nederlandse Kooikerhondje",25,7,null,"dog-nederlandse-kooikerhondje"],
    ["Pumi",25.5,5,null,"dog-pumi"],
    ["Irish Terrier",26,0,null,"dog-irish-terrier"],
    ["Finnish Spitz",26.5,4,null,"dog-finnish-spitz"],
    ["Icelandic Sheepdog",27.5,4,null,"dog-icelandic-sheepdog"],
    ["Swedish Vallhund",27.5,2,null,"dog-swedish-vallhund"],
    ["French Bulldog",28,1,8,"dog-french-bulldog"],
    ["Pembroke Welsh Corgi",29,2,null,"dog-pembroke-welsh-corgi"],
    ["Lagotto Romagnolo",29.5,5,null,"dog-lagotto-romagnolo"],
    ["English Cocker Spaniel",30,7,4,"foe-7"],
    ["Miniature American Shepherd",30,8,null,"dog-miniature-american-shepherd"],
    ["Puli",30,5,null,"dog-puli"],
    ["Basset Fauve de Bretagne",31,2,null,"dog-basset-fauve-de-bretagne"],
    ["Staffordshire Bull Terrier",31,0,null,"dog-staffordshire-bull-terrier"],
    ["Cardigan Welsh Corgi",31.5,2,null,"dog-cardigan-welsh-corgi"],
    ["Boykin Spaniel",32.5,7,null,"dog-boykin-spaniel"],
    ["Petit Basset Griffon Vendéen",32.5,2,null,"dog-petit-basset-griffon-vendeen"],
    ["Whippet",32.5,3,null,"dog-whippet"],
    ["Xoloitzcuintli",32.5,10,null,"dog-xoloitzcuintli"],
    ["Norwegian Buhund",33,4,null,"dog-norwegian-buhund"],
    ["American Water Spaniel",35,7,null,"dog-american-water-spaniel"],
    ["Brittany",35,7,null,"dog-brittany"],
    ["German Pinscher",35,0,null,"dog-german-pinscher"],
    ["Soft Coated Wheaten Terrier",35,0,null,"dog-soft-coated-wheaten-terrier"],
    ["Glen of Imaal Terrier",36,2,null,"dog-glen-of-imaal-terrier"],
    ["Kerry Blue Terrier",36.5,0,null,"dog-kerry-blue-terrier"],
    ["Keeshond",40,4,null,"dog-keeshond"],
    ["Polish Lowland Sheepdog",40,8,null,"dog-polish-lowland-sheepdog"],
    ["Skye Terrier",40,2,null,"dog-skye-terrier"],
    ["Spanish Water Dog",40,5,null,"dog-spanish-water-dog"],
    ["Spinone Italiano",40,7,null,"dog-spinone-italiano"],
    ["Standard Schnauzer",40,0,null,"dog-standard-schnauzer"],
    ["Sussex Spaniel",40,7,null,"dog-sussex-spaniel"],
    ["Nova Scotia Duck Tolling Retriever",42,7,null,"dog-nova-scotia-duck-tolling-retriever"],
    ["Australian Cattle Dog",42.5,8,null,"dog-australian-cattle-dog"],
    ["Border Collie",42.5,8,null,"foe-8"],
    ["Field Spaniel",42.5,7,null,"dog-field-spaniel"],
    ["Grand Basset Griffon Vendéen",42.5,2,null,"dog-grand-basset-griffon-vendeen"],
    ["Finnish Lapphund",43,4,null,"dog-finnish-lapphund"],
    ["Azawakh",44,3,null,"dog-azawakh"],
    ["Bulldog",45,1,null,"dog-bulldog"],
    ["Canaan Dog",45,4,null,"dog-canaan-dog"],
    ["English Springer Spaniel",45,7,null,"dog-english-springer-spaniel"],
    ["Welsh Springer Spaniel",45,7,null,"dog-welsh-springer-spaniel"],
    ["Boxer",47.5,1,null,"dog-boxer"],
    ["Ibizan Hound",47.5,3,null,"dog-ibizan-hound"],
    ["Irish Red & White Setter",47.5,7,null,"dog-irish-red-white-setter"],
    ["Portuguese Water Dog",47.5,5,null,"dog-portuguese-water-dog"],
    ["Siberian Husky",47.5,4,7,"dog-siberian-husky"],
    ["Barbet",50,5,null,"dog-barbet"],
    ["Bearded Collie",50,8,null,"dog-bearded-collie"],
    ["Pharaoh Hound",50,3,null,"dog-pharaoh-hound"],
    ["Plott Hound",50,9,null,"dog-plott-hound"],
    ["Samoyed",50,4,6,"dog-samoyed"],
    ["Norwegian Elkhound",51.5,4,null,"dog-norwegian-elkhound"],
    ["Vizsla",52,7,null,"dog-vizsla"],
    ["Australian Shepherd",52.5,8,10,"dog-australian-shepherd"],
    ["Basset Hound",52.5,2,null,"dog-basset-hound"],
    ["Chinese Shar-Pei",52.5,1,null,"dog-chinese-shar-pei"],
    ["Entlebucher Mountain Dog",52.5,6,null,"dog-entlebucher-mountain-dog"],
    ["Harrier",52.5,9,null,"dog-harrier"],
    ["Saluki",52.5,3,null,"dog-saluki"],
    ["Wirehaired Pointing Griffon",52.5,7,null,"dog-wirehaired-pointing-griffon"],
    ["Afghan Hound",55,3,null,"dog-afghan-hound"],
    ["American English Coonhound",55,9,null,"dog-american-english-coonhound"],
    ["American Staffordshire Terrier",55,0,null,"dog-american-staffordshire-terrier"],
    ["Poodle",55,5,null,"dog-poodle"],
    ["Sloughi",55,3,null,"dog-sloughi"],
    ["Wirehaired Vizsla",55,7,null,"dog-wirehaired-vizsla"],
    ["Irish Water Spaniel",56.5,7,null,"dog-irish-water-spaniel"],
    ["Chow Chow",57.5,4,null,"dog-chow-chow"],
    ["Dalmatian",57.5,9,11,"dog-dalmatian"],
    ["German Shorthaired Pointer",57.5,7,null,"dog-german-shorthaired-pointer"],
    ["Redbone Coonhound",57.5,9,null,"dog-redbone-coonhound"],
    ["Airedale Terrier",60,0,null,"dog-airedale-terrier"],
    ["Belgian Laekenois",60,8,null,"dog-belgian-laekenois"],
    ["Belgian Malinois",60,8,null,"dog-belgian-malinois"],
    ["Belgian Sheepdog",60,8,null,"dog-belgian-sheepdog"],
    ["Belgian Tervuren",60,8,null,"dog-belgian-tervuren"],
    ["Berger Picard",60,8,null,"dog-berger-picard"],
    ["Bull Terrier",60,0,null,"dog-bull-terrier"],
    ["German Wirehaired Pointer",60,7,null,"dog-german-wirehaired-pointer"],
    ["Pointer",60,7,null,"dog-pointer"],
    ["Treeing Walker Coonhound",60,9,null,"dog-treeing-walker-coonhound"],
    ["Bluetick Coonhound",62.5,9,null,"dog-bluetick-coonhound"],
    ["Collie",62.5,8,null,"dog-collie"],
    ["English Setter",62.5,7,null,"dog-english-setter"],
    ["Gordon Setter",62.5,7,null,"dog-gordon-setter"],
    ["American Foxhound",65,9,null,"dog-american-foxhound"],
    ["Flat-Coated Retriever",65,7,null,"dog-flat-coated-retriever"],
    ["Golden Retriever",65,7,0,"dog-golden-retriever"],
    ["Greyhound",65,3,null,"dog-greyhound"],
    ["Irish Setter",65,7,4,"dog-irish-setter"],
    ["Chesapeake Bay Retriever",67.5,7,null,"dog-chesapeake-bay-retriever"],
    ["English Foxhound",67.5,9,null,"dog-english-foxhound"],
    ["Labrador Retriever",67.5,7,null,"foe-9"],
    ["Bergamasco",70,8,null,"dog-bergamasco"],
    ["Chinook",70,0,null,"dog-chinook"],
    ["Clumber Spaniel",70,7,null,"dog-clumber-spaniel"],
    ["German Shepherd Dog",70,8,7,"dog-german-shepherd-dog"],
    ["Bracco Italiano",72.5,7,null,"dog-bracco-italiano"],
    ["Weimaraner",72.5,7,null,"dog-weimaraner"],
    ["Giant Schnauzer",76.3,0,null,"dog-giant-schnauzer"],
    ["Briard",77.5,8,null,"dog-briard"],
    ["Curly-Coated Retriever",77.5,5,null,"dog-curly-coated-retriever"],
    ["Rhodesian Ridgeback",77.5,9,null,"dog-rhodesian-ridgeback"],
    ["Alaskan Malamute",80,4,null,"dog-alaskan-malamute"],
    ["Doberman Pinscher",80,0,8,"dog-doberman-pinscher"],
    ["Old English Sheepdog",80,8,null,"dog-old-english-sheepdog"],
    ["Borzoi",82.5,3,null,"dog-borzoi"],
    ["Black and Tan Coonhound",87.5,9,null,"dog-black-and-tan-coonhound"],
    ["Beauceron",90,8,null,"dog-beauceron"],
    ["Bouvier des Flandres",90,8,null,"dog-bouvier-des-flandres"],
    ["Dogo Argentino",90,9,6,"dog-dogo-argentino"],
    ["Komondor",90,5,null,"dog-komondor"],
    ["Scottish Deerhound",91.3,3,null,"dog-scottish-deerhound"],
    ["Bernese Mountain Dog",92.5,6,10,"dog-bernese-mountain-dog"],
    ["Great Pyrenees",92.5,6,null,"dog-great-pyrenees"],
    ["Kuvasz",92.5,6,null,"dog-kuvasz"],
    ["Bloodhound",95,9,null,"dog-bloodhound"],
    ["Otterhound",97.5,9,null,"dog-otterhound"],
    ["Akita",100,4,null,"dog-akita"],
    ["Dogue de Bordeaux",104.5,1,null,"dog-dogue-de-bordeaux"],
    ["Black Russian Terrier",105,0,null,"dog-black-russian-terrier"],
    ["Cane Corso",105,6,null,"dog-cane-corso"],
    ["Rottweiler",107.5,6,null,"foe-10"],
    ["Tibetan Mastiff",110,6,null,"dog-tibetan-mastiff"],
    ["Greater Swiss Mountain Dog",112.5,6,null,"dog-greater-swiss-mountain-dog"],
    ["Irish Wolfhound",112.5,3,null,"dog-irish-wolfhound"],
    ["Anatolian Shepherd Dog",115,6,null,"dog-anatolian-shepherd-dog"],
    ["Bullmastiff",115,6,null,"dog-bullmastiff"],
    ["Newfoundland",125,6,null,"dog-newfoundland"],
    ["Leonberger",130,6,null,"dog-leonberger"],
    ["Neapolitan Mastiff",130,6,null,"dog-neapolitan-mastiff"],
    ["Great Dane",142.5,6,4,"dog-great-dane"],
    ["Saint Bernard",150,6,9,"dog-saint-bernard"],
    ["Boerboel",175,6,null,"dog-boerboel"],
    ["English Mastiff",185,6,null,"foe-11"]
  ];
  const limits=[6,8,10,12,19,24,34,49,75,115,250];
  const bossRank=12;
  const foes=roster.map(([breed,weight,build,palette,id])=>{
    const index=limits.findIndex(limit=>weight<=limit);
    const tier=templates[index];
    const low=index?limits[index-1]:4.5,high=Math.min(limits[index],185);
    const position=Math.max(0,Math.min(1,(weight-low)/(high-low)));
    const hp=tier.hp+Math.floor(position*3);
    const attack=tier.attack+(index>=6&&position>=.72?1:0);
    const xp=(index===0?6:index===1?8:tier.xp)+Math.floor(position);
    const coins=tier.coins+(position>=.78?1:0);
    const loot=index<3?'Snack every second win':
      (1+Math.floor((tier.rank-4)/3))+' crystal shard'+(tier.rank>=7?'s':'')+
      (tier.rank===4||tier.rank===8?' · first win medal':'')+
      (tier.rank>=7?' · first-win Crystal Toy if missing':'');
    return Object.freeze({...tier,id,name:breed,breed,weight,build,palette,hp,attack,xp,coins,loot,
      legacyHp:tier.hp,legacyAttack:tier.attack,
      visualSize:.5+.61*(Math.sqrt(weight)-Math.sqrt(4.5))/(Math.sqrt(185)-Math.sqrt(4.5))});
  });
  foes.push(Object.freeze({...templates[bossRank-1],loot:'3 crystal shards · first win Golden Paw Crown · Crystal Toy if missing'}));
  const battlePoints=rank=>rank<=4?2:rank<=8?3:4;
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
    const form=window.PawtopiaBattleCharacterArt?.identityFor(kit.breed)?.form;
    return [
      { id:'swipe', name:'Paw Swipe', level:1, description:form ? form+' opening' : 'Shared reliable basic attack' },
      { id:'guard', name:'Guard Curl', level:3, description:'Block and counter a portion of the next blow' },
      { id:'signature', name:(cat?.name || kit.breed) + '’s ' + kit.signature, level:6, description:'Unique ' + kit.theme.type + ' technique · ' + kit.theme.bonus },
      { id:'ultimate', name:(cat?.name || kit.breed) + '’s ' + kit.ultimate, level:10, description:'Powerful once-per-battle signature finale' }
    ];
  }
  window.PawtopiaBattleData = Object.freeze({
    breeds: Object.freeze(breeds), kits: Object.freeze(kits),
    foes: Object.freeze(foes), bossRank, battlePoints, themes: Object.freeze(themes),
    animationStates, kitFor, movesFor
  });
})();