/* Super Paw Heroes original open-world content manifest. Design targets, not playable geometry. */
(function(root){'use strict';const world={
  "version": 1,
  "worldName": "Pawtopia and the Crystal Wilds",
  "targetHours": {
    "mainStory": 22,
    "sideContent": 38,
    "exploration": 20
  },
  "regions": [
    {
      "id": "Sunrise Square",
      "biome": "capital town",
      "features": "shops, inn, guild, NPC homes",
      "tier": 1
    },
    {
      "id": "Willowbrook",
      "biome": "riverside village",
      "features": "farms, fishing, river quests",
      "tier": 1
    },
    {
      "id": "Whisperleaf Forest",
      "biome": "forest",
      "features": "wildlife, hidden groves, woodland quests",
      "tier": 2
    },
    {
      "id": "Moonpetal Grove",
      "biome": "forest sanctuary",
      "features": "Luna story arc, spirit shrines",
      "tier": 3
    },
    {
      "id": "Copperhill",
      "biome": "mining town",
      "features": "forge, mining quests, equipment",
      "tier": 3
    },
    {
      "id": "Crystal Catacombs",
      "biome": "underground caves",
      "features": "crystal puzzles, minibosses, relics",
      "tier": 4
    },
    {
      "id": "Mistral Highlands",
      "biome": "mountain",
      "features": "switchbacks, cliff villages",
      "tier": 5
    },
    {
      "id": "Skybridge Keep",
      "biome": "fortress town",
      "features": "castle, defenders, siege quests",
      "tier": 6
    },
    {
      "id": "Starfall Lake",
      "biome": "lakeside town",
      "features": "boats, ruins, fishing",
      "tier": 4
    },
    {
      "id": "Frostwhisker Peaks",
      "biome": "snow mountain",
      "features": "ice caves, rescue missions",
      "tier": 7
    },
    {
      "id": "Emberglass Badlands",
      "biome": "volcanic desert",
      "features": "canyons, rare ore, outposts",
      "tier": 8
    },
    {
      "id": "Clockwork Borough",
      "biome": "industrial city",
      "features": "inventor workshops, villain story",
      "tier": 8
    },
    {
      "id": "Sunken Lantern Marsh",
      "biome": "swamp",
      "features": "boardwalks, hidden paths",
      "tier": 5
    },
    {
      "id": "Seabreeze Harbor",
      "biome": "coastal port",
      "features": "docks, trading, coastal quests",
      "tier": 6
    },
    {
      "id": "Ancient Paw Temple",
      "biome": "ruins",
      "features": "late-game lore and guardian",
      "tier": 9
    },
    {
      "id": "Eclipse Citadel",
      "biome": "final fortress",
      "features": "story finale and endgame",
      "tier": 10
    }
  ],
  "roads": [
    {
      "from": "Sunrise Square",
      "to": "Willowbrook",
      "kind": "curved-trail"
    },
    {
      "from": "Sunrise Square",
      "to": "Whisperleaf Forest",
      "kind": "curved-trail"
    },
    {
      "from": "Sunrise Square",
      "to": "Clockwork Borough",
      "kind": "curved-trail"
    },
    {
      "from": "Willowbrook",
      "to": "Starfall Lake",
      "kind": "curved-trail"
    },
    {
      "from": "Willowbrook",
      "to": "Sunken Lantern Marsh",
      "kind": "curved-trail"
    },
    {
      "from": "Whisperleaf Forest",
      "to": "Moonpetal Grove",
      "kind": "curved-trail"
    },
    {
      "from": "Whisperleaf Forest",
      "to": "Copperhill",
      "kind": "curved-trail"
    },
    {
      "from": "Moonpetal Grove",
      "to": "Ancient Paw Temple",
      "kind": "curved-trail"
    },
    {
      "from": "Copperhill",
      "to": "Crystal Catacombs",
      "kind": "curved-trail"
    },
    {
      "from": "Copperhill",
      "to": "Mistral Highlands",
      "kind": "curved-trail"
    },
    {
      "from": "Crystal Catacombs",
      "to": "Ancient Paw Temple",
      "kind": "curved-trail"
    },
    {
      "from": "Mistral Highlands",
      "to": "Skybridge Keep",
      "kind": "curved-trail"
    },
    {
      "from": "Mistral Highlands",
      "to": "Frostwhisker Peaks",
      "kind": "curved-trail"
    },
    {
      "from": "Skybridge Keep",
      "to": "Eclipse Citadel",
      "kind": "curved-trail"
    },
    {
      "from": "Starfall Lake",
      "to": "Seabreeze Harbor",
      "kind": "curved-trail"
    },
    {
      "from": "Starfall Lake",
      "to": "Sunken Lantern Marsh",
      "kind": "curved-trail"
    },
    {
      "from": "Sunken Lantern Marsh",
      "to": "Seabreeze Harbor",
      "kind": "curved-trail"
    },
    {
      "from": "Seabreeze Harbor",
      "to": "Emberglass Badlands",
      "kind": "curved-trail"
    },
    {
      "from": "Emberglass Badlands",
      "to": "Clockwork Borough",
      "kind": "curved-trail"
    },
    {
      "from": "Clockwork Borough",
      "to": "Eclipse Citadel",
      "kind": "curved-trail"
    },
    {
      "from": "Ancient Paw Temple",
      "to": "Eclipse Citadel",
      "kind": "curved-trail"
    },
    {
      "from": "Skybridge Keep",
      "to": "Frostwhisker Peaks",
      "kind": "curved-trail"
    }
  ],
  "designTargets": {
    "towns": 7,
    "regions": 16,
    "mainQuests": 50,
    "sideQuests": 130,
    "discoveries": 180,
    "dungeons": 12,
    "bosses": 16,
    "levelCap": 200
  },
  "notes": "Planning targets, not implemented content. Regions connect in a graph; caves may stream interiors. All content must be original and mobile optimized."
};const themes={"Sunrise Square":["golden cobblestone streets, banners, flower planters","gentle hills, paved plazas","Guild Initiation","Sunrise Guardian Set"],"Willowbrook":["wooden bridges, waterwheels, farms, cottages","riverbanks, grassy floodplain","The Missing Waterwheel","Riverwarden Gear"],"Whisperleaf Forest":["towering trees, moss, mushrooms, vines","rolling wooded slopes, root tunnels","Whispers Under the Canopy","Leafshadow Bow"],"Moonpetal Grove":["glowing blossoms, silver trees, moon lanterns","soft glades, terraced pools","Luna's Moonlit Promise","Moonpetal Robes"],"Copperhill":["timber mines, furnaces, ore carts, stone cottages","rocky ridges, quarry terraces","The Silent Mine","Copperforge Hammer"],"Crystal Catacombs":["glowing crystals, ancient columns, mineral veins","jagged caverns, vertical ledges, underground lakes","Heart of the Crystal","Prismatic Crystal Armor"],"Mistral Highlands":["windmills, alpine flowers, stone markers","steep grassy ridges, switchback paths","The Broken Pass","Galecrest Boots"],"Skybridge Keep":["ramparts, banners, watchtowers, armories","cliff fortifications, high bridges","Defend the Skybridge","Skyguard Plate"],"Starfall Lake":["reed boats, docks, stargazing towers","lakeshores, islands, shallow coves","The Fallen Star","Starwater Staff"],"Frostwhisker Peaks":["frosted pines, ice pillars, warm lodges","snowdrifts, glaciers, ice caves","The Lost Expedition","Frostguard Cloak"],"Emberglass Badlands":["obsidian formations, heat vents, basalt ruins","volcanic mesas, lava ravines","Ashes of the Forge","Emberglass Blade"],"Clockwork Borough":["gears, brass lamps, workshops, tram rails","industrial canals, paved embankments","The Stolen Blueprint","Clockwork Gauntlets"],"Sunken Lantern Marsh":["glowing lantern reeds, stilt huts, ancient roots","wetlands, mud islands, boardwalks","Lights Beneath the Mire","Marshstrider Boots"],"Seabreeze Harbor":["sailboats, market stalls, lighthouses, docks","coastal cliffs, beaches, tidal flats","The Lighthouse Signal","Tidecaller Cutlass"],"Ancient Paw Temple":["paw glyphs, carved statues, relic altars","ruined terraces, overgrown stone stairs","The Guardian's Trial","Relickeeper Amulet"],"Eclipse Citadel":["dark spires, celestial banners, fractured crystals","fortress cliffs, shadowed courtyards","The Eclipse Confrontation","Eclipsebreaker Set"]};for(const region of world.regions){const t=themes[region.id];if(!t)throw Error('Missing theme for '+region.id);region.theme={scenery:t[0],terrain:t[1],signatureQuest:t[2],signatureEquipment:t[3],environmentRules:{groundMaterials:'region-specific',vegetation:'region-specific',architecture:'region-specific',ambientAudio:'region-specific',lootTable:'region-specific',enemyVariants:'region-specific'},transition:'blend neighboring biome borders naturally',quality:'feature-film-stylized 3D; scalable Android LOD'};}const exploration={"Sunrise Square":["market alley shortcuts","bell-tower switch sequence","sealed guild cellar"],"Willowbrook":["floodgate crossings","waterwheel lever order","submerged mill vault"],"Whisperleaf Forest":["branching root trails","mushroom marker trail","camouflaged root burrow"],"Moonpetal Grove":["moonlight reflection paths","lunar mirror alignment","hidden blossom shrine"],"Copperhill":["minecart rail junctions","ore-weight pressure plates","collapsed prospectors' tunnel"],"Crystal Catacombs":["crystal-lit labyrinth","prism beam redirection","sealed geode chamber"],"Mistral Highlands":["wind-carved switchbacks","windmill vane sequence","cave behind cliff waterfall"],"Skybridge Keep":["rampart stair mazes","drawbridge chain controls","forgotten guard crypt"],"Starfall Lake":["island stepping routes","star constellation stones","underwater observatory"],"Frostwhisker Peaks":["snow-covered trails","ice-slide and torch puzzle","avalanche-hidden ice grotto"],"Emberglass Badlands":["basalt canyon forks","heat vent timing","obsidian fissure dungeon"],"Clockwork Borough":["rotating gear streets","gear ratio and steam valves","abandoned clocktower workshop"],"Sunken Lantern Marsh":["reed-hidden boardwalks","lantern color sequence","sunken stilt-house cellar"],"Seabreeze Harbor":["tidal dock passages","lighthouse lens alignment","smuggler sea cave"],"Ancient Paw Temple":["overgrown spiral stairways","paw glyph order","guardian reliquary"],"Eclipse Citadel":["shadow bridge network","eclipse beam and clockwork locks","hidden throne vault"]};for(const region of world.regions){const p=exploration[region.id];if(!p)throw Error('Missing exploration design: '+region.id);region.exploration={roadMaze:p[0],puzzle:p[1],hiddenDungeon:p[2],roadRules:['multiple navigable paths','readable landmarks','optional hidden shortcuts','no mandatory blind guessing','quest clues from nearby NPCs'],dungeonRules:['discoverable entrance clues','themed enemy encounters','treasure and quest reward','return path or exit shortcut','persistent completion state'],difficultyTier:region.tier};}world.designTargets.hiddenDungeons=16;world.designTargets.terrainRoadPuzzles=16;world.designTargets.thematicQuestChains=16;world.designTargets.thematicEquipmentFamilies=16;const ids=new Set(world.regions.map(r=>r.id));if(ids.size!==world.regions.length)throw Error('Duplicate regions');const links=new Map([...ids].map(id=>[id,new Set()]));for(const e of world.roads){if(!ids.has(e.from)||!ids.has(e.to))throw Error('Road references unknown region');links.get(e.from).add(e.to);links.get(e.to).add(e.from)}const visited=new Set(['Sunrise Square']),queue=['Sunrise Square'];for(let i=0;i<queue.length;i++)for(const next of links.get(queue[i]))if(!visited.has(next)){visited.add(next);queue.push(next)}if(visited.size!==ids.size)throw Error('Disconnected world graph');root.SuperPawWorldManifest=Object.freeze(world);})(typeof window!=='undefined'?window:globalThis);
