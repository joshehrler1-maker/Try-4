// Each row defines an opening, a course mechanic and a distinct finish.
window.pawtopiaCourses = [
 ['Ember Foundry','Whisker','Stoke the cold forge','Ring the evacuation bell','stomp','lift','vent'],
 ['Moonlit Library','Luna','Follow the runaway book','Return the moon atlas','slide','shelf','sentry'],
 ['Coral Courier','Luna','Launch from the tide pool','Deliver the pearl to the lighthouse','swim','current','eel'],
 ['Clocktower Relay','Bolt','Wind the stopped town clock','Set the rooftop clock to sunrise','dash','belt','drone'],
 ['Seed Garden','Ivy','Wake the seed lantern','Plant the last seed on the summit','vine','spring','beetle'],
 ['Waterfall Climb','Frost','Cross the spray bridge','Free the frozen waterfall','glide','lift','drone'],
 ['Lantern Festival','Melody','Light the first parade lantern','Launch the sky lantern','throw','spring','sentry'],
 ['Crystal Polarity','Bolt','Power up the mine cart','Reconnect the opposite crystal cores','flip','belt','drone'],
 ['Stage Beat','Melody','Play the opening note','Play the encore chord','pulse','spring','beetle'],
 ['Quarry Rescue','Stone','Enter the quarry elevator','Lift the final rescue cage','grapple','lift','sentry'],
 ['Sunset Wind Sail','Whisker','Catch the first updraft','Land on the windmill deck','glide','current','eel'],
 ['Cloud City','Luna','Board the cloud ferry','Open the sky observatory','double','spring','drone'],
 ['Thunder Harbor','Frost','Launch from the breakwater','Ground the thunder conductor','shield','belt','vent'],
 ['Autumn Trail','Spark','Follow the feather trail','Photograph the migrating flock','photo','shelf','eel'],
 ['Inverted Observatory','Shadow','Step into the reversed dome','Align the star projector','flip','lift','beetle'],
 ['Bamboo Village','Ivy','Open the bamboo garden gate','Restore the village lantern tree','vine','shelf','eel'],
 ['Steamworks','Bolt','Release pressure from the intake valve','Shut down the runaway boiler','pulse','belt','vent'],
 ['Snow Village','Frost','Take the trail from the hearth','Relight the village furnace','shield','spring','sentry'],
 ['Canyon Crossing','Stone','Enter the canyon from the rope bridge','Raise the drawbridge','grapple','current','vent'],
 ['Submarine Dock','Spark','Dive from the research pier','Surface inside the submarine dock','swim','lift','sentry'],
 ['Neon Circuit','Shadow','Break out of the arcade cabinet','Cross the photo-finish beam','dash','spring','beetle'],
 ['Marble Temple','Luna','Open the lower temple seal','Turn the final marble lock','double','shelf','vent'],
 ['Swamp Ferry','Ivy','Leave the reed landing','Moor the ferry at the firefly pier','bubble','current','beetle'],
 ['Sunflower Flight','Spark','Take flight from the sunflower hill','Pollinate the last giant bloom','bubble','spring','drone'],
 ['Starship Cargo','Whisker','Launch from the cargo airlock','Dock the rescue pod','throw','lift','eel']
];

// Reference, movement, enemy pattern, and story arc for each course.
window.pawtopiaStyles = [
 ['Super Mario World','stomp','patrol','The foundry bell has gone silent. Whisker follows the cooling vents to find the missing bell keeper.','The bell keeper reopens the forge and rings the all-clear.'],
 ['Mega Man X','buster','turret','A stolen library atlas is feeding routes to the Iron Fang. Luna tracks its signal through the stacks.','The atlas reveals a hidden evacuation route beneath town.'],
 ['Ecco the Dolphin','swim','school','The lighthouse beacon has gone dark. Luna follows a trail of missing pearl divers into the reef.','The divers return and the pearl lights the harbor again.'],
 ['Sonic the Hedgehog 2','momentum','charge','Bolt has until sunrise to restore the tower before its clockwork gears lock.','The bells mark sunrise just as Bolt reaches the roof.'],
 ['Donkey Kong Country 2','roll','hopper','Ivy follows stolen seeds through a canopy of sprung branches and hidden ledges.','The last seed grows a bridge that reconnects the grove.'],
 ['Rayman Legends','glide','swoop','Frost chases the music trapped inside a frozen waterfall.','Thawing the falls brings the valley choir back together.'],
 ['Kirby Super Star','float','hopper','Melody follows the lantern thief above the rooftops before the parade begins.','The recovered lantern leads the parade home.'],
 ['VVVVVV','flip','patrol','Bolt must work both sides of a mine whose gravity circuit has failed.','The repaired cores settle the mine into one safe orientation.'],
 ['Geometry Dash','beat','rhythm','Melody challenges a clockwork band that has locked the stage lights to its rhythm.','The band joins her for the encore.'],
 ['Bionic Commando','grapple','turret','Stone descends into the abandoned quarry to free a trapped rescue crew.','The rescue cage brings the last worker into daylight.'],
 ['Klonoa: Door to Phantomile','airlift','swoop','Whisker rides the evening wind to stop a dream from vanishing at sunset.','The windmill carries the recovered dream back to town.'],
 ['Celeste','airdash','pursuit','Luna climbs toward the observatory while a storm chases the cloud ferry away.','She signals the ferry safely back through the clouds.'],
 ['Shovel Knight','pogo','charge','A lightning conductor has trapped the harbor crew below deck. Frost takes the high route.','The conductor grounds the storm and the crew comes ashore.'],
 ['Yoshi’s Island','throw','hopper','Spark follows a displaced flock through the autumn woods.','The flock finds its old nesting ground and Spark records the reunion.'],
 ['Super Metroid','blaster','pursuit','Shadow follows an unexplained signal into the observatory dome.','The projector reveals the signal came from a stranded survey team.'],
 ['Ori and the Blind Forest','airlift','swoop','Ivy climbs the dying lantern tree to find the source of its missing light.','The relit tree guides the village through the forest.'],
 ['Cuphead','shooter','rhythm','Bolt follows the boiler’s faulty regulator into a factory running out of time.','The repaired regulator brings the factory back under control.'],
 ['Disney’s Aladdin','throw','turret','Frost races the cooling hearths to return a stolen ember to Snow Village.','The village furnace lights every hearth on the ridge.'],
 ['Prince of Persia','precision','patrol','Stone crosses the canyon before a broken bridge strands the village caravan.','The restored drawbridge brings the caravan across.'],
 ['Contra III: The Alien Wars','shooter','school','Spark dives below the research pier to recover a lost submarine transponder.','The transponder guides the submarine back to its dock.'],
 ['Pizza Tower','momentum','pursuit','Shadow races out of a malfunctioning arcade cabinet before it resets.','The cabinet prints a finish photo just before it powers down.'],
 ['Castlevania: Rondo of Blood','whip','charge','Luna enters a sealed temple to return a stolen moon key.','The restored lock lets the morning light reach the temple again.'],
 ['Disney’s DuckTales','pogo','hopper','Ivy follows an empty ferry through a swamp where fireflies have stopped appearing.','The fireflies relight the pier and the ferry comes home.'],
 ['Kirby’s Epic Yarn','glide','swoop','Spark crosses a chain of giant flowers after a storm scatters their pollen.','The final bloom opens and seeds the whole valley.'],
 ['Metal Slug','shooter','turret','Whisker enters a drifting freighter to launch a rescue pod before the airlock closes.','The pod docks with the Pawtopia rescue ship.']
];

