# 25-game enemy restoration checklist

**Current source status:** 25/25 gameplay render paths select the earlier creature-era visual baseline; newly introduced vector/WebGL replacements are disabled. This is *not* a claim of Android visual approval or verified live site deployment.

**Visual baseline:** historical commit `9768ec86ad` (when Furnace Crab art was preferred); original sprite atlas `assets/scenes/platform-enemies.webp`, with individually authored Foundry/Library/Reef/Clock/Steamworks specialist foes preserved. Every game keeps its own original enemy appearance, *not a pasted crab*.

**Per-game checks:** `[x]` denotes a source-verified old renderer selection and original stage mapping; `[ ]` means visual/device checks cannot yet be confirmed. Shared device checklist for **every** stage: verify idle, moving, turn, jump/fly, land, attack wind-up and contact, hit, recovery, defeat; confirm art and ground contacts match hitboxes; compare with old approved appearance and verify mobile landscape FPS.

## 1. Ember Foundry — Whisker
Assigned counterpart: **Super Mario World**; locomotion **stomp**; encounter pattern **patrol**. Replaced/blocked unapproved newer rig: **Cinder Tongs**.
Original enemy draw: `drawFoundryEnemy (Furnace Crab & individual specialist variants)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Foundry Trail | `forgeTrail` | `blocks` / patrol | [x] | [ ] |
| 2. Amber Switch Hall | `switchHall` | `blocks` / patrol | [x] | [ ] |
| 3. Cinder Hills | `forgeHills` | `spring` / patrol | [x] | [ ] |
| 4. Suspended Bridges | `forgeBridges` | `bridge` / patrol | [x] | [ ] |
| 5. Cooling Banks | `forgeBanks` | `current` / patrol | [x] | [ ] |
| 6. Furnace Keep | `forgeKeep` | `tower` / patrol | [x] | [ ] |
| 7. Smelter Switchbacks | `forgeSwitchbacks` | `steps` / patrol | [x] | [ ] |
| 8. Floodgate Crossing | `forgeFloodplain` | `lifts` / patrol | [x] | [ ] |
| 9. Kiln Canopy | `forgeKilnCanopy` | `spring` / patrol | [x] | [ ] |
| 10. Slag Aqueduct | `forgeSlagAqueduct` | `speed` / patrol | [x] | [ ] |
| 11. Cinder Orchard | `forgeExpansion0` | `blocks` / patrol | [x] | [ ] |
| 12. Copper Viaduct | `forgeExpansion1` | `bridge` / patrol | [x] | [ ] |
| 13. Bellows Basin | `forgeExpansion2` | `spring` / patrol | [x] | [ ] |
| 14. Ashfall Galleries | `forgeExpansion3` | `lifts` / patrol | [x] | [ ] |
| 15. Clinker Cavern | `forgeExpansion4` | `steps` / patrol | [x] | [ ] |
| 16. Rivet Rapids | `forgeExpansion5` | `current` / patrol | [x] | [ ] |
| 17. Sootspire Approach | `forgeExpansion6` | `tower` / patrol | [x] | [ ] |
| 18. Furnace Crown | `forgeExpansion7` | `bridge` / patrol | [x] | [ ] |

## 2. Moonlit Library — Luna
Assigned counterpart: **Mega Man X**; locomotion **buster**; encounter pattern **turret**. Replaced/blocked unapproved newer rig: **Atlas Warden**.
Original enemy draw: `Moonlit Library specialists and original atlas`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Convoy Ambush | `convoy` | `turrets` / turret | [x] | [ ] |
| 2. Frozen Archive | `iceworks` | `ice` / turret | [x] | [ ] |
| 3. Airship Platforms | `airfield` | `lifts` / turret | [x] | [ ] |
| 4. Generator Blackout | `generator` | `dodge` / turret | [x] | [ ] |
| 5. Minecart Run | `minecart` | `speed` / turret | [x] | [ ] |
| 6. Floodgate Vault | `floodgate` | `current` / turret | [x] | [ ] |

## 3. Coral Courier — Luna
Assigned counterpart: **Ecco the Dolphin**; locomotion **swim**; encounter pattern **school**. Replaced/blocked unapproved newer rig: **Reef Skimmer**.
Original enemy draw: `Coral Courier specialists and original atlas`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Home Reef | `coralBay` | `reef` / school | [x] | [ ] |
| 2. Kelp Channels | `coralChannels` | `current` / school | [x] | [ ] |
| 3. Undercaves | `coralCaves` | `kelp` / school | [x] | [ ] |
| 4. Thermal Vents | `coralVents` | `dodge` / school | [x] | [ ] |
| 5. Pearl Lagoon | `coralLagoon` | `reef` / school | [x] | [ ] |
| 6. Deepwater Ridge | `coralRidge` | `current` / school | [x] | [ ] |

## 4. Clocktower Relay — Bolt
Assigned counterpart: **Sonic the Hedgehog 2**; locomotion **momentum**; encounter pattern **charge**. Replaced/blocked unapproved newer rig: **Pendulum Sentinel**.
Original enemy draw: `Clocktower Relay specialists and original atlas`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Coastal Run | `coast` | `speed` / charge | [x] | [ ] |
| 2. Chemical Works | `chemical` | `speed` / charge | [x] | [ ] |
| 3. Sunken Ruins | `ruins` | `bridge` / charge | [x] | [ ] |
| 4. Pinball Hall | `pinball` | `spring` / charge | [x] | [ ] |
| 5. Volcanic Ridge | `volcano` | `glide` / charge | [x] | [ ] |
| 6. Crystal Cavern | `cavern` | `traps` / charge | [x] | [ ] |

## 5. Seed Garden — Ivy
Assigned counterpart: **Donkey Kong Country 2**; locomotion **roll**; encounter pattern **hopper**. Replaced/blocked unapproved newer rig: **Thorn Hopper**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 4)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Seedship Deck | `seedDeck` | `barrels` / hopper | [x] | [ ] |
| 2. High Rigging | `seedRigging` | `vines` / hopper | [x] | [ ] |
| 3. Sunset Galley | `seedGalley` | `barrels` / hopper | [x] | [ ] |
| 4. Flooded Locker | `seedLocker` | `current` / hopper | [x] | [ ] |
| 5. Topsail Ascent | `seedTopsail` | `spring` / hopper | [x] | [ ] |
| 6. Canopy Nest | `seedNest` | `tower` / hopper | [x] | [ ] |

## 6. Waterfall Climb — Frost
Assigned counterpart: **Rayman Legends**; locomotion **glide**; encounter pattern **swoop**. Replaced/blocked unapproved newer rig: **Mist Glider**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 5)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Forest Rescue | `course5Stage1` | `glide` / swoop | [x] | [ ] |
| 2. Castle Banquet | `course5Stage2` | `lifts` / swoop | [x] | [ ] |
| 3. Ocean Laboratory | `course5Stage3` | `current` / swoop | [x] | [ ] |
| 4. Warrior Ridge | `course5Stage4` | `tower` / swoop | [x] | [ ] |
| 5. Dark Summit | `course5Stage5` | `ice` / swoop | [x] | [ ] |
| 6. Musical Escape | `course5Stage6` | `spring` / swoop | [x] | [ ] |

## 7. Lantern Festival — Melody
Assigned counterpart: **Kirby Super Star**; locomotion **float**; encounter pattern **hopper**. Replaced/blocked unapproved newer rig: **Lantern Juggler**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 6)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Spring Breeze | `course6Stage1` | `float` / hopper | [x] | [ ] |
| 2. Footrace Ridge | `course6Stage2` | `speed` / hopper | [x] | [ ] |
| 3. Cavern Treasure | `course6Stage3` | `blocks` / hopper | [x] | [ ] |
| 4. Airship Revenge | `course6Stage4` | `turrets` / hopper | [x] | [ ] |
| 5. Starlight World | `course6Stage5` | `glide` / hopper | [x] | [ ] |
| 6. Lantern Arena | `course6Stage6` | `dodge` / hopper | [x] | [ ] |

## 8. Crystal Polarity — Bolt
Assigned counterpart: **VVVVVV**; locomotion **flip**; encounter pattern **patrol**. Replaced/blocked unapproved newer rig: **Flux Beetle**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 7)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Transporter Deck | `course7Stage1` | `ceiling` / patrol | [x] | [ ] |
| 2. Laboratory Shaft | `course7Stage2` | `ceiling` / patrol | [x] | [ ] |
| 3. Warp Grid | `course7Stage3` | `bridge` / patrol | [x] | [ ] |
| 4. Intermission Rails | `course7Stage4` | `ceiling` / patrol | [x] | [ ] |
| 5. Tower Interior | `course7Stage5` | `tower` / patrol | [x] | [ ] |
| 6. Final Flip | `course7Stage6` | `ceiling` / patrol | [x] | [ ] |

## 9. Stage Beat — Melody
Assigned counterpart: **Geometry Dash**; locomotion **beat**; encounter pattern **rhythm**. Replaced/blocked unapproved newer rig: **Bass Bouncer**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 8)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Stereo Steps | `course8Stage1` | `spikes` / rhythm | [x] | [ ] |
| 2. Backbeat Blocks | `course8Stage2` | `steps` / rhythm | [x] | [ ] |
| 3. Polarity Pulse | `course8Stage3` | `spikes` / rhythm | [x] | [ ] |
| 4. Dry Circuit | `course8Stage4` | `spring` / rhythm | [x] | [ ] |
| 5. Bassline Flight | `course8Stage5` | `steps` / rhythm | [x] | [ ] |
| 6. Final Beat | `course8Stage6` | `spikes` / rhythm | [x] | [ ] |

## 10. Quarry Rescue — Stone
Assigned counterpart: **Bionic Commando**; locomotion **grapple**; encounter pattern **turret**. Replaced/blocked unapproved newer rig: **Slate Burrower**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 9)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Landing Gantry | `course9Stage1` | `cable` / turret | [x] | [ ] |
| 2. Industrial Base | `course9Stage2` | `turrets` / turret | [x] | [ ] |
| 3. Canopy Wires | `course9Stage3` | `cable` / turret | [x] | [ ] |
| 4. Lift Shaft | `course9Stage4` | `lifts` / turret | [x] | [ ] |
| 5. Quarry Defenses | `course9Stage5` | `cable` / turret | [x] | [ ] |
| 6. Rescue Gantries | `course9Stage6` | `cable` / turret | [x] | [ ] |

## 11. Sunset Wind Sail — Whisker
Assigned counterpart: **Klonoa: Door to Phantomile**; locomotion **airlift**; encounter pattern **swoop**. Replaced/blocked unapproved newer rig: **Gale Kite**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 10)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Windmill Village | `course10Stage1` | `ring` / swoop | [x] | [ ] |
| 2. Tree Village | `course10Stage2` | `glide` / swoop | [x] | [ ] |
| 3. Sunken Palace | `course10Stage3` | `ring` / swoop | [x] | [ ] |
| 4. Wind Kingdom Ruins | `course10Stage4` | `tower` / swoop | [x] | [ ] |
| 5. Dream Foundry | `course10Stage5` | `ring` / swoop | [x] | [ ] |
| 6. Moonlit Windmill | `course10Stage6` | `glide` / swoop | [x] | [ ] |

## 12. Cloud City — Luna
Assigned counterpart: **Celeste**; locomotion **airdash**; encounter pattern **pursuit**. Replaced/blocked unapproved newer rig: **Nimbus Guard**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 11)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Forsaken Towers | `cloudCity` | `dash` / pursuit | [x] | [ ] |
| 2. Dream Passage | `cloudDream` | `dash` / pursuit | [x] | [ ] |
| 3. Storm Lodge | `cloudResort` | `traps` / pursuit | [x] | [ ] |
| 4. Golden Cloud Ridge | `cloudRidge` | `spring` / pursuit | [x] | [ ] |
| 5. Mirror Vault | `cloudMirror` | `dash` / pursuit | [x] | [ ] |
| 6. Reflection Ascent | `cloudReflection` | `glide` / pursuit | [x] | [ ] |

## 13. Thunder Harbor — Frost
Assigned counterpart: **Shovel Knight**; locomotion **pogo**; encounter pattern **charge**. Replaced/blocked unapproved newer rig: **Coil Ray**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 12)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Plains Approach | `course12Stage1` | `pogo` / charge | [x] | [ ] |
| 2. Sunken Treasure | `course12Stage2` | `bridge` / charge | [x] | [ ] |
| 3. Lava Yard | `course12Stage3` | `pogo` / charge | [x] | [ ] |
| 4. Clockwork Tower | `course12Stage4` | `tower` / charge | [x] | [ ] |
| 5. Airship Deck | `course12Stage5` | `spikes` / charge | [x] | [ ] |
| 6. Storm Relay | `course12Stage6` | `pogo` / charge | [x] | [ ] |

## 14. Autumn Trail — Spark
Assigned counterpart: **Yoshi’s Island**; locomotion **throw**; encounter pattern **hopper**. Replaced/blocked unapproved newer rig: **Bramble Stalker**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 13)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Egg-Toss Meadow | `eggMeadow` | `eggs` / hopper | [x] | [ ] |
| 2. Falling Rock Ravine | `eggRavine` | `traps` / hopper | [x] | [ ] |
| 3. Roundstone Cave | `eggCave` | `steps` / hopper | [x] | [ ] |
| 4. Amber Fort | `eggFort` | `turrets` / hopper | [x] | [ ] |
| 5. Donut Lift Crossing | `eggDonuts` | `bridge` / hopper | [x] | [ ] |
| 6. Stilt Patrol | `eggStilts` | `eggs` / hopper | [x] | [ ] |

## 15. Inverted Observatory — Shadow
Assigned counterpart: **Super Metroid**; locomotion **blaster**; encounter pattern **pursuit**. Replaced/blocked unapproved newer rig: **Orbit Watcher**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 14)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Surface Approach | `observatorySurface` | `turrets` / pursuit | [x] | [ ] |
| 2. Burrow Network | `observatoryBurrow` | `crawl` / pursuit | [x] | [ ] |
| 3. Thermal Galleries | `observatoryHeat` | `traps` / pursuit | [x] | [ ] |
| 4. Wrecked Observatory | `observatoryWreck` | `lifts` / pursuit | [x] | [ ] |
| 5. Tidal Labyrinth | `observatoryTide` | `current` / pursuit | [x] | [ ] |
| 6. Lower Core | `observatoryCore` | `tower` / pursuit | [x] | [ ] |

## 16. Bamboo Village — Ivy
Assigned counterpart: **Ori and the Blind Forest**; locomotion **airlift**; encounter pattern **swoop**. Replaced/blocked unapproved newer rig: **Cane Striker**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 15)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Spirit Glade | `course15Stage1` | `vines` / swoop | [x] | [ ] |
| 2. Water Vein | `course15Stage2` | `bash` / swoop | [x] | [ ] |
| 3. Flood Escape | `course15Stage3` | `tower` / swoop | [x] | [ ] |
| 4. Wind Valley | `course15Stage4` | `glide` / swoop | [x] | [ ] |
| 5. Frozen Ruins | `course15Stage5` | `ice` / swoop | [x] | [ ] |
| 6. Firebreak Ascent | `course15Stage6` | `bash` / swoop | [x] | [ ] |

## 17. Steamworks — Bolt
Assigned counterpart: **Cuphead**; locomotion **shooter**; encounter pattern **rhythm**. Replaced/blocked unapproved newer rig: **Pressure Piston**.
Original enemy draw: `Steamworks specialist and original atlas`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Root Cellar | `course16Stage1` | `turrets` / rhythm | [x] | [ ] |
| 2. Boiler Frogs | `course16Stage2` | `dodge` / rhythm | [x] | [ ] |
| 3. Garden Machinery | `course16Stage3` | `dodge` / rhythm | [x] | [ ] |
| 4. Carnival Track | `course16Stage4` | `speed` / rhythm | [x] | [ ] |
| 5. Junkyard Press | `course16Stage5` | `turrets` / rhythm | [x] | [ ] |
| 6. Boiler Breaker | `course16Stage6` | `dodge` / rhythm | [x] | [ ] |

## 18. Snow Village — Frost
Assigned counterpart: **Disney’s Aladdin**; locomotion **throw**; encounter pattern **turret**. Replaced/blocked unapproved newer rig: **Frost Lantern**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 17)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Market Rooftops | `course17Stage1` | `steps` / turret | [x] | [ ] |
| 2. Palace Dungeon | `course17Stage2` | `traps` / turret | [x] | [ ] |
| 3. Cave Approach | `course17Stage3` | `bridge` / turret | [x] | [ ] |
| 4. Lava Flight | `course17Stage4` | `spring` / turret | [x] | [ ] |
| 5. Lantern Interior | `course17Stage5` | `lifts` / turret | [x] | [ ] |
| 6. Frozen Palace | `course17Stage6` | `ice` / turret | [x] | [ ] |

## 19. Canyon Crossing — Stone
Assigned counterpart: **Prince of Persia**; locomotion **precision**; encounter pattern **patrol**. Replaced/blocked unapproved newer rig: **Dust Runner**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 18)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Prison Steps | `course18Stage1` | `traps` / patrol | [x] | [ ] |
| 2. Guard Corridor | `course18Stage2` | `steps` / patrol | [x] | [ ] |
| 3. Collapsing Hall | `course18Stage3` | `bridge` / patrol | [x] | [ ] |
| 4. Blade Gallery | `course18Stage4` | `traps` / patrol | [x] | [ ] |
| 5. Mirror Passage | `course18Stage5` | `tower` / patrol | [x] | [ ] |
| 6. Palace Bridge | `course18Stage6` | `steps` / patrol | [x] | [ ] |

## 20. Submarine Dock — Spark
Assigned counterpart: **Contra III: The Alien Wars**; locomotion **shooter**; encounter pattern **school**. Replaced/blocked unapproved newer rig: **Abyss Probe**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 19)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Street Insertion | `course19Stage1` | `turrets` / school | [x] | [ ] |
| 2. Perimeter Sweep | `course19Stage2` | `dodge` / school | [x] | [ ] |
| 3. Carrier Climb | `course19Stage3` | `tower` / school | [x] | [ ] |
| 4. Highway Convoy | `course19Stage4` | `bridge` / school | [x] | [ ] |
| 5. Alien Junction | `course19Stage5` | `dodge` / school | [x] | [ ] |
| 6. Dock Core | `course19Stage6` | `turrets` / school | [x] | [ ] |

## 21. Neon Circuit — Shadow
Assigned counterpart: **Pizza Tower**; locomotion **momentum**; encounter pattern **pursuit**. Replaced/blocked unapproved newer rig: **Pixel Phantom**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 20)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Lobby Sprint | `course20Stage1` | `speed` / pursuit | [x] | [ ] |
| 2. Dungeon Heat | `course20Stage2` | `blocks` / pursuit | [x] | [ ] |
| 3. Western Run | `course20Stage3` | `speed` / pursuit | [x] | [ ] |
| 4. Haunted Circuit | `course20Stage4` | `spring` / pursuit | [x] | [ ] |
| 5. Factory Dash | `course20Stage5` | `speed` / pursuit | [x] | [ ] |
| 6. Tower Reset | `course20Stage6` | `bridge` / pursuit | [x] | [ ] |

## 22. Marble Temple — Luna
Assigned counterpart: **Castlevania: Rondo of Blood**; locomotion **whip**; encounter pattern **charge**. Replaced/blocked unapproved newer rig: **Mosaic Golem**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 21)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Ruined Village | `moonVillage` | `steps` / charge | [x] | [ ] |
| 2. Moon Gate | `moonGate` | `turrets` / charge | [x] | [ ] |
| 3. Marble Chapel | `moonChapel` | `tower` / charge | [x] | [ ] |
| 4. Inner Halls | `moonHalls` | `traps` / charge | [x] | [ ] |
| 5. Phantom Ship | `moonShip` | `bridge` / charge | [x] | [ ] |
| 6. Silver Gallery | `moonGallery` | `tower` / charge | [x] | [ ] |

## 23. Swamp Ferry — Ivy
Assigned counterpart: **Disney’s DuckTales**; locomotion **pogo**; encounter pattern **hopper**. Replaced/blocked unapproved newer rig: **Bog Lantern**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 22)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Jungle Relics | `ferryJungle` | `pogo` / hopper | [x] | [ ] |
| 2. Haunted Manor | `ferryManor` | `blocks` / hopper | [x] | [ ] |
| 3. Gem Mines | `ferryMine` | `pogo` / hopper | [x] | [ ] |
| 4. Snowbound Pass | `ferrySnow` | `ice` / hopper | [x] | [ ] |
| 5. Moon Outpost | `ferryMoon` | `pogo` / hopper | [x] | [ ] |
| 6. Return to the Manor | `ferryReturn` | `steps` / hopper | [x] | [ ] |

## 24. Sunflower Flight — Spark
Assigned counterpart: **Kirby’s Epic Yarn**; locomotion **glide**; encounter pattern **swoop**. Replaced/blocked unapproved newer rig: **Pollen Drifter**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 23)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Grass Patch | `course23Stage1` | `yarn` / swoop | [x] | [ ] |
| 2. Stitched Desert | `course23Stage2` | `spring` / swoop | [x] | [ ] |
| 3. Threaded Treats | `course23Stage3` | `yarn` / swoop | [x] | [ ] |
| 4. Felt Ocean | `course23Stage4` | `vines` / swoop | [x] | [ ] |
| 5. Snowy Seams | `course23Stage5` | `ice` / swoop | [x] | [ ] |
| 6. Patchwork Orbit | `course23Stage6` | `yarn` / swoop | [x] | [ ] |

## 25. Starship Cargo — Whisker
Assigned counterpart: **Metal Slug**; locomotion **shooter**; encounter pattern **turret**. Replaced/blocked unapproved newer rig: **Cargo Mimic**.
Original enemy draw: `assets/scenes/platform-enemies.webp (game cell 24)`.
- [x] Restore source-era enemy silhouette and color; correct game-specific atlas cell and specialist dispatch.
- [x] Restore original articulated paws/legs, antennae, secondary motion and body transforms.
- [x] Keep original per-stage enemies, attacks, spawn placement, player collisions and stage routes.
- [ ] Compare actual animated characters against approved earlier screenshots (Android).
- [ ] Verify live website asset response, all attack/impact transitions, landing contact and FPS.

| Stage | Source room | Encounter/set-piece | Source restored | Live/Android QA |
|---|---|---|---|---|
| 1. Outpost Landing | `course24Stage1` | `turrets` / turret | [x] | [ ] |
| 2. Mountain Convoy | `course24Stage2` | `lifts` / turret | [x] | [ ] |
| 3. River Crossing | `course24Stage3` | `bridge` / turret | [x] | [ ] |
| 4. City Siege | `course24Stage4` | `turrets` / turret | [x] | [ ] |
| 5. Factory Assault | `course24Stage5` | `dodge` / turret | [x] | [ ] |
| 6. Cargo Stronghold | `course24Stage6` | `tower` / turret | [x] | [ ] |

## Boundaries and known outstanding work
- Original enemy *render path* restored and source-level validation can confirm placement metadata, but no independent frame screenshots or phone-performance data were generated by this task.
- New experimental modules remain in the repository and are blocked from actual enemy draw calls. The original actors' designs cannot be called film-quality 3D from these static checks.
- Future changes may improve timing/shading, but enemy redesigns require a user-approved visual sample, not an automated new silhouette.
