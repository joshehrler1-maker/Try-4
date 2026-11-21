/* Original catalog illustrations. Geometry describes the object's form;
   its district, finish, detailing and in-battle motif come from its item ID. */
(() => {
  'use strict';
  const forms={
  "Food": {
    "Fish Bowl": "bowl",
    "Supper Roll": "roll",
    "Creek Stew": "stew",
    "Meadow Pâté": "pate",
    "Sardine Parcel": "parcel",
    "Broth Cup": "cup",
    "Picnic Flakes": "flakes",
    "Roasted Bites": "bites",
    "Trout Medallion": "medal",
    "Pantry Plate": "plate",
    "Snowday Mousse": "mousse",
    "Hearth Snack": "snack",
    "Market Fillet": "fillet",
    "River Crisp": "crisp",
    "Trail Terrine": "terrine"
  },
  "Toy": {
    "Ribbon Wand": "ribbon",
    "Rattle Drum": "drum",
    "Perch Puzzle": "perch",
    "Feather Spinner": "spinner",
    "Tumble Hoop": "hoop",
    "Pendulum Box": "pendulum",
    "Rolling Shuttle": "shuttle",
    "Pounce Pad": "pad",
    "Tin Kite": "kite",
    "Shadow Theater": "theater",
    "Swing Mouse": "mouse",
    "Puzzle Tower": "tower",
    "Bell Maze": "maze",
    "Bouncing Bobbin": "bobbin",
    "Treat Track": "track"
  },
  "Book": {
    "Field Almanac": "almanac",
    "Study of Balance": "balance",
    "Sparring Journal": "journal",
    "Cottage Handbook": "handbook",
    "Trail Atlas": "atlas",
    "Clockwork Primer": "primer",
    "Scout Diary": "diary",
    "Archive Notes": "notes",
    "Songs of Courage": "songs",
    "Ledger of Lessons": "ledger",
    "Perch Manual": "manual",
    "Guide to Quiet Paws": "quiet",
    "Workshop Codex": "codex",
    "Tales of Teamwork": "courage",
    "Strategy Papers": "strategy"
  },
  "Wearable": {
    "Sash": "sash",
    "Neckerchief": "neckerchief",
    "Collar": "collar",
    "Festival Bow": "bow",
    "Mantle": "mantle",
    "Cap": "cap",
    "Badge": "badge",
    "Brooch": "brooch",
    "Kerchief": "kerchief",
    "Crown": "crown",
    "Medallion": "medallion",
    "Hood": "hood",
    "Cuff": "cuff",
    "Harness": "harness",
    "Rosette": "rosette"
  },
  "Battle Gear": {
    "Pounce Bracer": "bracer",
    "Reed Guard": "guard",
    "Trail Charm": "charm",
    "Bumper Mitt": "mitt",
    "Padded Vest": "vest",
    "Lantern Stone": "stone",
    "Spring Cuff": "cuff",
    "Hinge Shield": "shield",
    "Dusk Sigil": "sigil",
    "Counter Baton": "baton",
    "Felt Shell": "shell",
    "Forge Token": "token",
    "Wind Gauntlet": "gauntlet",
    "Birch Buckler": "buckler",
    "Compass Seal": "seal"
  },
  "Remedy": {
    "Calming Balm": "tin",
    "Restorative Tonic": "tonic",
    "Soothing Poultice": "poultice",
    "Mint Compress": "compress",
    "Warm Infusion": "infusion",
    "Sleep Salve": "salve",
    "Honey Liniment": "liniment",
    "Cottage Elixir": "elixir",
    "Mist Vapor": "vapor",
    "Gentle Ointment": "jar",
    "Recovery Draught": "draught",
    "Herbal Patch": "patch",
    "Cooling Rub": "rub",
    "Comfort Tea": "tea",
    "Bramble Syrup": "syrup"
  },
  "Weapon": {
    "Drive Knuckle": "knuckle",
    "Sparring Fan": "fan",
    "Arc Baton": "baton",
    "Counter Bell": "bell",
    "Pulse Rod": "rod",
    "Joust Paddle": "paddle",
    "Ridge Club": "club",
    "Tempo Mallet": "mallet",
    "Snap Flail": "flail",
    "Rune Wand": "wand",
    "Braid Whip": "whip",
    "Clatter Cane": "cane",
    "Cushion Saber": "saber",
    "Tuning Staff": "staff",
    "Pounce Hook": "hook"
  },
  "Armor": {
    "Quilted Carapace": "carapace",
    "Brace Vest": "vest",
    "Rebound Suit": "suit",
    "Petal Cuirass": "cuirass",
    "Letdown Plate": "breastplate",
    "Ridge Cloak": "mantle",
    "Softsteel Guard": "guard",
    "Timber Harness": "harness",
    "Buckle Shell": "shell",
    "Bristle Wrap": "wrap",
    "Tumble Pads": "pads",
    "Bark Brigandine": "brigandine",
    "Weave Jacket": "jacket",
    "Felt Panoply": "panoply",
    "Copper Coating": "coating"
  },
  "Relic": {
    "Recall Prism": "prism",
    "Steady Hourglass": "hourglass",
    "Coiled Amulet": "charm",
    "Northlight Lens": "lens",
    "Folded Mapstone": "mapstone",
    "Trail Seal": "seal",
    "Tempo Lodestone": "lodestone",
    "Breeze Effigy": "effigy",
    "Moon Dial": "dial",
    "Hint Tablet": "tablet",
    "Rest Gem": "stone",
    "Resonance Bead": "bead",
    "Quiet Idol": "idol",
    "Skylight Totem": "totem",
    "Glass Compass": "compass"
  },
  "Material": {
    "Timber Blank": "timber",
    "Felt Coil": "coil",
    "Glass Bead": "bead",
    "Cotton Spool": "spool",
    "Brass Offcut": "offcut",
    "Copper Foil": "foil",
    "Cottage Rivet": "rivet",
    "Root Fiber": "fiber",
    "Clay Lump": "clay",
    "Quartz Sliver": "prism",
    "Harbor Button": "button",
    "Lantern Cord": "cord",
    "Pressed Leaf": "leaf",
    "Crystal Thread": "thread",
    "Carved Dowel": "dowel"
  },
  "Furnishing": {
    "Nap Hammock": "hammock",
    "Reading Nook": "nook",
    "Porch Perch": "perch",
    "Breeze Screen": "screen",
    "Window Bench": "bench",
    "Snooze Mat": "mat",
    "Braid Basket": "basket",
    "Hearth Lounger": "lounger",
    "Paw Washstand": "washstand",
    "Loft Cushion": "cushion",
    "Willow Chair": "chair",
    "Climbing Shelf": "shelf",
    "Quiet Tent": "tent",
    "Cat Tunnel": "tunnel",
    "Sunroom Cot": "cot"
  },
  "Collectible": {
    "Trail Postcard": "postcard",
    "Founders’ Cameo": "cameo",
    "Parade Pennant": "pennant",
    "Clockwork Etching": "etching",
    "Festival Plate": "plate",
    "Copper Foil Print": "print",
    "Miniature Diorama": "diorama",
    "Scout Album Page": "album",
    "Town Portrait": "portrait",
    "Enamel Token": "token",
    "Story Scroll": "scroll",
    "Porcelain Figure": "figure",
    "Route Rubbing": "rubbing",
    "Moon Map": "map",
    "Sparring Lithograph": "lithograph"
  }
};
  const legacy={
  "sunfish-bites": "bites",
  "creekfish-stew": "stew",
  "supper-skewer": "skewer",
  "moon-milk": "cup",
  "packed-lunch": "parcel",
  "warm-platter": "plate",
  "spring-mouse": "mouse",
  "feather-kite": "kite",
  "woven-ball": "ball",
  "puzzle-box": "maze",
  "soothing-wrap": "wrap",
  "recovery-broth": "stew",
  "calm-drops": "tonic",
  "paw-spring": "bracer",
  "glass-needle": "needle",
  "gear-ram": "ram",
  "dawn-fork": "fork",
  "last-light": "bell",
  "hinge-hammer": "mallet",
  "reed-buckler": "buckler",
  "wool-lining": "coat",
  "copper-padding": "pads",
  "curled-plates": "breastplate",
  "rest-shell": "shell",
  "quickstep": "ribbon",
  "steady-spark": "token",
  "salvage-ring": "ring",
  "hush-coil": "coil",
  "trail-knot": "knot",
  "field-scope": "lens",
  "harvest-loop": "loop",
  "ivys-notebook": "notes",
  "alley-fieldbook": "handbook",
  "footwork-reader": "balance",
  "brace-reader": "manual",
  "mechanic-reader": "primer",
  "sunleaf-silk": "foil",
  "grotto-glass": "prism",
  "garden-cog": "cog",
  "frostbell-flake": "flake",
  "festival-mantle": "mantle",
  "moonflower-pin": "brooch",
  "gear-crown": "crown",
  "woven-cushion": "cushion",
  "window-lamp": "lamp",
  "scratch-deck": "deck",
  "copper-hound-sketch": "etching",
  "iron-fang-blueprint": "blueprint",
  "baron-invitation": "letter"
};
  const geometry={
    bowl:'M30 75 Q37 113 80 117 Q122 113 130 75Z',
    roll:'M39 57 Q24 71 33 98 Q49 119 116 103 Q138 89 123 67 Q103 49 39 57Z',
    stew:'M34 66 Q25 68 27 83 H38 L48 111 H112 L122 83 H133 Q136 66 126 66Z',
    pate:'M42 95 Q42 54 69 52 H100 Q117 60 121 95 L110 107 H49Z',
    parcel:'M28 63 L109 53 L133 97 L57 113Z M28 63 L79 95 L109 53',
    cup:'M53 53 H113 L108 104 Q85 119 59 105Z M112 65 Q140 58 132 81 Q128 94 108 92',
    flakes:'M32 92 L65 73 L79 100 L46 111Z M76 83 L112 65 L129 93 L97 105Z M55 74 L77 53 L103 69 L79 88Z',
    bites:'M34 91 Q26 76 43 68 Q57 56 69 71 L78 97 Q53 115 34 91Z M78 72 Q88 50 110 58 Q136 69 124 99 L98 107Z',
    medal:'M42 83 Q45 53 79 51 Q117 52 125 81 Q125 107 80 110 Q37 108 42 83Z',
    plate:'M24 88 Q32 58 81 62 Q132 61 138 89 Q124 115 80 115 Q36 115 24 88Z',
    mousse:'M49 99 Q42 87 58 76 Q53 59 73 59 Q81 45 96 59 Q112 60 108 79 Q123 85 115 103Z',
    snack:'M36 76 L58 62 L71 73 Q74 55 94 54 Q122 58 127 76 L117 100 Q100 115 83 102 L72 94 L53 109 L37 94Z',
    fillet:'M31 87 Q52 54 103 57 L130 72 Q118 88 89 101 L50 105Z',
    crisp:'M33 85 L53 60 L94 65 L120 53 L131 84 L101 107 L61 103Z',
    terrine:'M37 102 L37 67 L111 55 L126 73 V101 L58 115Z M37 67 L58 81 L126 73',
    skewer:'M38 113 L122 48 M52 98 L43 80 L63 67 L76 87Z M77 80 L68 64 L87 49 L100 67Z M99 62 L94 48 L112 38 L123 52Z',
    ribbon:'M29 111 Q62 44 108 57 Q143 68 111 95 Q91 108 77 94 Q57 73 95 71 M31 111 L66 90',
    drum:'M39 58 Q79 43 119 56 L123 102 Q85 124 40 104Z M42 65 L112 102 M116 63 L49 102',
    perch:'M34 108 H127 L116 116 H37Z M74 108 V72 H89 V108 M45 67 Q80 48 117 65 L119 73 H45Z',
    spinner:'M80 54 C121 21 117 76 86 82 C126 117 74 127 80 91 C43 130 39 77 72 82 C27 63 56 40 80 75Z',
    hoop:'M43 80 A39 39 0 1 1 121 80 A39 39 0 1 1 43 80Z M57 80 A25 25 0 1 0 107 80 A25 25 0 1 0 57 80Z',
    pendulum:'M36 49 H124 V109 H36Z M80 54 L96 91 A11 11 0 1 1 79 86Z',
    shuttle:'M29 87 Q43 63 64 62 L96 65 Q118 66 134 85 Q118 105 95 103 L61 102 Q42 101 29 87Z',
    pad:'M34 93 Q26 76 45 72 L111 68 Q129 68 133 86 L122 106 L53 111Z',
    kite:'M80 34 L121 67 L80 112 L43 67Z M80 34 V112 Q104 123 97 135',
    theater:'M31 48 H128 V111 H31Z M40 55 Q79 88 119 55 L117 103 H41Z',
    mouse:'M41 95 Q42 64 76 66 Q92 45 105 64 Q116 66 127 84 L120 96 Q99 113 63 106 Q30 119 24 100',
    tower:'M48 104 H115 V117 H48Z M57 78 H108 V105 H57Z M65 49 H100 V80 H65Z M72 38 H93 V50 H72Z',
    maze:'M31 62 H128 V111 H31Z M43 72 H109 V83 H65 V97 H117',
    bobbin:'M52 50 H108 L112 61 L99 71 V94 L111 104 L108 115 H52 L48 104 L62 94 V70 L48 61Z',
    track:'M36 82 Q42 54 92 52 Q130 53 128 82 Q122 109 72 111 Q36 110 36 82Z M55 80 Q57 67 92 67 Q112 66 110 82 Q100 98 70 96 Q55 96 55 80Z',
    ball:'M43 79 A37 37 0 1 1 117 79 A37 37 0 1 1 43 79Z M48 60 Q80 110 111 60 M48 99 Q80 50 111 99',
    sash:'M45 103 L99 49 L122 61 L70 112 L48 117Z',
    neckerchief:'M32 56 Q81 72 129 53 L114 78 L80 112 L55 81Z',
    collar:'M32 75 Q80 97 128 75 L124 92 Q80 118 35 94Z M71 97 H91 V109 H71Z',
    bow:'M37 58 Q62 61 77 76 Q96 60 122 56 L120 103 Q95 94 80 84 Q61 97 36 102Z',
    mantle:'M55 51 Q82 61 108 50 L126 107 Q84 127 35 106Z M69 53 Q81 71 94 54',
    cap:'M43 81 Q47 47 87 47 Q115 53 118 81 L132 91 Q109 105 43 94Z',
    badge:'M79 48 L111 65 L107 98 L79 119 L48 99 L44 65Z',
    brooch:'M44 81 L66 52 L93 52 L117 81 L95 110 L65 110Z M66 52 L95 110 M93 52 L65 110',
    kerchief:'M45 52 L120 66 L72 117 L39 82Z',
    crown:'M37 61 L62 78 L80 48 L97 78 L123 60 L115 107 H46Z',
    medallion:'M72 44 H89 L93 64 A27 27 0 1 1 66 64Z',
    hood:'M45 102 Q36 59 68 46 Q109 32 120 77 L117 104 Q90 123 45 102Z M63 92 Q55 62 82 59 Q107 62 105 91Z',
    cuff:'M48 61 L115 61 L107 101 Q82 120 53 100Z M51 74 Q81 90 112 74',
    harness:'M43 57 L65 50 L79 65 L94 51 L120 58 L111 111 L90 100 L76 110 L54 111Z',
    rosette:'M80 45 L91 61 L109 61 L108 78 L119 92 L99 101 L94 118 L80 108 L61 118 L58 102 L40 94 L51 78 L50 59 L69 62Z',
    bracer:'M45 62 L100 51 L119 72 L104 112 L52 106 L40 85Z',
    blade:'M40 108 L61 87 L56 77 L68 70 L77 80 L110 42 L126 47 L107 77 L89 95 L101 105 L87 117 L76 106 L49 120Z',
    charm:'M76 40 Q92 42 93 58 L108 82 L95 109 L65 109 L51 82 L68 59 Q67 49 76 40Z',
    mitt:'M48 110 L42 76 Q39 56 54 59 L63 73 L68 48 Q75 44 80 54 L82 68 L90 49 Q104 47 105 64 L111 69 Q126 66 124 86 L114 109Z',
    vest:'M53 49 L68 52 L80 62 L93 52 L108 49 L122 68 L105 82 L110 109 H49 L55 83 L39 69Z',
    stone:'M44 103 L36 83 L55 49 L109 45 L129 80 L115 103 L79 116Z',
    shield:'M33 55 Q80 69 126 55 L119 89 Q105 115 79 127 Q51 113 40 91Z',
    sigil:'M80 39 L92 64 L122 66 L104 86 L107 114 L80 101 L54 115 L57 86 L38 66 L68 64Z',
    baton:'M37 109 L51 117 L120 52 L112 40 L95 41 L84 51 L90 60Z',
    shell:'M37 104 Q34 67 57 53 Q98 37 121 71 L128 103 Q80 125 37 104Z',
    token:'M41 82 L53 55 L102 47 L124 68 L123 98 L103 115 L54 111Z',
    gauntlet:'M49 105 L46 86 L33 77 L37 66 L50 69 L54 56 L71 51 L84 58 L105 53 L120 65 L113 101 L101 116Z',
    buckler:'M41 80 Q43 46 78 46 Q117 48 122 80 Q116 111 81 119 Q42 110 41 80Z M80 54 V111 M49 80 H111',
    seal:'M45 84 L55 55 L80 44 L110 57 L116 83 L103 113 L63 112Z',
    tin:'M40 76 Q44 61 80 59 Q112 60 120 73 L118 102 Q79 122 40 102Z',
    tonic:'M69 43 H91 V56 L107 72 L106 108 Q79 119 54 108 L53 72 L69 56Z',
    poultice:'M37 84 L54 53 L110 61 L124 92 L110 109 L52 108Z M48 75 L114 89',
    compress:'M39 65 L105 55 L122 82 L114 107 L49 113 L37 94Z M47 70 L111 91 L52 108',
    infusion:'M42 67 H97 L105 101 Q78 122 48 102Z M97 75 L127 67 L117 94 L102 102Z',
    salve:'M47 71 H114 L111 106 Q78 119 47 106Z M42 59 H119 V72 H42Z',
    liniment:'M63 46 H97 L99 61 L112 91 L105 111 H55 L48 90 L62 62Z',
    elixir:'M69 40 H92 V57 L119 93 L103 112 H58 L41 93 L69 57Z',
    vapor:'M40 104 Q51 85 69 91 Q92 77 123 101 L113 113 H52Z M63 87 Q47 65 75 61 Q99 59 88 43 Q119 56 104 78',
    jar:'M52 61 H109 L112 101 Q82 117 48 101Z M47 48 H114 V62 H47Z',
    draught:'M62 45 H99 L94 66 L115 81 L103 108 H57 L45 82 L66 66Z',
    patch:'M35 77 L110 56 Q123 60 126 78 L57 108 Q44 109 35 98Z',
    rub:'M47 73 L94 47 L111 58 L107 101 L57 113 L42 95Z',
    tea:'M48 67 Q87 57 113 67 L105 102 Q82 118 57 104Z M113 71 Q134 72 124 91 L109 95',
    syrup:'M65 41 H96 L99 66 L109 85 L105 112 H55 L51 83 L63 65Z',
    knuckle:'M37 93 L47 63 Q54 51 61 61 L69 53 L78 58 L88 52 L96 58 L109 57 L123 74 L116 103 L101 113 L54 107Z',
    fan:'M35 62 Q77 27 126 55 L117 79 L87 92 L85 117 H75 L70 92 L43 83Z M58 52 L77 91 M79 45 L80 92 M101 48 L85 92',
    bell:'M48 97 L58 79 Q58 57 76 53 L76 44 L85 43 L87 53 Q105 58 106 80 L117 98Z M72 101 Q81 119 91 101',
    rod:'M41 106 L53 117 L112 64 L121 61 L127 46 L111 41 L97 48 L96 61Z',
    paddle:'M39 113 L49 119 L85 84 Q118 89 122 65 Q128 45 108 41 Q87 39 76 55 Q69 68 75 77Z',
    club:'M39 112 L49 120 L86 88 Q111 88 123 60 L116 45 L96 45 L79 59 L75 78Z',
    mallet:'M40 112 L50 120 L96 73 L106 83 L127 65 L103 41 L80 57 L88 68Z',
    flail:'M39 111 L51 121 L87 87 L76 77Z M84 84 L93 75 L96 60 L108 62 L116 55 L123 65 L137 67 L127 78 L126 91 L115 87 L106 92 L104 80 L94 80Z',
    wand:'M42 114 L49 120 L106 67 L120 64 L121 53 L132 43 L116 44 L107 33 L105 46 L92 52 L103 58Z',
    whip:'M37 111 L48 118 L73 96 L61 84Z M68 91 Q106 69 119 83 Q146 56 111 49 Q92 45 82 61',
    cane:'M39 113 L48 119 L106 64 Q122 48 113 42 Q97 36 87 51 L95 56 Q105 44 106 51 L95 64Z',
    saber:'M38 110 L48 120 L69 99 L79 109 L88 99 L79 89 Q107 88 128 44 Q103 57 66 80 L62 87 L54 80 L46 89 L55 96Z',
    staff:'M35 115 L44 121 L105 65 L120 65 L128 50 L120 37 L104 39 L96 53 L99 62Z',
    hook:'M40 114 L49 121 L99 78 Q133 77 134 51 L117 40 L103 46 L99 55 L112 57 L114 51 L121 54 Q119 66 98 65Z',
    needle:'M37 117 L45 122 L120 54 L127 37 L107 47Z',
    ram:'M39 108 L52 120 L98 83 L117 85 L130 66 L111 45 L92 53 L89 69Z',
    fork:'M38 114 L49 122 L95 80 L116 72 L129 54 L121 47 L104 64 L98 59 L114 43 L106 36 L88 54 L86 72Z',
    breastplate:'M43 57 L61 46 L79 58 L101 46 L118 57 L112 94 L98 116 H63 L47 95Z M54 72 Q81 87 108 72 M62 105 L99 105',
    carapace:'M42 105 Q42 56 80 46 Q116 52 121 103 L101 116 H60Z M81 51 V111 M51 74 L111 76 M48 92 H116',
    suit:'M49 50 L66 45 L79 56 L95 45 L112 49 L130 71 L115 85 L108 78 L104 110 L79 117 L55 108 L52 79 L42 87 L29 72Z',
    cuirass:'M44 58 L67 48 L79 57 L93 48 L117 56 L109 91 L97 111 L79 117 L58 105Z',
    guard:'M43 65 L59 48 L100 46 L122 65 L110 110 H49Z M49 68 H116',
    wrap:'M36 67 L111 56 L125 80 L115 101 L49 111 L35 92Z M42 73 L117 87 M44 94 L114 102',
    pads:'M30 70 L47 56 L71 67 L68 105 L45 114 L32 103Z M83 68 L108 54 L129 70 L125 105 L101 113 L84 101Z',
    brigandine:'M42 61 L64 48 L81 57 L98 48 L120 61 L111 109 H50Z M49 76 H115 M52 91 H110',
    jacket:'M51 48 L72 56 L83 64 L93 55 L111 49 L129 84 L114 97 L104 82 L100 113 H59 L55 83 L44 97 L31 84Z M80 64 V113',
    panoply:'M37 68 L56 47 L79 57 L102 47 L124 68 L110 92 L103 114 H56 L50 91Z',
    coating:'M45 59 L78 48 L115 56 L129 78 L117 109 L83 120 L46 113 L34 88Z',
    coat:'M46 49 L66 48 L80 67 L96 49 L115 52 L125 103 L100 117 L81 110 L62 117 L35 102Z',
    prism:'M79 38 L108 59 L115 97 L79 122 L49 97 L51 58Z M79 38 V122 M51 58 L79 75 L108 59 M49 97 L79 75 L115 97',
    hourglass:'M46 45 H114 V55 H108 Q107 70 90 82 Q110 95 111 107 L115 115 H46 L50 106 Q54 93 70 82 Q51 72 51 55 H46Z',
    lens:'M81 40 A35 35 0 1 1 58 103 L42 123 L32 117 L50 96 A35 35 0 0 1 81 40Z M81 54 A21 21 0 1 0 81 96 A21 21 0 1 0 81 54Z',
    mapstone:'M35 59 L62 53 L90 64 L122 52 L126 102 L98 112 L66 103 L38 114Z M62 53 L66 103 M90 64 L98 112',
    lodestone:'M44 61 Q80 33 117 60 L116 93 L95 110 L86 97 L99 82 L99 69 Q80 61 62 69 L63 83 L73 98 L63 110 L43 94Z',
    effigy:'M81 44 L102 60 L99 75 L112 84 L106 104 H54 L48 84 L64 74 L62 60Z M40 105 H121 V114 H40Z',
    dial:'M43 85 A38 35 0 1 1 119 85 A38 35 0 1 1 43 85Z M82 83 L103 61 M81 61 V55 M60 84 H54 M104 85 H111 M80 105 V113',
    tablet:'M41 57 Q78 46 116 55 L118 104 Q80 118 41 105Z M53 68 H106 M54 81 H97 M53 94 H91',
    bead:'M53 83 A28 28 0 1 1 109 83 A28 28 0 1 1 53 83Z M75 62 Q84 56 92 65 L88 99 Q79 107 70 99Z',
    idol:'M57 54 L79 43 L103 55 L110 103 L121 114 H39 L50 102Z M67 70 H94 L92 91 H69Z',
    totem:'M67 43 L94 43 L105 55 L98 75 L108 84 L102 110 H59 L55 87 L65 76 L55 59Z',
    compass:'M80 45 A36 36 0 1 1 80 117 A36 36 0 1 1 80 45Z M101 62 L87 92 L60 101 L74 73Z',
    ring:'M80 49 A34 34 0 1 1 80 117 A34 34 0 1 1 80 49Z M80 65 A18 18 0 1 0 80 101 A18 18 0 1 0 80 65Z',
    coil:'M39 88 Q41 53 78 57 Q113 53 121 77 Q129 109 85 113 Q46 111 48 87 Q50 66 81 68 Q104 70 105 85 Q103 100 80 100 Q63 98 67 86 Q70 78 88 81',
    knot:'M30 89 Q50 54 80 76 Q113 49 128 85 Q111 115 81 92 Q49 114 30 89Z M80 76 Q57 47 51 57 M81 92 Q98 119 109 110',
    loop:'M43 84 Q42 56 80 50 Q119 57 119 86 Q118 112 79 113 Q43 110 43 84Z M56 85 Q58 67 81 65 Q108 67 105 85 Q103 103 79 100 Q57 102 56 85Z',
    timber:'M32 83 L103 53 L126 71 L125 96 L53 120 L32 101Z M32 83 L53 95 L126 71',
    spool:'M53 47 H107 L114 58 L101 68 V95 L114 103 L107 117 H53 L47 103 L61 95 V69 L47 58Z M61 76 H100 M61 88 H100',
    offcut:'M38 61 L112 49 L124 90 L108 108 L46 113 L35 96Z',
    foil:'M30 77 L102 50 L131 72 L119 101 L49 117Z M31 77 L79 85 L103 51 M79 85 L118 101',
    rivet:'M43 61 L71 49 L100 55 L103 71 L115 82 L112 106 L81 116 L63 104 L59 81 L42 76Z',
    fiber:'M25 93 Q62 51 130 56 M31 103 Q66 64 131 61 M39 109 Q71 73 128 70 M50 111 Q79 82 124 78',
    clay:'M39 89 Q38 67 58 67 Q72 43 100 55 Q129 60 123 89 L108 109 L57 112Z',
    button:'M43 83 A36 32 0 1 1 115 83 A36 32 0 1 1 43 83Z M70 74 H73 M88 74 H91 M70 90 H73 M88 90 H91',
    cord:'M30 104 Q29 86 59 83 Q83 81 78 62 Q76 45 97 53 Q131 64 126 91 Q120 110 88 112 Q64 108 70 97 Q75 88 96 95',
    leaf:'M37 108 Q33 71 67 58 Q106 44 128 50 Q114 94 82 106 Q60 117 37 108Z M39 109 Q73 91 112 58',
    thread:'M33 99 Q48 65 80 70 Q112 75 113 55 Q119 43 131 48 M29 107 Q60 87 80 81 Q110 93 126 62',
    dowel:'M37 99 L107 54 Q126 56 126 72 L61 116 Q41 118 37 99Z M107 54 Q101 70 126 72',
    cog:'M74 45 L87 45 L92 55 L107 58 L117 54 L124 66 L119 77 L123 89 L133 95 L125 107 L112 105 L101 112 L98 121 H81 L77 112 L62 110 L51 115 L42 104 L46 93 L39 83 L29 80 L35 67 L49 67 L57 58 L60 46Z',
    flake:'M80 42 V119 M44 62 L117 100 M43 102 L117 61 M63 48 L80 65 L98 48 M62 114 L80 99 L98 115',
    hammock:'M35 46 V116 M125 46 V116 M35 62 Q82 134 125 61 Q113 103 79 111 Q48 104 35 62Z',
    nook:'M39 113 V72 Q39 42 79 39 Q121 41 121 70 V113Z M53 105 V73 Q54 55 80 54 Q105 54 107 73 V104Z',
    screen:'M34 56 L62 47 L85 58 L112 48 L127 61 V109 L109 104 L84 116 L59 107 L34 115Z M62 47 L59 107 M85 58 L84 116',
    bench:'M33 72 H128 V92 H33Z M42 91 H52 V117 H42Z M108 91 H119 V117 H108Z M37 52 H122 V71 H37Z',
    mat:'M31 93 L59 60 L126 76 L137 95 L104 111 L42 110Z',
    basket:'M39 73 Q42 105 56 112 H111 Q122 97 124 73Z M53 74 Q51 43 80 43 Q108 43 108 74',
    lounger:'M34 102 L48 83 L92 83 L106 52 Q124 44 129 62 L115 104 L52 113Z',
    washstand:'M36 62 H124 L118 80 H42Z M50 80 H61 V113 H50Z M101 80 H112 V113 H101Z M64 57 Q80 38 97 56',
    cushion:'M39 81 Q45 66 79 68 Q119 62 128 84 L121 104 Q81 118 39 101Z',
    chair:'M54 48 H106 L112 86 L123 90 L117 102 H44 L38 91 L51 86Z M55 102 V117 M108 104 V117',
    shelf:'M44 45 H55 V115 H44Z M106 45 H118 V115 H106Z M55 59 H108 V68 H55Z M53 91 H107 V100 H53Z',
    tent:'M32 109 L80 42 L129 109Z M59 109 L80 73 L101 109Z',
    tunnel:'M37 100 V73 Q42 51 73 51 L106 55 Q124 56 127 75 V100 Q101 120 64 110Z M89 84 A16 20 0 1 0 121 84 A16 20 0 1 0 89 84Z',
    cot:'M33 76 L108 70 L128 82 V101 L52 109 L33 96Z M38 98 V117 M124 100 V114 M53 108 V121',
    lamp:'M43 115 H118 V109 L89 102 V77 L111 71 L100 42 H63 L49 71 L74 77 V102Z',
    deck:'M39 94 L61 57 L128 69 L111 108 L53 114Z M55 83 L111 91 M61 72 L118 80',
    postcard:'M34 59 L118 51 L129 101 L43 111Z M45 66 L76 69 L79 92 L49 96Z',
    cameo:'M78 44 Q117 46 119 81 Q117 118 79 120 Q42 116 43 82 Q44 49 78 44Z M77 60 Q98 58 100 77 L88 84 L92 103 H63 L73 84Z',
    pennant:'M41 47 H50 V119 H41Z M50 51 L124 62 L51 87Z',
    etching:'M36 48 L116 47 L125 107 L45 115Z M50 89 L67 67 L86 92 L106 64 L111 96Z',
    print:'M38 53 H121 L115 112 H42Z M57 70 L101 63 L103 91 L56 94Z',
    diorama:'M32 98 L47 112 H122 L132 97 L115 89 L112 65 L94 54 L75 74 L60 52 L43 69 L44 91Z',
    album:'M44 47 L113 48 L120 111 L49 116Z M57 62 H100 V96 H57Z M52 49 V112',
    portrait:'M42 47 H118 V115 H42Z M53 57 H107 V105 H53Z M65 96 Q57 82 71 78 L67 65 L79 71 L91 65 L88 78 Q101 85 93 96Z',
    scroll:'M43 53 Q38 42 55 43 L117 47 Q129 51 119 62 L108 65 L107 110 L43 111 Q32 103 45 98Z',
    figure:'M57 87 L60 62 L55 48 L74 53 L79 42 L94 52 L104 49 L102 70 L108 92 L100 105 H60Z M45 106 H114 V117 H45Z',
    rubbing:'M36 58 L118 49 L126 105 L45 116Z M54 71 L105 66 M55 82 L108 76 M58 93 L110 86 M62 102 L112 97',
    map:'M34 62 L62 52 L94 60 L121 50 L117 103 L91 116 L61 105 L36 113Z M53 91 Q68 67 79 91 Q92 105 109 75',
    lithograph:'M41 51 L118 47 L123 106 L45 114Z M51 93 L72 63 L84 79 L107 65 L107 94Z',
    blueprint:'M34 48 L119 52 L125 107 L39 113Z M53 91 L80 61 L108 88 M71 98 H101 M65 73 H100',
    letter:'M35 62 H124 V106 H35Z M35 62 L80 91 L124 62 M36 107 L63 80 M123 107 L97 80',
    gift:'M42 72 H118 V112 H42Z M36 59 H125 V74 H36Z M80 59 V111 M79 58 Q57 30 57 49 Q61 58 79 58 Q104 29 104 48 Q100 58 79 58Z',
    bouquet:'M48 57 Q51 43 62 56 Q70 39 84 53 Q91 35 105 52 Q123 45 118 65 L98 83 L86 118 H69 L61 79Z'
  };
  const themedTiers={Low:0,Mid:1,High:2};
  const districts=['Sunleaf','Frostbell','Moonwharf','Thistlebrook','Lantern Quay','Mossglass','Stormfern','Emberbank','Glimmerfen','Rafterhill','Copper Orchard','Starling Hollow','Honeybrook','Dewspire'];
  const hues=[33,196,235,290,42,150,218,16,174,262,25,321,51,99];
  const slots=['weapon','armor','relic','wearable'];
  const indexOfForm=new Map();
  for(const [category,designs] of Object.entries(forms)){
    indexOfForm.set(category,Object.entries(designs).sort(([a],[b])=>b.length-a.length));
  }
  function hash(value){
    let n=2166136261;
    for(const ch of String(value))n=Math.imul(n^ch.charCodeAt(0),16777619);
    return n>>>0;
  }
  const color=(h,s,l)=>'hsl('+h+' '+s+'% '+l+'%)';
  function design(item){
    const n=hash(item.id), tier=themedTiers[item.tier]||0;
    const district=districts.findIndex(name=>item.name.startsWith(name+' '));
    const form=indexOfForm.get(item.category)?.find(([label])=>item.name.endsWith(' '+label));
    const shape=item.artForm||legacy[item.id]||form?.[1]||'token';
    const aura=tier===2&&item.slot==='weapon'&&Boolean(item.achievement);
    const finish=tier===2?(item.achievement?3:2):tier;
    const hue=((district>=0?hues[district]:n%360)+(n%17)-8+360)%360;
    return {n,shape,tier,aura,finish,hue,district,color:color(hue,87,69),accent:color((hue+74+n%31)%360,93,76)};
  }
  const books=new Set(Object.values(forms.Book));
  const decorated=new Set(['postcard','portrait','etching','print','album','map','lithograph','rubbing','blueprint','letter']);
  const hollow=new Set(['ribbon','coil','fiber','cord','thread','leaf','flake','whip']);
  const foodFill=new Set(['bowl','plate','stew']);
  const stamps=[
    'M-8 4 Q-7 -8 8 -8 Q8 6 -7 8Z M-6 6 L4 -4',
    'M0 -10 V10 M-9 -5 L9 5 M-9 5 L9 -5',
    'M5 -8 Q-10 -9 -9 3 Q-5 11 6 7 Q-4 5 -2 -2Z',
    'M0 9 V-4 M0 -4 L-6 -8 M0 -2 L6 -7 M-4 2 L4 2',
    'M-6 -7 H6 L8 7 H-8Z M-2 -7 V-10 H3 V-7',
    'M-8 6 Q-9 1 -5 -1 Q-6 -7 0 -7 Q7 -7 6 -2 Q11 0 9 6Z',
    'M8 -8 L-3 1 H3 L-7 10 L-4 2 H-8Z',
    'M-7 6 Q-9 1 -3 -4 Q-2 2 1 0 Q6 -1 4 -8 Q13 4 5 8Z',
    'M0 -10 L4 -2 L10 0 L4 3 L0 10 L-4 3 L-10 0 L-4 -2Z',
    'M-9 8 L-8 2 L8 -8 M-5 8 L6 0 L8 -8 M-5 -6 H3',
    'M-9 6 L-2 7 L7 2 M0 7 V-6 M0 -2 L-8 -7 M-1 1 L8 -6',
    'M-9 -4 Q-2 -5 0 1 Q4 -6 9 -5 L3 6 H-3Z',
    'M0 -8 L7 -4 L7 4 L0 8 L-7 4 L-7 -4Z M-3 -2 L3 2',
    'M0 -9 Q9 -1 6 5 Q1 12 -6 6 Q-10 1 0 -9Z'
  ];
  let drawCount=0;
  function markup(item){
    const d=design(item),k='paw-item-'+(++drawCount);
    const {n,shape,hue,finish}=d;
    const x=55+(n%49),y=67+((n>>>8)%20);
    const rotate=(n%21)-10, lean=((n>>>5)%7)-3, stretch=(.94+(n%13)*.012).toFixed(3);
    const edge=color(hue,42,23),mid=color(hue,65,finish?49:42),bloom=color(hue,finish?96:63,finish?86:69);
    const type=geometry[shape]||geometry.token;
    const stroke=(path,fill='none')=>'<path d="'+path+'" fill="'+fill+'" stroke="'+edge+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill-rule="evenodd"/>';
    const ellipse=(cx,cy,rx,ry,fill)=>'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="'+fill+'"/>';
    const diamond=(cx,cy,size,fill)=>'<path d="M'+cx+' '+(cy-size)+' L'+(cx+size*.68)+' '+cy+' L'+cx+' '+(cy+size)+' L'+(cx-size*.68)+' '+cy+'Z" fill="'+fill+'"/>';
    const radial=(cx,cy,arms,size,fill)=>Array.from({length:arms},(_,i)=>{
      const a=i/arms*Math.PI*2;
      return ellipse((cx+Math.cos(a)*size).toFixed(1),(cy+Math.sin(a)*size).toFixed(1),2+(n%3),2.1,fill);
    }).join('');
    const book=books.has(shape);
    const backdrop=finish>=2?'<circle cx="80" cy="77" r="'+(51+n%9)+'" fill="none" stroke="'+d.color+'" opacity=".37" stroke-dasharray="'+(3+n%7)+' '+(6+n%11)+'"/>'+
      '<circle cx="80" cy="77" r="61" fill="none" stroke="'+d.accent+'" opacity=".22"/>'+
      radial(80,76,6+n%5,56,d.accent):finish===1?'<circle cx="80" cy="78" r="57" fill="none" stroke="'+d.color+'" opacity=".27"/>':'';
    const bookShapes={
      almanac:'M71 65 Q92 49 103 64 Q96 86 70 91Z',
      balance:'M69 75 H104 M86 60 V96 M74 73 L68 90 H79Z M98 73 L92 90 H105Z',
      journal:'M69 62 L102 64 M69 77 L104 79 M70 91 L95 92',
      handbook:'M70 70 L87 59 L105 70 V91 H71Z',
      atlas:'M69 69 L80 64 L91 68 L102 62 L105 89 L93 94 L81 88 L71 94Z',
      primer:'M87 62 L100 69 L102 86 L89 95 L73 85 L74 70Z',
      diary:'M85 96 C58 77 77 57 86 70 C98 54 115 75 85 96Z',
      notes:'M71 65 H101 M71 77 H92 M72 89 H104',
      songs:'M78 88 V65 L100 62 V84 M78 87 Q66 81 69 92 Q75 97 78 87 M100 83 Q90 77 90 88 Q98 93 100 83',
      ledger:'M69 62 H105 V97 H69Z M81 62 V96 M69 73 H105 M69 84 H105',
      manual:'M73 66 L78 61 L86 70 L96 63 L100 69 L90 80 L100 91 L95 97 L84 86 L74 95 L68 88 L77 79Z',
      quiet:'M91 63 Q71 65 73 84 Q78 97 99 88 Q82 90 83 76Z',
      codex:'M84 58 L105 78 L84 98 L66 78Z M83 66 L96 78 L83 91 L74 78Z',
      courage:'M69 65 L87 58 L104 65 L100 87 L87 98 L73 87Z',
      strategy:'M69 63 H103 V96 H69Z M78 63 V96 M95 63 V96 M69 74 H103 M69 85 H103'
    };
    const page=book?stroke('M43 49 L111 43 L120 52 L120 108 L51 118 L42 108Z','url(#'+k+'m)')+
      '<path d="M54 53 L55 111 L117 101" stroke="#fff0cc" stroke-width="3" fill="none"/>'+
      '<path d="'+bookShapes[shape]+'" fill="none" stroke="'+bloom+'" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>':
      stroke(type,hollow.has(shape)?'none':'url(#'+k+'m)');
    const contents=(item.category==='Food'||item.category==='Remedy')&&foodFill.has(shape)?ellipse(80,shape==='stew'?68:76,45,12,color(hue,56,27))+
      Array.from({length:6},(_,i)=>ellipse(48+i*12,74+((n>>i)&7)-4,5+(i%3),3+(n>>i&3),i%2?bloom:d.accent)).join(''):'';
    const pattern=decorated.has(shape)?'<path d="M48 96 Q70 83 89 97 Q111 93 115 76" fill="none" stroke="'+bloom+'" stroke-width="2.4" opacity=".8"/>':'';
    const emblem='<path d="'+stamps[d.district>=0?d.district:n%stamps.length]+'" transform="translate('+x+' '+y+') scale('+(.6+finish*.10)+')" fill="none" stroke="'+bloom+'" stroke-width="1.8" opacity=".79" stroke-linecap="round" stroke-linejoin="round"/>';
    const trim=finish>=1?radial(x,y,3+n%4,8,finish>1?d.accent:bloom):'';
    const centerProng=finish>=2?diamond(x,y,6+n%5,bloom):'';
    const surfaces=ellipse(80,117,43+n%8,8,'#100e26')+
      '<g transform="translate(80 80) rotate('+rotate+') skewX('+lean+') scale('+stretch+' 1) translate(-80 -80)">'+page+contents+pattern+trim+centerProng+emblem+'</g>';
    const framing='<ellipse cx="80" cy="79" rx="76" ry="63" fill="url(#'+k+'b)"/>'+backdrop+
      Array.from({length:finish?finish*3:1},(_,i)=>diamond(21+((n>>>i)+i*23)%118,23+((n>>>((i+5)%16))+i*11)%99,finish?2+i%3:2,d.color)).join('');
    return '<svg viewBox="0 0 160 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>'+
      '<linearGradient id="'+k+'m" x1="16%" y1="7%" x2="92%" y2="93%"><stop stop-color="'+bloom+'"/><stop offset=".38" stop-color="'+mid+'"/><stop offset=".68" stop-color="'+color(hue,63,34)+'"/><stop offset="1" stop-color="'+edge+'"/></linearGradient>'+
      '<radialGradient id="'+k+'b"><stop stop-color="'+d.color+'" stop-opacity="'+(.11+finish*.075)+'"/><stop offset="1" stop-color="'+d.color+'" stop-opacity="0"/></radialGradient></defs>'+
      framing+surfaces+'</svg>';
  }
  function mount(node,item){
    if(!node||!item)return;
    node.dataset.itemArt=item.id;
    node.dataset.itemFinish=String(design(item).finish);
    node.innerHTML=markup(item);
  }
  function equipped(market,progress,cat,match){
    if(!market||!cat)return [];
    if(Array.isArray(match?.gearArt)){
      return match.gearArt.slice(0,slots.length).map(id=>market.byId.get(id)).filter(item=>item&&slots.includes(item.slot));
    }
    return slots.map(slot=>market.worn(progress,cat,slot)).filter(Boolean);
  }
  function effect(item){
    const d=design(item),n=d.n;
    const rays=4+n%8, span=29+(n>>>7)%17, tilt=n%72-36;
    let marks='';
    for(let i=0;i<rays;i++){
      const angle=(i*360/rays+tilt)*Math.PI/180;
      const x=80+Math.cos(angle)*span,y=75+Math.sin(angle)*span;
      const size=3+((n>>>i)%9);
      marks+='<path d="M'+x.toFixed(1)+' '+(y-size).toFixed(1)+' l'+(size*.55).toFixed(1)+' '+size+' l-'+(size*.55).toFixed(1)+' '+size+' l-'+(size*.55).toFixed(1)+' -'+size+'Z" fill="'+(i%2?d.accent:d.color)+'"/>';
    }
    const line=item.slot==='weapon'
      ?'<path d="'+["M23 106 Q89 32 135 51 M37 122 Q97 52 132 61","M30 40 Q123 42 132 92 M41 47 Q120 54 124 99 M58 54 Q110 66 113 104","M41 102 L69 76 L58 60 L100 52 L126 31 M46 109 L99 79 L112 83 L120 70","M82 114 Q42 111 37 73 Q38 38 82 34 Q129 37 135 80 Q128 112 98 117","M31 70 Q54 115 85 104 Q129 87 120 56 Q110 33 93 45 M38 73 Q63 101 90 91","M36 88 L69 74 L64 96 L103 64 L118 74 L132 47"][n%6]+'" stroke="'+d.color+'" stroke-width="'+(3+n%3)+'" fill="none" stroke-linecap="round"/>'
      :item.slot==='armor'||item.slot==='wearable'
        ?'<path d="M80 32 L120 49 L113 94 L80 118 L47 94 L40 49Z" stroke="'+d.color+'" stroke-width="4" fill="none" stroke-dasharray="'+(3+n%17)+' 7"/>'
        :'<ellipse cx="80" cy="75" rx="50" ry="30" transform="rotate('+tilt+' 80 75)" stroke="'+d.color+'" stroke-width="3" fill="none" stroke-dasharray="'+(3+n%13)+' 6"/>';
    return '<svg viewBox="0 0 160 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+line+marks+'</svg>';
  }
  function aura(item){
    const {n,color:main,accent}=design(item);
    const dots=Array.from({length:7+n%6},(_,i)=>{
      const angle=(i*6.283)/(7+n%6)+(n%90)/90;
      const x=(80+Math.cos(angle)*62).toFixed(1),y=(78+Math.sin(angle)*57).toFixed(1);
      return '<circle cx="'+x+'" cy="'+y+'" r="'+(1.4+((n>>>i)%4))+'" fill="'+(i%2?accent:main)+'"/>';
    }).join('');
    return '<svg viewBox="0 0 160 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
      '<ellipse cx="80" cy="79" rx="64" ry="60" fill="'+main+'" fill-opacity=".13" stroke="'+main+'" stroke-opacity=".78" stroke-width="3" stroke-dasharray="'+(4+n%21)+' '+(5+(n>>>5)%9)+'"/>'+
      '<ellipse cx="80" cy="81" rx="69" ry="64" fill="none" stroke="'+accent+'" stroke-opacity=".49" stroke-width="2"/>'+dots+'</svg>';
  }
  const staples={
    'Cottage Snack':'snack','Crystal Shard':'prism','Pawprint Rug':'mat',
    'Garden Crunch':'flakes','Clockwork Mouse':'mouse','Paw Emblem Tee':'jacket',
    'Chocolate Paw':'rosette','Moonberry Smoothie':'cup','Crystal Shield':'shield',
    'Glowbell Bouquet':'bouquet','Festival Cape':'mantle','Ribbon Gift Box':'gift',
    'Glowbell Seeds':'bead','Velvet Cat Bed':'lounger','Honey Paw Roll':'roll',
    'Whisker Collector Card':'portrait','Luna Collector Card':'postcard','Bolt Collector Card':'cameo'
  };
  function staple(name,id){
    return {id:'shop-staple-'+(id||name),name,artForm:staples[name]||'snack'};
  }
  window.PawtopiaItemArt=Object.freeze({design,markup,mount,equipped,effect,aura,staple});
})();