// Stage encounters, in story order. The final stage leads into each game's own objective.
window.pawtopiaChapters = [
 ['Cold Intake','Slag Tunnels','Missing Crew','Molten Crossing','Keeper’s Trail','Foundry Bell'],
 ['Return Desk','Locked Stacks','Atlas Fragments','Forbidden Wing','Signal Room','Moon Archive'],
 ['Tide Pools','Kelp Maze','Divers’ Trail','Deep Current','Pearl Grotto','Lighthouse Reef'],
 ['Market Gears','Pendulum Run','Bell Roofs','Broken Clockface','Sunrise Sprint','Tower Crown'],
 ['Seed Nursery','Swinging Vines','Beetle Nest','Hidden Canopy','Last Seed','Grove Summit'],
 ['Spray Bridge','Icy Ledges','Frozen Notes','Mist Tunnels','Ice Dam','Choir Falls'],
 ['Parade Gate','Rooftop Lanterns','Moon Bridge','Hopper Alley','Thief’s Perch','Sky Launch'],
 ['Inverted Intake','Crystal Switchyard','Ceiling Maze','Null Shaft','Twin Cores','Gravity Chamber'],
 ['Sound Check','Bass Platforms','Double Time','Backstage Circuit','Final Verse','Encore'],
 ['Lift House','Rail Cavern','Abandoned Tools','Rescue Tunnel','Cage Controls','Daylight Shaft'],
 ['Sunset Pier','Wind Tunnels','Dream Fragments','Kite Crossing','Sundown Ridge','Windmill Deck'],
 ['Cloud Ferry','Thunder Steps','Wind Shear','Luna’s Ascent','Storm Eye','Signal Tower'],
 ['Breakwater','Cargo Stacks','Crane Walk','Flooded Deck','Storm Relay','Conductor'],
 ['Feather Trail','Amber Canopy','Flock Watch','Hollow Oak','Migration Ridge','Nesting Ground'],
 ['Lower Dome','Survey Tracks','Mirror Hall','Signal Shaft','Upper Lens','Star Projector'],
 ['Bamboo Gate','Dark Grove','Fallen Lanterns','Hanging Roots','Light Well','Lantern Crown'],
 ['Intake Valve','Conveyor Hall','Gauge Room','Pressure Pipes','Regulator Run','Boiler Core'],
 ['Hearth Trail','Snow Cannon Pass','Icicle Bridge','Ember Cache','Frozen Rooftops','Village Furnace'],
 ['Rope Bridge','Broken Span','Caravan Camp','Rim Trail','Winch Room','Drawbridge'],
 ['Research Pier','Pressure Gates','Sonar Trail','Lost Transponder','Anchor Field','Submarine Dock'],
 ['Cabinet Boot','Bonus District','Reset Warning','Speed Tunnel','Last Lap','Photo Finish'],
 ['Lower Seal','Moon Cloister','Gargoyle Hall','Key Vault','Marble Steps','Temple Lock'],
 ['Reed Landing','Still Water','Firefly Search','Toad Crossing','Ferry Channel','Firefly Pier'],
 ['Sunflower Hill','Petal Trampolines','Pollen Trail','Patchwork Hive','Windbreak','Giant Bloom'],
 ['Cargo Airlock','Drifting Pallets','Emergency Beacons','Security Deck','Pod Bay','Rescue Dock']
];

// Course-specific traversal, encounter cadence, and objective parameters.
window.pawtopiaVariants = [
 [245,11,505,1.9,0,0],[260,14,475,2.4,1,2],[270,4,360,2.1,2,3],[460,2.5,470,1.5,3,1],
 [280,8,535,2.7,4,4],[240,7,510,1.6,5,4],[222,6,460,3.1,6,2],[248,13,470,1.3,7,3],
 [265,12,460,2.0,8,1],[232,8,510,1.8,9,4],[228,10,540,2.0,10,3],[286,16,480,1.7,11,4],
 [236,9,515,1.4,12,0],[252,8,525,2.8,13,2],[270,10,500,1.8,14,3],[280,12,540,1.2,15,4],
 [250,10,490,1.15,16,0],[263,9,520,2.5,17,2],[205,17,515,2.1,18,4],[270,8,500,1.1,19,0],
 [485,3.4,480,1.3,20,1],[225,15,495,1.65,21,0],[255,11,500,2.2,22,3],[220,7,470,2.6,23,4],
 [276,13,485,1.3,24,0]
];

// Sections use authored silhouettes. Each tuple is [start, height, width, surface].
window.pawtopiaRooms = {
 hills:[[0,326,465],[465,293,235],[700,258,220],[990,326,430],[1300,228,145],[1500,326,700]],
 highway:[[0,326,780],[230,220,190],[520,158,240],[855,326,300],[1180,280,230],[1450,235,270],[1760,326,440]],
 reef:[[0,326,2200],[250,140,360,'current'],[710,225,320,'current'],[1190,108,350,'current'],[1660,206,330,'current']],
 speedway:[[0,326,2200],[380,250,250,'spring'],[660,205,420,'belt'],[1230,242,320,'spring'],[1620,176,400,'belt']],
 canopy:[[0,326,300],[275,260,180,'spring'],[510,197,210,'spring'],[780,130,210],[1040,210,220,'spring'],[1310,155,260],[1660,250,310],[1940,326,260]],
 festival:[[0,326,610],[665,286,205],[925,254,300],[1290,216,160],[1500,257,235],[1790,326,410]],
 rooftops:[[0,326,330],[400,273,350],[820,224,170],[1060,151,350],[1470,218,260],[1790,326,410]],
 inversion:[[0,326,385],[590,326,325],[1110,326,270],[1630,326,570],[385,78,205,'ceiling'],[915,78,195,'ceiling'],[1380,78,250,'ceiling']],
 rhythm:[[0,326,2200],[480,283,65,'hazard'],[745,283,95,'hazard'],[1050,283,130,'hazard'],[1430,283,70,'hazard'],[1690,283,125,'hazard']],
 rails:[[0,326,380],[570,270,210],[955,226,220],[1360,195,270],[1830,326,370],[410,145,145,'rail'],[790,109,135,'rail'],[1185,91,135,'rail'],[1650,114,150,'rail']],
 dream:[[0,326,420],[490,255,230],[830,197,250,'spring'],[1180,125,230],[1490,214,250],[1810,326,390]],
 summit:[[0,326,330],[360,280,160],[570,222,160],[800,163,160],[1070,110,300],[1430,167,200],[1710,224,210],[1980,326,220]],
 docks:[[0,326,360],[425,300,190,'spring'],[680,255,250],[1010,298,135,'spring'],[1210,235,230],[1520,265,240,'spring'],[1830,326,370]],
 grove:[[0,326,760],[240,245,160],[510,190,220],[820,286,350],[1240,245,310],[1600,325,600],[1790,200,220]],
 labyrinth:[[0,326,2200],[320,253,250],[640,194,320],[1020,131,320],[1420,176,220],[1700,235,275],[1950,278,180]],
 roots:[[0,326,310],[350,272,160],[570,232,195],[820,180,195],[1070,118,330],[1440,155,190],[1670,214,220],[1940,326,260]],
 arena:[[0,326,2200],[470,240,200],[980,218,200],[1500,240,200]],
 bazaar:[[0,326,500],[560,300,235],[850,255,235],[1140,209,320],[1510,260,310],[1870,326,330]],
 traps:[[0,326,350],[465,326,255],[827,274,260],[1160,274,260],[1510,326,690],[545,290,64,'hazard'],[1260,239,55,'hazard']],
 barracks:[[0,326,2200],[390,264,190],[780,215,230],[1220,258,235],[1710,212,220]],
 escape:[[0,326,2200],[330,250,270,'belt'],[745,202,450],[1260,255,315,'belt'],[1730,215,220]],
 castle:[[0,326,450],[480,289,180],[690,249,195],[930,209,300],[1310,239,260],[1630,281,255],[1940,326,260]],
 marsh:[[0,326,325],[390,299,185,'spring'],[652,266,205,'spring'],[938,235,230,'spring'],[1230,280,200],[1505,252,260,'spring'],[1830,326,370]],
 fabric:[[0,326,480],[540,272,320],[920,230,420,'spring'],[1410,253,370],[1840,326,360]],
 hangar:[[0,326,920],[300,260,310],[990,310,530],[1120,224,240],[1590,326,610]]
};
window.pawtopiaRoomPlans = [
 'hills grove rooftops inversion hills castle','highway barracks summit rails highway arena',
 'reef reef inversion reef labyrinth reef','speedway highway escape speedway rooftops speedway',
 'canopy roots marsh canopy grove summit','docks summit dream roots docks summit',
 'rooftops festival dream rooftops canopy arena','inversion labyrinth inversion rails inversion inversion',
 'rhythm rhythm rhythm rhythm rhythm rhythm','rails highway rails summit rails rails',
 'dream rooftops dream summit canopy dream','summit roots rails summit rooftops summit',
 'docks marsh docks castle docks arena','grove hills canopy grove bazaar roots',
 'labyrinth inversion labyrinth roots labyrinth barracks','roots canopy roots summit roots dream',
 'arena arena barracks arena arena arena','bazaar rooftops traps bazaar castle arena',
 'traps castle traps rails traps summit','barracks highway barracks docks arena barracks',
 'escape speedway escape highway escape escape','castle traps castle summit castle arena',
 'marsh canopy marsh grove docks marsh','fabric grove fabric rooftops fabric dream','hangar barracks hangar highway arena hangar'
];

