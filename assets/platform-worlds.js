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