// Secondary moves are separate from the primary Action so each keeps its own input.
window.pawtopiaTechniques = [
 ['Cape Spin','sweep',75],['Dash Boots','burst',510],['Sonar','reveal',310],
 ['Rolling Attack','roll',420],['Barrel Launch','launch',575],['Air Punch','sweep',84],
 ['Inhale','pull',115],['Gravity Flip','flip',0],['Quick Restart','retry',0],
 ['Release Cable','release',0],['Wind Ring','capture',135],['Climb','climb',165],
 ['Shovel Drop','drop',620],['Aim Egg','lob',325],['Morph Ball','morph',0],
 ['Bash','bash',470],['Parry','parry',0],['Sword Slash','sweep',65],
 ['Ledge Grab','grab',0],['Swap Weapon','swap',0],['Super Taunt','taunt',190],
 ['Cross Throw','return',420],['Cane Bounce','drop',550],['Yarn Pull','pull',150],
 ['Grenade','lob',410]
];

// Six authored stage profiles per adventure. Each entry pairs a room shape
// with a stage-specific set piece placed in the room's second half.
window.pawtopiaSetPieces = [
 'blocks spring blocks bridge blocks tower',
 'turrets lifts turrets tower lifts turrets',
 'kelp current reef kelp current reef',
 'speed spring speed tower spring speed',
 'barrels vines barrels vines spring barrels',
 'ice tower glide ice lifts glide',
 'float blocks float tower glide float',
 'ceiling ceiling tower ceiling bridge ceiling',
 'spikes steps spikes spring steps spikes',
 'cable tower cable lifts cable cable',
 'ring glide ring tower ring glide',
 'tower dash tower dash glide dash',
 'pogo bridge pogo tower spikes pogo',
 'eggs blocks eggs vines steps eggs',
 'crawl turrets crawl lifts crawl turrets',
 'vines bash vines tower bash glide',
 'turrets dodge dodge turrets dodge turrets',
 'steps lifts dodge steps bridge steps',
 'traps steps traps bridge traps tower',
 'turrets bridge turrets tower dodge turrets',
 'speed blocks speed spring speed bridge',
 'steps turrets tower traps steps tower',
 'pogo vines pogo bridge pogo steps',
 'yarn spring yarn vines glide yarn',
 'turrets lifts bridge turrets dodge tower'
];

// Individually authored routes in reference-stage order.
Object.assign(window.pawtopiaRooms, {
  convoy:[[0,326,380],[400,289,230],[670,250,220],[920,300,250],[1220,268,230],[1490,240,280],[1810,326,390]],
  iceworks:[[0,326,420,'ice'],[458,282,220,'ice'],[735,247,260,'ice'],[1030,326,300,'ice'],[1380,286,310,'ice'],[1740,326,460]],
  airfield:[[0,326,330],[365,270,180,'lift'],[590,212,195],[830,165,240],[1125,211,205],[1390,254,225],[1660,285,240],[1940,326,260]],
  generator:[[0,326,650],[710,326,540],[1300,326,900],[380,285,100,'hazard'],[990,236,155],[1510,284,65,'hazard'],[1800,210,245]],
  minecart:[[0,326,2200],[240,276,385,'belt'],[680,241,330,'belt'],[1090,287,360,'belt'],[1500,244,430,'belt']],
  floodgate:[[0,326,2200],[335,285,215,'current'],[600,231,230,'lift'],[920,181,250],[1240,243,270,'current'],[1580,285,300,'current']],
  coast:[[0,326,2200],[290,285,250,'spring'],[620,235,430,'belt'],[1130,202,300],[1500,250,440,'belt']],
  chemical:[[0,326,620],[670,326,1530],[370,265,260,'belt'],[700,195,330,'belt'],[1120,240,260,'spring'],[1440,177,480,'belt']],
  ruins:[[0,326,2200],[240,247,280],[570,193,295],[930,230,270],[1260,267,250,'current'],[1600,195,310]],
  pinball:[[0,326,2200],[310,300,75,'spring'],[530,220,130,'spring'],[825,167,155,'spring'],[1110,265,150,'spring'],[1430,205,130,'spring'],[1750,280,195,'belt']],
  volcano:[[0,326,520],[580,291,180,'spring'],[820,231,290],[1160,275,160,'spring'],[1370,239,290],[1720,326,480]],
  cavern:[[0,326,420],[470,289,250],[790,237,245],[1110,282,230],[1420,225,250],[1740,326,460],[1840,285,56,'hazard']]
});
window.pawtopiaRoomPlans[1]='convoy iceworks airfield generator minecart floodgate';
window.pawtopiaRoomPlans[3]='coast chemical ruins pinball volcano cavern';
window.pawtopiaChapters[1]=['Convoy Ambush','Frozen Archive','Airship Platforms','Generator Blackout','Minecart Run','Floodgate Vault'];
window.pawtopiaChapters[3]=['Coastal Run','Chemical Works','Sunken Ruins','Pinball Hall','Volcanic Ridge','Crystal Cavern'];
window.pawtopiaSetPieces[1]='turrets ice lifts dodge speed current';
window.pawtopiaSetPieces[3]='speed speed bridge spring glide traps';

Object.assign(window.pawtopiaRooms, {
  seedDeck:[[0,326,660],[280,249,140,'barrel'],[710,326,570],[880,239,190],[1330,289,320],[1700,326,500]],
  seedRigging:[[0,326,390],[350,270,200],[570,211,175,'barrel'],[810,149,275],[1130,205,215],[1390,254,310],[1740,326,460]],
  seedGalley:[[0,326,510],[560,275,240],[850,229,290],[1190,270,240,'barrel'],[1490,223,250],[1780,326,420]],
  seedLocker:[[0,326,2200],[300,273,280,'current'],[640,231,265],[960,272,230,'current'],[1240,219,350],[1630,276,290,'current']],
  seedTopsail:[[0,326,365],[400,286,190,'spring'],[630,224,220,'spring'],[890,166,265],[1210,201,265],[1510,252,255],[1810,326,390]],
  seedNest:[[0,326,2200],[390,245,150],[745,201,185,'barrel'],[1060,155,220],[1350,201,185],[1655,245,150]],
  eggMeadow:[[0,326,2200],[345,256,145],[740,236,150],[1160,249,175],[1595,225,170]],
  eggRavine:[[0,326,485],[550,291,290],[900,245,230],[1190,280,320],[1560,326,640],[1850,286,55,'hazard']],
  eggCave:[[0,326,2200],[310,273,230],[590,218,260],[890,185,210],[1150,240,260],[1470,277,290]],
  eggFort:[[0,326,2200],[390,253,180],[745,212,175],[1080,249,170],[1410,211,180],[1760,255,180]],
  eggDonuts:[[0,326,385],[415,284,145,'drop'],[604,251,145,'drop'],[795,218,170,'drop'],[1010,255,165,'drop'],[1220,285,185,'drop'],[1450,263,205,'drop'],[1705,326,495]],
  eggStilts:[[0,326,2200],[360,281,185],[670,244,170],[980,281,165],[1280,238,235],[1650,269,175]]
});
window.pawtopiaRoomPlans[4]='seedDeck seedRigging seedGalley seedLocker seedTopsail seedNest';
window.pawtopiaRoomPlans[13]='eggMeadow eggRavine eggCave eggFort eggDonuts eggStilts';
window.pawtopiaChapters[4]=['Seedship Deck','High Rigging','Sunset Galley','Flooded Locker','Topsail Ascent','Canopy Nest'];
window.pawtopiaChapters[13]=['Egg-Toss Meadow','Falling Rock Ravine','Roundstone Cave','Amber Fort','Donut Lift Crossing','Stilt Patrol'];
window.pawtopiaSetPieces[4]='barrels vines barrels current spring tower';
window.pawtopiaSetPieces[13]='eggs traps steps turrets bridge eggs';

Object.assign(window.pawtopiaRooms, {
  forgeTrail:[[0,326,440],[500,285,290],[850,248,235],[1140,305,420],[1620,326,580]],
  switchHall:[[0,326,2200],[420,242,290],[830,201,370],[1320,240,410]],
  forgeHills:[[0,326,660],[690,289,295],[1030,251,290],[1370,283,310],[1730,326,470]],
  forgeBridges:[[0,326,370],[430,275,210],[705,221,250],[1020,246,230],[1320,280,300],[1690,326,510]],
  forgeBanks:[[0,326,410],[470,289,240,'current'],[770,258,295],[1120,285,255,'current'],[1440,251,270],[1780,326,420]],
  forgeKeep:[[0,326,500],[560,294,280],[910,263,310],[1280,226,360],[1710,326,490],[1840,285,65,'hazard']],
  cloudCity:[[0,326,410],[470,278,215],[760,226,225],[1050,177,210],[1330,228,310],[1710,326,490]],
  cloudDream:[[0,326,460],[525,269,210],[810,213,205],[1100,169,230],[1430,246,310],[1810,326,390]],
  cloudResort:[[0,326,520],[580,273,250],[895,235,215],[1170,269,255],[1490,235,240],[1800,326,400],[1910,285,45,'hazard']],
  cloudRidge:[[0,326,410],[470,281,175,'spring'],[720,215,205,'spring'],[1010,170,220],[1320,215,240,'spring'],[1640,278,240],[1940,326,260]],
  cloudMirror:[[0,326,2200],[360,249,210],[640,198,220],[925,151,220],[1220,202,235],[1510,259,245]],
  cloudReflection:[[0,326,355],[420,282,205],[685,244,220],[980,205,230],[1290,161,240],[1600,218,235],[1910,326,290]]
});
window.pawtopiaRoomPlans[0]='forgeTrail switchHall forgeHills forgeBridges forgeBanks forgeKeep';
window.pawtopiaRoomPlans[11]='cloudCity cloudDream cloudResort cloudRidge cloudMirror cloudReflection';
window.pawtopiaChapters[0]=['Foundry Trail','Amber Switch Hall','Cinder Hills','Suspended Bridges','Cooling Banks','Furnace Keep'];
window.pawtopiaChapters[11]=['Forsaken Towers','Dream Passage','Storm Lodge','Golden Cloud Ridge','Mirror Vault','Reflection Ascent'];
window.pawtopiaSetPieces[0]='blocks blocks spring bridge current tower';
window.pawtopiaSetPieces[11]='dash dash traps spring dash glide';

Object.assign(window.pawtopiaRooms, {
  coralBay:[[0,326,2200],[320,240,250,'current'],[820,177,260],[1340,234,355,'current']],
  coralChannels:[[0,326,2200],[380,170,420],[970,229,280,'current'],[1470,140,350]],
  coralCaves:[[0,326,2200],[280,142,260,'ceiling'],[660,241,410],[1240,152,285,'ceiling'],[1610,216,340]],
  coralVents:[[0,326,2200],[410,262,120,'hazard'],[780,179,330,'current'],[1190,262,110,'hazard'],[1580,216,320,'current']],
  coralLagoon:[[0,326,2200],[320,254,270],[735,217,280],[1240,174,280],[1650,254,280,'current']],
  coralRidge:[[0,326,2200],[330,271,240],[670,226,225],[1000,176,240],[1380,135,250],[1770,224,270]],
  observatorySurface:[[0,326,520],[580,282,285],[940,235,280],[1300,273,310],[1680,326,520]],
  observatoryBurrow:[[0,326,2200],[610,250,260],[975,198,290],[1380,247,290]],
  observatoryHeat:[[0,326,730],[790,326,560],[1420,326,780],[890,285,100,'hazard'],[1620,285,130,'hazard'],[1800,234,240]],
  observatoryWreck:[[0,326,2200],[290,251,260],[670,215,285],[1110,250,295],[1560,205,355]],
  observatoryTide:[[0,326,2200],[340,262,225,'current'],[700,219,280],[1110,170,300],[1530,236,350,'current']],
  observatoryCore:[[0,326,440],[495,273,240],[805,218,240],[1110,174,280],[1470,226,290],[1820,326,380]]
});
window.pawtopiaRoomPlans[2]='coralBay coralChannels coralCaves coralVents coralLagoon coralRidge';
window.pawtopiaRoomPlans[14]='observatorySurface observatoryBurrow observatoryHeat observatoryWreck observatoryTide observatoryCore';
window.pawtopiaChapters[2]=['Home Reef','Kelp Channels','Undercaves','Thermal Vents','Pearl Lagoon','Deepwater Ridge'];
window.pawtopiaChapters[14]=['Surface Approach','Burrow Network','Thermal Galleries','Wrecked Observatory','Tidal Labyrinth','Lower Core'];
window.pawtopiaSetPieces[2]='reef current kelp dodge reef current';
window.pawtopiaSetPieces[14]='turrets crawl traps lifts current tower';

Object.assign(window.pawtopiaRooms, {
  moonVillage:[[0,326,520],[580,289,250],[890,245,230],[1170,282,290],[1510,326,690],[1690,285,50,'hazard']],
  moonGate:[[0,326,560],[380,265,190],[620,233,190],[870,194,240],[1165,230,250],[1470,280,225],[1750,326,450]],
  moonChapel:[[0,326,460],[510,276,210],[775,224,195],[1025,168,280],[1360,226,230],[1640,269,250],[1950,326,250]],
  moonHalls:[[0,326,2200],[365,250,240],[685,206,230],[1000,249,240],[1350,203,270],[1800,285,58,'hazard']],
  moonShip:[[0,326,440],[495,285,300],[850,245,220],[1120,204,260],[1440,249,250],[1750,326,450]],
  moonGallery:[[0,326,2200],[410,255,195],[655,205,175],[895,157,250],[1210,208,220],[1500,250,290]],
  ferryJungle:[[0,326,410],[455,291,210,'pogo'],[725,250,245],[1030,284,245,'pogo'],[1340,245,310],[1710,326,490]],
  ferryManor:[[0,326,2200],[280,251,230],[600,200,250],[965,242,245],[1325,192,280],[1700,257,240]],
  ferryMine:[[0,326,510],[565,276,225],[850,230,255,'pogo'],[1165,273,260],[1490,236,220,'pogo'],[1770,326,430]],
  ferrySnow:[[0,326,440,'ice'],[495,291,265,'ice'],[820,247,270],[1150,285,230,'ice'],[1430,248,280],[1770,326,430,'ice']],
  ferryMoon:[[0,326,385],[435,273,175,'pogo'],[675,213,220],[965,160,240,'pogo'],[1270,210,230],[1570,265,240],[1880,326,320]],
  ferryReturn:[[0,326,2200],[375,247,200],[690,207,225],[1035,251,235,'pogo'],[1405,211,220],[1745,262,230]]
});
window.pawtopiaRoomPlans[21]='moonVillage moonGate moonChapel moonHalls moonShip moonGallery';
window.pawtopiaRoomPlans[22]='ferryJungle ferryManor ferryMine ferrySnow ferryMoon ferryReturn';
window.pawtopiaChapters[21]=['Ruined Village','Moon Gate','Marble Chapel','Inner Halls','Phantom Ship','Silver Gallery'];
window.pawtopiaChapters[22]=['Jungle Relics','Haunted Manor','Gem Mines','Snowbound Pass','Moon Outpost','Return to the Manor'];
window.pawtopiaSetPieces[21]='steps turrets tower traps bridge tower';
window.pawtopiaSetPieces[22]='pogo blocks pogo ice pogo steps';

// Each row is a complete course. Heights and widths are authored per chapter.
// A platform tuple is [x, y, width, optional surface].
const remainingPawcadeRoutes = {
  5:[
    ['Forest Rescue','glide',[[0,326,530],[590,278,250],[920,206,240],[1250,261,340],[1660,326,540]]],
    ['Castle Banquet','lifts',[[0,326,2200],[310,245,220],[630,196,245,'lift'],[1030,229,280],[1530,190,320]]],
    ['Ocean Laboratory','current',[[0,326,2200],[280,271,380,'current'],[740,212,250],[1080,155,310],[1490,236,320,'current']]],
    ['Warrior Ridge','tower',[[0,326,390],[450,285,220],[740,235,205],[1020,190,280],[1370,248,275],[1710,326,490]]],
    ['Dark Summit','ice',[[0,326,490,'ice'],[550,282,300,'ice'],[925,220,320],[1320,262,320,'ice'],[1710,326,490]]],
    ['Musical Escape','spring',[[0,326,2200],[370,283,150,'spring'],[740,283,90,'hazard'],[1140,250,220,'spring'],[1650,283,110,'hazard']]]
  ],
  6:[
    ['Spring Breeze','float',[[0,326,660],[700,272,290],[1050,221,280],[1400,278,300],[1750,326,450]]],
    ['Footrace Ridge','speed',[[0,326,2200],[310,276,350,'belt'],[780,213,400],[1360,258,370,'belt']]],
    ['Cavern Treasure','blocks',[[0,326,2200],[290,244,210],[615,193,300],[1040,230,380],[1540,179,390]]],
    ['Airship Revenge','turrets',[[0,326,450],[520,283,260],[850,224,290],[1220,262,290],[1600,326,600]]],
    ['Starlight World','glide',[[0,326,395],[460,265,270],[810,191,275],[1180,149,290],[1540,234,310],[1910,326,290]]],
    ['Lantern Arena','dodge',[[0,326,2200],[580,239,140],[1060,190,155],[1650,239,150]]]
  ],
  7:[
    ['Transporter Deck','ceiling',[[0,326,580],[835,326,570],[1690,326,510],[580,95,255,'ceiling'],[1405,95,285,'ceiling']]],
    ['Laboratory Shaft','ceiling',[[0,326,415],[670,326,415],[1400,326,330],[1940,326,260],[415,120,255,'ceiling'],[1085,92,315,'ceiling'],[1730,124,210,'ceiling']]],
    ['Warp Grid','bridge',[[0,326,430],[740,326,470],[1540,326,660],[430,105,310,'ceiling'],[1210,85,330,'ceiling']]],
    ['Intermission Rails','ceiling',[[0,326,520],[735,326,355],[1360,326,445],[2010,326,190],[520,88,215,'ceiling'],[1090,102,270,'ceiling'],[1805,115,205,'ceiling']]],
    ['Tower Interior','tower',[[0,326,570],[820,326,440],[1570,326,630],[570,130,250,'ceiling'],[1260,110,310,'ceiling']]],
    ['Final Flip','ceiling',[[0,326,470],[730,326,310],[1320,326,290],[1910,326,290],[470,92,260,'ceiling'],[1040,130,280,'ceiling'],[1610,84,300,'ceiling']]]
  ],
  8:[
    ['Stereo Steps','spikes',[[0,326,2200],[440,286,45,'hazard'],[755,286,65,'hazard'],[1080,286,75,'hazard'],[1470,286,48,'hazard']]],
    ['Backbeat Blocks','steps',[[0,326,2200],[450,266,130],[760,286,70,'hazard'],[1230,265,140],[1690,286,95,'hazard']]],
    ['Polarity Pulse','spikes',[[0,326,2200],[470,286,80,'hazard'],[820,286,52,'hazard'],[1280,286,110,'hazard'],[1740,286,60,'hazard']]],
    ['Dry Circuit','spring',[[0,326,2200],[415,280,150,'spring'],[810,286,95,'hazard'],[1340,269,170,'spring'],[1760,286,70,'hazard']]],
    ['Bassline Flight','steps',[[0,326,2200],[390,269,170],[790,286,110,'hazard'],[1200,259,205],[1720,286,115,'hazard']]],
    ['Final Beat','spikes',[[0,326,2200],[475,286,100,'hazard'],[875,286,75,'hazard'],[1375,286,105,'hazard'],[1820,286,95,'hazard']]]
  ],
  9:[
    ['Landing Gantry','cable',[[0,326,430],[520,288,250],[900,241,310],[1360,263,310],[1810,326,390],[520,125,160,'rail']]],
    ['Industrial Base','turrets',[[0,326,2200],[410,252,260],[890,193,245],[1450,244,360],[740,116,180,'rail']]],
    ['Canopy Wires','cable',[[0,326,405],[530,276,245],[920,228,250],[1310,188,265],[1740,326,460],[910,108,185,'rail']]],
    ['Lift Shaft','lifts',[[0,326,475],[555,282,210,'lift'],[865,230,250,'lift'],[1230,174,290],[1640,260,270],[1990,326,210]]],
    ['Quarry Defenses','cable',[[0,326,2200],[365,245,240],[800,207,250],[1300,237,360],[660,105,180,'rail']]],
    ['Rescue Gantries','cable',[[0,326,420],[520,277,210],[890,225,280],[1320,175,310],[1760,326,440],[460,130,160,'rail']]]
  ],
  10:[
    ['Windmill Village','ring',[[0,326,550],[625,274,245],[945,224,250],[1280,275,310],[1670,326,530]]],
    ['Tree Village','glide',[[0,326,450],[530,261,235],[860,196,280],[1230,148,300],[1620,253,310],[1990,326,210]]],
    ['Sunken Palace','ring',[[0,326,2200],[410,235,280],[840,184,260],[1260,232,250],[1710,200,255]]],
    ['Wind Kingdom Ruins','tower',[[0,326,500],[565,279,220],[850,229,240],[1160,177,280],[1530,241,265],[1860,326,340]]],
    ['Dream Foundry','ring',[[0,326,2200],[365,269,270,'belt'],[795,216,315],[1280,177,270],[1710,258,265,'belt']]],
    ['Moonlit Windmill','glide',[[0,326,425],[505,271,225],[810,209,260],[1160,160,320],[1550,230,320],[1930,326,270]]]
  ],
  12:[
    ['Plains Approach','pogo',[[0,326,510],[575,291,245,'pogo'],[890,246,290],[1240,278,285],[1600,326,600]]],
    ['Sunken Treasure','bridge',[[0,326,2200],[345,258,240,'current'],[755,218,250],[1240,260,280,'current'],[1650,197,270]]],
    ['Lava Yard','pogo',[[0,326,410],[485,283,205,'pogo'],[780,226,260],[1130,271,240,'pogo'],[1460,225,285],[1810,326,390]]],
    ['Clockwork Tower','tower',[[0,326,520],[575,279,195,'belt'],[855,225,210],[1150,176,290],[1530,240,300,'belt'],[1900,326,300]]],
    ['Airship Deck','spikes',[[0,326,2200],[400,258,230],[845,219,290],[1260,286,88,'hazard'],[1630,235,310]]],
    ['Storm Relay','pogo',[[0,326,430],[505,275,235,'pogo'],[825,219,240],[1150,172,290],[1520,248,300],[1900,326,300]]]
  ],
  15:[
    ['Spirit Glade','vines',[[0,326,530],[600,278,240],[910,215,290],[1280,167,310],[1680,326,520]]],
    ['Water Vein','bash',[[0,326,2200],[370,252,205],[725,202,265],[1150,150,255],[1570,228,310]]],
    ['Flood Escape','tower',[[0,326,390],[455,282,205],[745,220,215],[1050,158,285],[1420,232,285],[1790,326,410]]],
    ['Wind Valley','glide',[[0,326,450],[530,276,250],[850,211,260],[1220,158,280],[1580,234,310],[1950,326,250]]],
    ['Frozen Ruins','ice',[[0,326,550,'ice'],[610,284,250,'ice'],[940,232,280],[1310,263,320,'ice'],[1720,326,480]]],
    ['Firebreak Ascent','bash',[[0,326,480],[555,285,200],[835,231,245],[1160,174,290],[1540,237,295],[1900,326,300]]]
  ],
  16:[
    ['Root Cellar','turrets',[[0,326,2200],[570,251,180],[1080,209,195],[1620,251,190]]],
    ['Boiler Frogs','dodge',[[0,326,2200],[340,278,185],[770,229,210],[1270,250,225],[1710,283,165]]],
    ['Garden Machinery','dodge',[[0,326,2200],[370,249,155],[785,199,180],[1235,245,170],[1660,194,170]]],
    ['Carnival Track','speed',[[0,326,2200],[410,275,340,'belt'],[880,209,300],[1380,249,400,'belt']]],
    ['Junkyard Press','turrets',[[0,326,2200],[470,245,230],[925,205,200],[1400,239,290],[1835,286,58,'hazard']]],
    ['Boiler Breaker','dodge',[[0,326,2200],[460,250,170],[930,207,220],[1450,251,180],[1780,211,205]]]
  ],
  17:[
    ['Market Rooftops','steps',[[0,326,520],[575,284,265],[910,230,260],[1240,277,310],[1640,326,560]]],
    ['Palace Dungeon','traps',[[0,326,2200],[450,286,70,'hazard'],[790,232,250],[1230,286,65,'hazard'],[1650,205,275]]],
    ['Cave Approach','bridge',[[0,326,435],[505,280,255],[840,226,290],[1200,264,310],[1590,326,610]]],
    ['Lava Flight','spring',[[0,326,390],[460,285,220,'spring'],[770,215,235],[1100,165,270],[1450,239,290],[1820,326,380]]],
    ['Lantern Interior','lifts',[[0,326,2200],[345,263,240,'lift'],[720,202,260],[1160,152,285],[1630,240,310]]],
    ['Frozen Palace','ice',[[0,326,485,'ice'],[555,282,285,'ice'],[915,229,270],[1255,260,325,'ice'],[1660,326,540]]]
  ],
  18:[
    ['Prison Steps','traps',[[0,326,500],[550,283,240],[850,250,290],[1200,280,270],[1550,326,650],[1745,286,52,'hazard']]],
    ['Guard Corridor','steps',[[0,326,2200],[375,255,200],[740,213,230],[1180,252,260],[1680,205,230]]],
    ['Collapsing Hall','bridge',[[0,326,425],[485,290,205,'drop'],[745,250,240,'drop'],[1040,218,235],[1340,258,285,'drop'],[1700,326,500]]],
    ['Blade Gallery','traps',[[0,326,2200],[460,285,60,'hazard'],[815,237,235],[1240,286,60,'hazard'],[1670,218,275]]],
    ['Mirror Passage','tower',[[0,326,510],[570,280,210],[845,228,230],[1150,177,290],[1510,239,310],[1890,326,310]]],
    ['Palace Bridge','steps',[[0,326,415],[475,286,235],[770,247,230],[1060,210,270],[1390,251,300],[1760,326,440]]]
  ],
  19:[
    ['Street Insertion','turrets',[[0,326,2200],[335,264,200],[725,216,230],[1190,251,240],[1670,200,260]]],
    ['Perimeter Sweep','dodge',[[0,326,2200],[500,250,170],[925,205,190],[1410,254,260],[1840,286,60,'hazard']]],
    ['Carrier Climb','tower',[[0,326,480],[555,283,210],[840,228,230],[1150,177,275],[1510,242,310],[1900,326,300]]],
    ['Highway Convoy','bridge',[[0,326,520],[575,289,250,'belt'],[880,246,265],[1210,282,305,'belt'],[1580,326,620]]],
    ['Alien Junction','dodge',[[0,326,2200],[380,243,215],[795,195,260],[1270,240,285],[1760,209,255]]],
    ['Dock Core','turrets',[[0,326,2200],[475,259,180],[875,215,230],[1320,259,240],[1760,218,205]]]
  ],
  20:[
    ['Lobby Sprint','speed',[[0,326,2200],[355,273,365,'belt'],[840,223,420],[1420,259,410,'belt']]],
    ['Dungeon Heat','blocks',[[0,326,505],[555,291,280],[905,239,285],[1250,278,320],[1650,326,550]]],
    ['Western Run','speed',[[0,326,2200],[280,270,345,'belt'],[760,211,330],[1310,258,500,'belt']]],
    ['Haunted Circuit','spring',[[0,326,2200],[380,276,180,'spring'],[710,217,315],[1170,268,230,'spring'],[1610,208,330]]],
    ['Factory Dash','speed',[[0,326,620],[670,326,1530],[385,264,370,'belt'],[865,214,360,'belt'],[1420,260,490,'belt']]],
    ['Tower Reset','bridge',[[0,326,2200],[450,253,260],[850,207,300],[1310,252,320],[1770,221,240]]]
  ],
  23:[
    ['Grass Patch','yarn',[[0,326,560],[620,284,290],[980,242,295],[1345,274,300],[1720,326,480]]],
    ['Stitched Desert','spring',[[0,326,450],[520,282,230,'spring'],[825,215,260],[1170,263,285],[1530,222,290],[1880,326,320]]],
    ['Threaded Treats','yarn',[[0,326,2200],[330,253,220],[740,192,290],[1220,239,300],[1690,191,305]]],
    ['Felt Ocean','vines',[[0,326,2200],[370,275,250,'current'],[780,225,280],[1230,169,280],[1680,245,310,'current']]],
    ['Snowy Seams','ice',[[0,326,525,'ice'],[585,281,270,'ice'],[930,220,285],[1300,259,310,'ice'],[1700,326,500]]],
    ['Patchwork Orbit','yarn',[[0,326,450],[520,268,240],[850,207,250],[1180,156,290],[1550,225,300],[1930,326,270]]]
  ],
  24:[
    ['Outpost Landing','turrets',[[0,326,2200],[390,262,205],[770,210,280],[1230,256,280],[1720,200,250]]],
    ['Mountain Convoy','lifts',[[0,326,495],[555,281,240,'lift'],[875,228,260],[1210,184,290],[1580,251,290],[1940,326,260]]],
    ['River Crossing','bridge',[[0,326,450],[510,286,270],[850,235,260],[1180,273,270],[1520,226,280],[1870,326,330]]],
    ['City Siege','turrets',[[0,326,2200],[315,245,275],[735,195,285],[1190,250,290],[1680,206,260]]],
    ['Factory Assault','dodge',[[0,326,600],[660,326,1540],[390,254,330,'belt'],[880,215,280],[1380,258,350,'belt']]],
    ['Cargo Stronghold','tower',[[0,326,2200],[460,249,220],[820,201,270],[1240,155,285],[1670,235,320]]]
  ]
};
for (const [index, stages] of Object.entries(remainingPawcadeRoutes)) {
  const keys = stages.map(([, , platforms], stage) => {
    const key = 'course' + index + 'Stage' + (stage + 1);
    window.pawtopiaRooms[key] = platforms;
    return key;
  });
  window.pawtopiaRoomPlans[index] = keys.join(' ');
  window.pawtopiaChapters[index] = stages.map(([title]) => title);
  window.pawtopiaSetPieces[index] = stages.map(([, feature]) => feature).join(' ');
}

// First-stage placement adjustments in Game Room order.
// Entries are [platform, x, surface height, width]. Preserve surface behavior.
const pawcadeOpeningPlacements = [
  [1, 480, 290, 310],
  [1, 399, 289, 231],
  [1, 335, 239, 250],
  [2, 610, 238, 440],
  [1, 280, 259, 150],
  [2, 900, 217, 260],
  [1, 685, 278, 305],
  [2, 1670, 326, 530],
  [1, 465, 286, 40],
  [5, 545, 125, 165],
  [2, 925, 232, 270],
  [3, 1030, 189, 230],
  [1, 555, 293, 265],
  [1, 325, 269, 165],
  [2, 922, 244, 298],
  [3, 1255, 180, 335],
  [1, 530, 265, 220],
  [2, 895, 240, 275],
  [3, 1175, 282, 295],
  [1, 315, 276, 220],
  [2, 813, 232, 447],
  [1, 562, 293, 268],
  [1, 447, 297, 218],
  [2, 960, 250, 315],
  [1, 360, 271, 235]
];
pawcadeOpeningPlacements.forEach(([platform, x, y, width], index) => {
  const room = window.pawtopiaRoomPlans[index].split(' ')[0];
  window.pawtopiaRooms[room][platform].splice(0, 3, x, y, width);
});

// Second opening-room pass, in Game Room order. Preserve surface types and save indices.
const pawcadeOpeningRouteEdits = [
  [2,825,234,255],
  [3,900,283,260],
  [2,760,150,345],
  [3,1080,193,335],
  [3,870,211,225],
  [2,870,197,265],
  [2,1040,190,305],
  [3,565,95,285],
  [3,1060,286,58],
  [3,1330,245,330],
  [2,915,215,210],
  [4,1320,206,325],
  [2,885,229,290],
  [2,705,211,170],
  [2,900,223,310],
  [2,880,199,300],
  null,
  [3,1230,257,310],
  [2,840,247,270],
  [2,680,226,285],
  [3,1380,267,525],
  [2,880,239,230],
  [3,1010,256,240],
  [3,1320,248,325],
  [3,1205,269,305]
];
pawcadeOpeningRouteEdits.forEach((edit,index)=>{
  // Steamworks uses its own longer catwalk layout in the game renderer.
  if(!edit) return;
  const [slot,x,y,width]=edit;
  const room=window.pawtopiaRoomPlans[index].split(' ')[0];
  window.pawtopiaRooms[room][slot].splice(0,3,x,y,width);
});

// Later-stage platform placements, in game and chapter order.
for (const [room, slot, x, y, width] of [
  ["switchHall",1,405,234,310],
  ["forgeHills",2,1015,243,310],
  ["forgeBridges",3,1005,238,250],
  ["forgeBanks",4,1425,243,290],
  ["forgeKeep",2,895,255,330],
  ["iceworks",2,715,239,284],
  ["airfield",1,345,262,204],
  ["generator",4,970,228,179],
  ["minecart",1,220,268,409],
  ["floodgate",2,580,223,254],
  ["coralChannels",2,950,215,316],
  ["coralCaves",4,1590,202,376],
  ["coralVents",2,760,165,366],
  ["coralLagoon",4,1630,240,316],
  ["coralRidge",3,980,162,276],
  ["chemical",2,352,265,296],
  ["ruins",5,1582,195,346],
  ["pinball",6,1732,280,231],
  ["volcano",3,1142,275,196],
  ["cavern",4,1402,225,286],
  ["seedRigging",2,552,202,195],
  ["seedGalley",3,1172,261,260],
  ["seedLocker",2,622,222,285],
  ["seedTopsail",3,872,157,285],
  ["seedNest",2,727,192,205],
  ["course5Stage2",4,1512,180,346],
  ["course5Stage3",2,722,202,276],
  ["course5Stage4",4,1352,238,301],
  ["course5Stage5",2,907,210,346],
  ["course5Stage6",3,1122,240,246],
  ["course6Stage2",2,760,200,435],
  ["course6Stage3",4,1520,166,425],
  ["course6Stage4",3,1200,249,325],
  ["course6Stage5",2,790,178,310],
  ["course6Stage6",2,1040,177,190],
  ["course7Stage2",5,1073,92,339],
  ["course7Stage3",3,418,105,334],
  ["course7Stage4",4,508,88,239],
  ["course7Stage5",3,558,130,274],
  ["course7Stage6",6,1598,84,324],
  ["course8Stage2",2,776,286,70],
  ["course8Stage3",2,836,286,52],
  ["course8Stage4",2,826,286,95],
  ["course8Stage5",4,1736,286,115],
  ["course8Stage6",1,491,286,100],
  ["course9Stage2",4,725,116,210],
  ["course9Stage3",5,895,108,215],
  ["course9Stage4",4,1625,260,300],
  ["course9Stage5",4,645,105,210],
  ["course9Stage6",5,445,130,190],
  ["course10Stage2",3,1215,138,324],
  ["course10Stage3",4,1695,190,279],
  ["course10Stage4",1,550,269,244],
  ["course10Stage5",3,1265,167,294],
  ["course10Stage6",3,1145,150,344],
  ["cloudDream",4,1418,234,328],
  ["cloudResort",1,568,261,268],
  ["cloudRidge",5,1628,266,258],
  ["cloudMirror",5,1498,247,263],
  ["cloudReflection",1,408,270,223],
  ["course12Stage2",1,331,258,265],
  ["course12Stage3",3,1116,271,265],
  ["course12Stage4",3,1136,176,315],
  ["course12Stage5",1,386,258,255],
  ["course12Stage6",1,491,275,260],
  ["eggRavine",2,888,245,250],
  ["eggCave",5,1458,277,310],
  ["eggFort",1,378,253,200],
  ["eggDonuts",5,1208,285,205],
  ["eggStilts",3,968,281,185],
  ["observatoryBurrow",3,1366,239,310],
  ["observatoryHeat",5,1786,226,260],
  ["observatoryWreck",1,276,243,280],
  ["observatoryTide",3,1096,162,320],
  ["observatoryCore",3,1096,166,300],
  ["course15Stage2",4,1554,217,332],
  ["course15Stage3",1,439,271,227],
  ["course15Stage4",2,834,200,282],
  ["course15Stage5",2,924,221,302],
  ["course15Stage6",4,1524,226,317],
  ["course17Stage2",4,1638,195,295],
  ["course17Stage3",1,493,270,275],
  ["course17Stage4",4,1438,229,310],
  ["course17Stage5",1,333,253,260],
  ["course17Stage6",1,543,272,305],
  ["course18Stage2",3,1172,252,272],
  ["course18Stage3",2,737,250,252],
  ["course18Stage4",2,807,237,247],
  ["course18Stage5",2,837,228,242],
  ["course18Stage6",3,1052,210,282],
  ["course19Stage2",2,909,205,220],
  ["course19Stage3",1,539,283,240],
  ["course19Stage4",3,1194,282,335],
  ["course19Stage5",3,1254,240,315],
  ["course19Stage6",4,1744,218,235],
  ["course20Stage2",3,1232,278,358],
  ["course20Stage3",3,1292,258,538],
  ["course20Stage4",3,1152,268,268],
  ["course20Stage5",4,1402,260,528],
  ["course20Stage6",1,432,253,298],
  ["moonGate",2,610,239,208],
  ["moonChapel",3,1015,174,298],
  ["moonHalls",4,1340,209,288],
  ["moonShip",1,485,291,318],
  ["moonGallery",1,400,261,213],
  ["ferryManor",3,953,242,269],
  ["ferryMine",4,1478,236,244],
  ["ferrySnow",1,483,291,289],
  ["ferryMoon",3,953,160,264],
  ["ferryReturn",3,1023,251,259],
  ["course23Stage2",1,507,276,252],
  ["course23Stage3",1,317,247,242],
  ["course23Stage4",2,767,219,302],
  ["course23Stage5",3,1287,253,332],
  ["course23Stage6",4,1537,219,322],
  ["course24Stage2",1,541,275,268],
  ["course24Stage3",2,836,229,288],
  ["course24Stage4",3,1176,244,318],
  ["course24Stage5",2,376,248,358],
  ["course24Stage6",1,446,243,248]
]) {
  window.pawtopiaRooms[room][slot].splice(0, 3, x, y, width);
}

Object.assign(window.pawtopiaRooms, {
  forgeSwitchbacks: [[0,326,390],[445,290,180],[690,247,165],[930,210,210],
    [1195,268,215],[1480,305,280],[1815,326,385]],
  forgeFloodplain: [[0,326,420],[470,285,210],[735,252,180,'lift'],
    [975,286,220],[1260,233,185],[1510,290,255],[1820,326,380]]
});
window.pawtopiaRoomPlans[0] += ' forgeSwitchbacks forgeFloodplain';
window.pawtopiaChapters[0].push('Smelter Switchbacks','Floodgate Crossing');
window.pawtopiaSetPieces[0] += ' steps lifts';

Object.assign(window.pawtopiaRooms,{
  forgeKilnCanopy:[[0,326,490],[545,289,165,'spring'],[775,226,180],[1010,181,175],
    [1245,231,230],[1515,278,250],[1815,326,385]],
  forgeSlagAqueduct:[[0,326,465],[525,297,250],[842,276,210,'belt'],[1105,226,185],
    [1350,280,220,'belt'],[1620,304,200],[1835,326,365]]
});
window.pawtopiaRoomPlans[0] += ' forgeKilnCanopy forgeSlagAqueduct';
window.pawtopiaChapters[0].push('Kiln Canopy','Slag Aqueduct');
window.pawtopiaSetPieces[0] += ' spring speed';

const foundryExpansion = [
  ["Cinder Orchard","blocks",[[0,326,400],[440,290,225],[730,246,180],[980,285,280],[1350,237,220],[1650,295,175],[1880,326,320]]],
  ["Copper Viaduct","bridge",[[0,326,400],[490,304,185],[725,268,220],[1005,238,175],[1260,264,320],[1650,295,175],[1880,326,320]]],
  ["Bellows Basin","spring",[[0,326,400],[490,300,200,"spring"],[765,246,215],[1050,195,215],[1340,251,270,"spring"],[1650,295,175],[1880,326,320]]],
  ["Ashfall Galleries","lifts",[[0,326,400],[440,294,265],[770,267,148,"lift"],[985,220,200],[1285,266,265],[1650,295,175],[1880,326,320]]],
  ["Clinker Cavern","steps",[[0,326,400],[460,278,170],[675,229,190],[930,259,300],[1310,289,290],[1650,295,175],[1880,326,320]]],
  ["Rivet Rapids","current",[[0,326,400],[475,302,230,"current"],[775,252,205],[1035,296,230,"current"],[1330,249,275],[1650,295,175],[1880,326,320]]],
  ["Sootspire Approach","tower",[[0,326,400],[440,295,200],[700,250,165],[925,212,180],[1190,267,385],[1650,295,175],[1880,326,320]]],
  ["Furnace Crown","bridge",[[0,326,400],[465,279,210],[735,244,230],[1035,204,230],[1340,242,235],[1650,295,175],[1880,326,320]]]
];
for(const [offset,[title,feature,platforms]] of foundryExpansion.entries()){
  const room='forgeExpansion'+offset;
  window.pawtopiaRooms[room]=platforms;
  window.pawtopiaRoomPlans[0]+=' '+room;
  window.pawtopiaChapters[0].push(title);
  window.pawtopiaSetPieces[0]+=' '+feature;
}

// Make the opposite landing surface available at each gravity crossing.
for(const room of window.pawtopiaRoomPlans[7].split(' ')){
  const platforms=window.pawtopiaRooms[room];
  const floor=platforms.filter(([,y])=>y===326);
  const ceiling=platforms.filter(([, , ,kind])=>kind==='ceiling');
  for(const [i, ledge] of ceiling.entries()){
    const [left,,width]=floor[i];
    const entry=left+width-110;
    const exit=floor[i+1][0]+110;
    ledge[0]=Math.min(ledge[0],entry);
    ledge[2]=exit-ledge[0];
  }
}

// Align each rail with the approach ledge and keep it overhead.
for(const room of window.pawtopiaRoomPlans[9].split(' ')){
  const platforms=window.pawtopiaRooms[room].filter(piece=>piece[3]!=='rail');
  const landings=platforms.filter(([x,,width])=>x!==0 || width<2200);
  for(const [i,[x,y]] of landings.entries()){
    const previous=landings[i-1];
    if(!previous && x===0) continue;
    const approach=previous ? previous[0]+previous[2] : x-120;
    const center=approach+Math.min(95,(x-approach)/2);
    const height=Math.max(74,Math.min(y-145,(previous?.[1]??326)-70));
    platforms.push([center-46,height,92,'rail']);
  }
  window.pawtopiaRooms[room]=platforms;
}
