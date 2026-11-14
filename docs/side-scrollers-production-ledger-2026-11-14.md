# Super Paw Heroes — 25-game art and film production ledger


## Batch 13 — opt-in real 3D enemies inside playable games (games 1–5)

**Source changes:** The first five 2.5D games can now opt into *actual 3D-rendered enemy models inside the gameplay canvas*, not just the separate studio. This is a **low-detail original-model preview**, not production-quality feature-film 3D art, and does **not** change any game mechanics. The site now has a **3D enemy preview: Off/On** HUD switch, visible only while playing games 1–5; **off by default**.

**Technical integration:** `assets/animation/enemy-3d-prototype-v1.js` gained an opt-in transparent WebGL drawing mode with a fixed **160×160** texture and no ground or opaque rectangular background. `assets/pawcade-side-scroll-no-badges-v2.js` creates one small offscreen GPU renderer only after the user activates the HUD switch. It renders up to **two regular foes per frame**, then composites their 3D mesh image at each foe's existing world position. The hero, 2.5D backgrounds/platforms, combat/collision geometry, spawn times, attack timing and checkpoints are otherwise untouched. No use of a paid API or outside asset CDN.

**Critical independent-art safeguard:** Foundry, Library, Reef and Clock *specialist* enemies continue using the game's prior individually authored stage-enemy art. Only ordinary foes with `usesOriginRig(foe)` are eligible for the 3D experimental preview, keeping enemy variants original rather than replacing them with a generic base. For a GPU-unavailable or overloaded browser, or if the user leaves the preview off, the previously integrated game-specific illustrated 2.5D rig draws instead. On any exception the game auto-restores 2D artwork and the Canvas transform stack. 3D rendering is automatically disabled when frame timing repeatedly exceeds approximately **42 ms**; tab-resume gaps are ignored. The GPU renderer is disposed on toggle-off or pagehide. Original grounded shadows and enemy hitboxes are retained. No game other than indices 0–4 enables WebGL.

**Quality/QA:** A new Node regression test verifies the HUD is opt-in, scripts load in order, the transparent sprite requires `alpha:true` and `preserveDrawingBuffer:true`, all five game-specific 3D mesh builds draw without the standalone preview studio floor, max sprites/frame and low-FPS fallback are bounded, per-enemy specialist art is preserved, and WebGL buffers are disposed on toggle off. Prior two legacy tests had to be updated for the new overlay-specific art guard and the changed asset query version, then CI returned to green. GitHub Pages Actions reported successful deployment through `1690b9179`; subsequent compact Android HUD tweak is pending its own run at the time of this entry.

**Current limits:** The new meshes are basic lit WebGL primitives, **not** the poster-approved feature-film-stylized 3D models; there is no full skinned rig/face system, and not every specialist enemy has a 3D replacement. Only two regular enemies per frame are drawn in 3D to protect phone performance; others use their unique 2D art. This is why the toggle remains **preview/opt-in**. The environment/platforms remain current 2.5D Canvas scenery, not fully modeled 3D. The 25 movies are not finished. Real Android FPS, on-device WebGL output, visual art approval and stage-by-stage collision playthrough are **not verified** by tests or deployments.



## Batch 12 — first genuine 3D mesh prototypes for five original enemies

**Real progress:** A separate **WebGL 1 3D enemy prototype studio** was added at `enemy-3d-prototype.html`. It renders actual index-based 3D triangle meshes with vertex normals and directional light — **not flat vector sprites or simulated 3D**. The five different scene descriptions and articulated pose samplers are authored locally in `assets/animation/enemy-3d-prototype-v1.js`. Each enemy has its own fully original parametric primitive assembly, surface colors and animation offsets; no imported or copied counterpart asset or paid dependency.

| Game | 3D model prototype | Multi-part animation concepts |
| --- | --- | --- |
| 01 Ember Foundry | Cinder Tongs | Metallic furnace body, planted cylinder legs, separately opening clamp jaws and moving hammer arm |
| 02 Moonlit Library | Atlas Warden | Book-shaped dimensional torso, folded page plates and hinged quill with grounded boots |
| 03 Coral Courier | Reef Skimmer | True underwater 3D orb body, tail, independent side fins and tapered coral dorsal shapes (no feet) |
| 04 Clocktower Relay | Pendulum Sentinel | Cylindrical clock body and depth offset clock face, braced boots and hinged hammer |
| 05 Seed Garden | Thorn Hopper | Seedpod orb body with tapered thorns, independent planted spring legs and opening leaves |

**What is integrated:** Model primitives/positions/pose samplers, local WebGL vertex/index buffers, actual 3D surface lighting, ground geometry, five interactive model selectors, idle/move/attack/hit/defeat demonstration states, orbit buttons/touch drag, reduced-motion behavior and visible unavailability on non-WebGL devices. Viewer and mesh module are cached by the service worker. The Games Room and Enemy Motion Lab link to the prototype studio. A new source regression test checks 3D model count, geometry/index validity, 25 modeled state samples, mock GPU command path, buffer lifecycle, no non-finite coordinates, and separation from the live gameplay engine.

**Performance and accessibility:** Browser-based WebGL 1 with no third-party runtime or network fonts. Viewer caps its drawing surface at 1200px width, handles context loss, pauses GPU rendering when the demonstration is paused, and respects reduced-motion preference unless a person explicitly opts into playback. This remains a preliminary mesh study, not a benchmarking pass on a real Android device.

**Explicit acceptance limit:** None of these experimental 3D meshes is yet installed in the 2.5D playable stages. The playable games still draw their own original specialized 2.5D Canvas enemy rigs, with all existing hitboxes and progression untouched. These models are *not* poster-reviewed feature-film-style enemy production meshes, not skinned/exported glTF assets, not cinematic 3D lighting/materials and not the movies. The experimental character studio is a separate opt-in QA surface, with no impact on Android FPS in the Games Room. No live WebGL screenshot or hardware-rendered playback has been inspected. Further stages require actually validating these models visually, preserving every game's original design rules, building high-quality 3D assets/animation, and optimizing an Android playback path without paid services.




## Batch 11 — five first-world base enemy rigs, preserving specialist variants

**New verified GitHub source:** `assets/animation/origin-world-enemy-rigs-v1.js` (original game-specific Canvas-2D procedural art). Five unique animated base enemy types are now integrated into the playable Games Room. These are **illustrated 2.5D enemy designs**, **not film-quality 3D models or finished animation clips**.

| Game | Original illustrated base enemy | State-driven body motion | Preserved pre-existing art |
| --- | --- | --- | --- |
| 01 Ember Foundry | Cinder Tongs | planted mechanical feet, clamp actuator, recoil sparks and anticipatory lunge | Foundry stage-specific enemies, individual behaviors and action artwork |
| 02 Moonlit Library | Atlas Warden | book-fold plates, page-blade attack and grounded deliberate stepping | Unique stage-specific library opponents and motion |
| 03 Coral Courier | Reef Skimmer | continuous underwater tail/pectoral-fin movement and connected reef fins (no false feet) | Existing uniquely authored reef swimmers and current mechanics |
| 04 Clocktower Relay | Pendulum Sentinel | brass-mass foot planting, articulated clock hand/hammer and real attack-cued swing | Existing stage-specific clock rivals and patterns |
| 05 Seed Garden | Thorn Hopper | crouched seedpod compression, independent spring legs, pounce and shell-attached leaf arcs | Existing Seed Garden special motion routines where applicable |

**Implementation safeguards:** `usesOriginRig(foe)` dispatches the new base models only to ordinary foe slots, leaving `foundryEnemy`, `libraryEnemy`, `reefEnemy` and `clockEnemy` special foes on their existing individually authored art. The new art follows the same game's distance-derived gait, attack anticipation, projectile-timed recoil, facing direction, and reduced-motion setting; no hitboxes, spawn locations, combat physics or level geometry changed. Visual-only post-hit defeated silhouettes fade and shrink for at most 0.42s without re-enabling physics. The existing sprite is retained as fallback if the module is unavailable. Original world-5 bonus motion accents are not double-drawn on the new body.

**Source/QA:** All five bodies were run through idle, movement, attack, recoil, facing-flip and reduced-motion mocked Canvas 2D render simulations, with balanced transform stacks and finite coordinates. The new module is loaded before the main runtime, registered in the Games Room's offline cache, and selectable from the Enemy Motion Lab's **Show playable rig** button. Unit tests additionally guard original stage-specific enemy preservation. GitHub source/Android compile and GitHub Pages results require the separately recorded workflow results. Tests cannot replace a real Android landscape game playthrough.

**Current state across Try #4:** 25/25 games have individually authored new **base** enemy motion rigs, in four separate art modules. Special enemy variants may still rely on older bespoke art rather than matching every new base rig. There are also 50 integrated **painted 2D scenery** images, with 112 further original scene-render slots planned across 162 stages. None of the 25 feature-film-quality 3D game overhauls or full 3D animated movies is complete. Do not claim actual live visuals, film model fidelity, FPS or Android device playability from repository-only evidence. All changes still respect the absolute $0 rule.




## Batches 9–10 — twenty original enemy motion families integrated (games 6–25)

**Scope completed in this session:** ten new original game-specific 2.5D procedural **enemy body illustrations and state-driven motion routines**, covering games 6–15. These are visual simulations drawn with the Canvas 2D API, **not** 3D polygon models, character-sheet turnarounds, movie-quality renderer outputs, or the required full movement clip libraries. No paid APIs or services.

| Game | Current individual enemy | New body-animation and attack language |
| --- | --- | --- |
| 06 Waterfall Climb | Mist Glider | Non-grounded water-veil airfoils, independent waterfall strands, dive bank and spray-on-recoil |
| 07 Lantern Festival | Lantern Juggler | Asymmetric silk sleeves, alternating hopping feet, linked lantern swing, simulated triple-toss windup |
| 08 Crystal Polarity | Flux Beetle | Four mechanical leg contacts, separate magnetic plates, extendable pole actuator and brief ion discharge |
| 09 Stage Beat | Bass Bouncer | Contact-grounded stomp pads, responsive drum-shell compression, hinged acoustic hammers and rhythmic attack rings |
| 10 Quarry Rescue | Slate Burrower | Layered sandstone quarry armor, embedded drill manipulators, turret-compatible fixed base and rock dust |
| 11 Sunset Wind Sail | Gale Kite | Sailcloth airfoils, independent windward streamers, body lean and swoop without fictional walking feet |
| 12 Cloud City | Nimbus Guard | Cloudglass plates, cushioned grounded footfalls, independently flexing shoulders and charged hover-like impact |
| 13 Thunder Harbor | Coil Ray | Copper resonator coils, braced feet, charging core and short branching discharge synchronized to actual firing |
| 14 Autumn Trail | Bramble Stalker | Asymmetric leaf mantle, two stalking feet, extending bramble claw and fall-leaf reaction |
| 15 Inverted Observatory | Orbit Watcher | Star-chart body rings, travel-dependent support feet and connected gravity-pulse coil |

**Source modules:**
- `assets/animation/five-world-enemy-rigs-v1.js` (game indices 5–9, original art).
- `assets/animation/cloud-trail-enemy-rigs-v1.js` (indices 10–14, original art).
- Existing separate `mid-world-enemy-rigs-v1.js` and `late-world-enemy-rigs-v1.js` (indices 15–24) are unchanged except the single shared renderer now routes per-game correctly.

**Integration:** The Games Room HTML loads each module before the main script. The game renderer selects an authored body per **exact game index**. It preserves existing foe position, enemy attack AI, platform geometry, sprite fallback, physics collisions and scoring. All twenty custom enemy bodies respond to actual distance-traveled gait, strike anticipation, shot recoil and facing (mirrored). Visually defeated enemies are removed from gameplay immediately and rendered for at most 0.42s as a non-colliding fading image, respecting reduced motion. On a missing module, the engine falls back to its pre-existing enemy artwork without stopping the game. Old game 6–10 supplemental motion accents are suppressed when their original body art loads to prevent duplicated overlapping appendages.

**Verification gates:** Added independent unit tests for ten new vector-rig families, original enemy-family names, script initialization order, 2D canvas path safety and balanced `save/restore`, game-range isolation, offline caching and accurate source registration. A manual mocked-canvas state test also passed for all ten rigs. GitHub's source/Android compile workflow and Pages deployment need separate recorded outcomes; even a passing result does not prove real Android visual smoothness, correct 3D render fidelity or that counterpart source games were visually inspected.

**Remaining substantial work:** Game indices 0–4 have not received comparable newly authored enemy motion-rig families in these batches. All 25 still need fully modeled original poster-accurate 3D heroes and enemies with per-action animation clips, full-stage original 3D scenery, live Android playtesting, optimized backgrounds, and complete narrated/sung/edited movie render outputs with captions. No movies were rendered or published in this session.



## Batch 8 — enemies for games 16–20 (original playable 2.5D vector rigs)

Five new **separate** original enemy silhouettes and behavioral body-motion algorithms are now integrated into the playable Stage 1–6 builds. Source: `assets/animation/mid-world-enemy-rigs-v1.js` (new; latest code `6bc18e4`); integration: `assets/pawcade-side-scroll-no-badges-v2.js` (`ebd3453`). This is **not** a finished feature-film 3D animation pass.

| Game | Current reference identity | Individual new enemy | Integrated motion design | Remaining |
| --- | --- | --- | --- | --- |
| 16 Bamboo Village | Ori-inspired aerial traversal | Cane Striker | Airborne-tucked legs instead of false ground contacts, bamboo pole lunge, leaf armor, windup, projectile recoil | True wing/body 3D and full vault/land render |
| 17 Steamworks | Cuphead-inspired shoot/dodge | Pressure Piston | Iron-boiler body, real attack-cued telescopic piston, walking wheels vs turret base, local steam relief | 3D mechanical hierarchy, unique boss motions |
| 18 Snow Village | Aladdin-inspired platform jumps | Frost Lantern | Prism lantern, planted braking crampons, frost-cone breath at recoil, weighted body compression | 3D glass, snow interactions, complete impact clips |
| 19 Canyon Crossing | Prince of Persia-inspired timed traversal | Dust Runner | Hinged sandstone plates, distance-based alternating grounded toes, lunge and short dust wake | 3D leg rig, step tests and attack frame audit |
| 20 Submarine Dock | Contra III-inspired shooting | Abyss Probe | Separate hinged propulsor fins, rotating tail propeller, face-level sonar pulse, aquatic (no fake feet) | 3D underwater movement, full body and sonar effects |

**Animation inputs:** Existing per-enemy world-position stride, facing direction, projectile/anticipation/recoil, landing phase, bash hit state, reduced-motion setting, and frame-clock. All five design bodies are original and not a copy of any assigned counterpart game artwork. Two unaffected game groups remain isolated: 1–15 preserve their previous artwork, and 21–25 keep their own distinct procedural rigs. Steamworks turret gameplay behavior and hitboxes remain unchanged.

**Defeat logic:** The previously added 0.42s non-colliding visual fade/scale now applies to both mid- and late-world enemy rigs. Gameplay enemies become dead immediately; the visual is disabled by reduced-motion preference. Alpha is properly multiplied, preserving outer defeat compositing. Missing animation modules fall back to the existing atlas without stopping gameplay.

**Integration and QA:** The Games Room loads the new module before runtime; service worker precaches both revised URLs and updates its cache version. Automated test fixtures exercise all five designs with idle, walking, attack and hit, 0 or 1 contact transitions, flipped facing, and safe canvas save/restore, and check their selection boundaries. One original unit test failed because its VM sandbox lacked `window`; repaired in `5fe3341`. Latest GitHub CI/Pages results must be checked separately; live Android landscape playback, frame timing and visual enemy hit alignment remain **unverified**. Zero paid dependencies.

### Remaining strategic gap

10/25 games have newly integrated individualized **illustrated** enemy rigs (games 16–25); the other 15 retain earlier enemy movement/visuals without new designs in these batches. 25-game final film-quality 3D geometry/lighting/renders and full motion clips have not been completed. 25 complete movies also remain unfinished.



## Batch 7 — playable enemy motion integration, games 21–25

**What actually changed:** The playable canvas now draws five distinctly authored, runtime-procedural **2.5D illustrated enemy rigs** rather than falling back to the generic 5-column sprite atlas in games 21–25. Art source: `assets/animation/late-world-enemy-rigs-v1.js` (commit `fbe47754`). Game integration: `assets/pawcade-side-scroll-no-badges-v2.js` (commit `9f903e6`). Five individualized enemy families follow `assets/enemy-art-motion-registry.json`:

| Game | Original enemy family | Implemented 2.5D body motion | Known limitations |
| --- | --- | --- | --- |
| Neon Circuit | Pixel Phantom | Localized glitch plates, roller gait based on world displacement, telescoping strike | Not rendered 3D; teleport/glitch effects and per-archetype variants incomplete |
| Marble Temple | Mosaic Golem | Carved multi-tile shell, attack brace and timed shield/hit extension, plated grounded feet | Not 3D; no real rolling collision behavior |
| Swamp Ferry | Bog Lantern | Sprung reed feet, moss body compression, growing luminous lure and attack pulse | Not 3D; spore FX and physics interactions incomplete |
| Sunflower Flight | Pollen Drifter | Independent hinged petal wings, flight flutter, strike tip and trailing pollen | Not 3D; full swoop animation and edge transitions unverified |
| Starship Cargo | Cargo Mimic | Planted box stabilizers, independently hinged crate panels, extending grapple and recoil | Not 3D; no physical crate folding or mechanical joints in 3D |

**Simulation synchronization:** Existing foe gait is distance based; walking/airborne/attack/recoil/landing render parameters come from the actual gameplay tick rather than separate timers. Face-left mirrors the entire authored rig. The attack pose follows projectile release. The module fails safely back to the original gameplay atlas when unavailable. Enemy hitboxes, spawn points, AI attack simulation, joystick, score, and progression are unchanged.

**Defeat transition:** `markFoeDefeated` records the defeated enemy's last visible world position at the actual kill. The foe's gameplay `dead` flag switches immediately, preserving collision/attack removal, while its original rig shrinks/fades for at most 0.42 seconds, unless reduced-motion is enabled. No "death" body remains to block the route or resurrect at checkpoint load. New test cases cover rig canvas draw safety, all five runtime families, reduced-motion behavior, and kill snapshot.

**Deployment:** `pawcade-side-scroll.html` loads the new motion module before the game runtime and `sw.js` precaches both with aligned cache-busting versions. GitHub CI and GitHub Pages results are recorded separately; source tests do not substitute for real Android landscape and visual playback verification.

**What remains:** The enemy vector rigs are **not** feature-film quality 3D models, nor full original motion art for takeoff, all landings, hit, and defeat. Hero models, poster-matched rigs, lighting, enemy archetype varieties, tail/cape checks and all 25 finished movies are still outstanding. No paid services were used.



## Batch 6 — all six stage-scene props for each of games 21–25

**Repository integration:** 20 original SVG scenery props created and installed for Stages 3, 4, 5 and 6 of Neon Circuit, Marble Temple, Swamp Ferry, Sunflower Flight and Starship Cargo. These add to their first two stage props already installed. Each game now has one **game- and stage-specific 2D-painted scenery prop in each of its six stages**. They are not 3D models or rendered movie frames.

| Game | Stage 3 art | Stage 4 art | Stage 5 art | Stage 6 art |
| --- | --- | --- | --- | --- |
| Neon Circuit | Western Run turbo sign | Haunted Circuit ghost mirror | Factory Dash power-lane meter | Tower Reset finish clock |
| Marble Temple | Marble Chapel moon window | Inner Halls pendulum | Phantom Ship moon lantern | Silver Gallery key throne |
| Swamp Ferry | Gem Mines crystal winch | Snowbound Pass ferry marker | Moon Outpost signal | Return to the Manor lighthouse |
| Sunflower Flight | Threaded Treats ribbon wheel | Felt Ocean petal buoy | Snowy Seams warmth stitch | Patchwork Orbit final bloom |
| Starship Cargo | River Crossing coolant valve | City Siege defense repeater | Factory Assault safety keypad | Cargo Stronghold rescue pod launch |

**Current exact placement registry:** `docs/side-scrollers-current-asset-placement.md`. **Full stage audit:** `docs/side-scrollers-full-stage-art-audit.md`.

### Up-to-date authoritative totals

- **25 games** retain their individually assigned reference mechanics and current world geometry.
- **162 stage slots** in the actual current source stage definitions.
- **50 unique original static scene images integrated into the playable canvas** (25 Stage 1 images plus Stages 2–6 in the last five games).
- **112 additional stage-specific render slots not yet produced** (proposed WebP paths are only a plan).
- **25 full 3D animated movies unfinished.** Five written beat drafts are preparation only, with no rendered animation, voice track, captioned final video or soundtrack.
- Source tests verify unique paths, world positions on authored support tops, stage offsets, cache registration and JavaScript syntax. Actual camera composition, device FPS, landings, enemy animation and movie playback are **not verified by these source checks**.

**Implementation commits:** Stage 3/4 `2fcc14c5`, Stage 5/6 `04e0683e`; HTML and service-worker cache versions updated. Unit tests extended and the discovered room-name parsing error fixed at `dd9767a9`. GitHub Pages workflow outcome and full Android compilation must be checked separately before any claim that this final batch is live and production-safe. No paid services used.


## Batch 5 — all 25 games have individually authored first-stage scenery

**Verified in GitHub source:** Games 21–25 each have an original Stage 1 SVG scenery prop and a different Stage 2 SVG art prop. All 10 are actually wired into the existing canvas runtime, selected by game index and rendered behind gameplay geometry with stage-appropriate world positions. No gameplay collision changes were made. The active runtime and HTML cache version are `assets/pawcade-side-scroll-no-badges-v2.js?v=stage1and2-art-31e6f5e`; all 30 active new assets are precached by `sw.js`.

| Game | Stage 1 integrated | Stage 2 integrated | Movie preparation |
| --- | --- | --- | --- |
| 21 Neon Circuit | Lobby Sprint photo-finish gate | Dungeon Heat overdrive coil | `docs/movie-preproduction/neon-circuit-screenplay-beats-v0.1.md` |
| 22 Marble Temple | Ruined Village moon seal | Moon Gate key relief | `docs/movie-preproduction/marble-temple-screenplay-beats-v0.1.md` |
| 23 Swamp Ferry | Jungle Relics firefly ferry post | Haunted Manor ghost lamp | `docs/movie-preproduction/swamp-ferry-screenplay-beats-v0.1.md` |
| 24 Sunflower Flight | Grass Patch pollen vane | Stitched Desert thread spool | `docs/movie-preproduction/sunflower-flight-screenplay-beats-v0.1.md` |
| 25 Starship Cargo | Outpost Landing rescue pod panel | Mountain Convoy supply uplink | `docs/movie-preproduction/starship-cargo-screenplay-beats-v0.1.md` |

**30 exact installed placements across the 25 games:** `docs/side-scrollers-current-asset-placement.md`. **Full 162-stage source geometry audit and 132 still-missing original setpiece render slots:** `docs/side-scrollers-full-stage-art-audit.md`. All 162 proposed/installed locations were checked against the authored stage support surfaces in source.

**Testing:** The repository's full source/Android compile workflow completed successfully at `0a6531a`; GitHub Pages deployment also passed that check. Those checks are not physical Android gameplay testing, nor proof that the website's latest doc-only update was visually inspected. Live HTML, photo-real 3D render fidelity, character/enemy motion, FPS, audio, captions, and finished 25 movies remain unverified/incomplete. The five movie files created in this batch are *written beat outlines*, not animatics, screenplays signed off for production or videos.

**Only $0 tools and services used.** No game counterparts' proprietary textures, source code, levels or audio were copied.



> **Current authoritative placement status (Batch 4, Nov 14):** The source later overrides some early chapter titles and room plans. The current stage names and placement table below supersede all earlier historical batch captions, stage labels, and fixed-position claims in this document. They are tested against the repository's live code configuration, **not live browser/device gameplay**. All currently integrated additions are SVG scenery, **not feature-film 3D**, and none of the 25 game movies is finished.

## Current 20-game Stage 1 asset registry and integration geometry

| Game | Actual current Stage 1 | Integrated asset | World top-left | Draw scale | Bottom-center pivot (world x,y) | Collision surface | Layer / trigger |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 Ember Foundry | Foundry Trail | `assets/scenes/ember-foundry/cold-intake-beacon.svg` | (575, 131) | 160×170 | (655, 301) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 02 Moonlit Library | Convoy Ambush | `assets/scenes/moonlit-library/atlas-lectern.svg` | (535, 146) | 170×170 | (620, 316) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 03 Coral Courier | Home Reef | `assets/scenes/coral-courier/pearl-vent.svg` | (590, 156) | 180×170 | (680, 326) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 04 Clocktower Relay | Coastal Run | `assets/scenes/clocktower-relay/sunrise-gear.svg` | (620, 156) | 170×170 | (705, 326) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 05 Seed Garden | Seedship Deck | `assets/scenes/seed-garden/seed-lantern.svg` | (730, 156) | 160×170 | (810, 326) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 06 Waterfall Climb | Forest Rescue | `assets/scenes/waterfall-climb/spray-bridge-icefall.svg` | (605, 97) | 170×170 | (690, 267) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 07 Lantern Festival | Spring Breeze | `assets/scenes/lantern-festival/parade-gate-lantern.svg` | (725, 112) | 170×170 | (810, 282) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 08 Crystal Polarity | Transporter Deck | `assets/scenes/crystal-polarity/inverted-intake-core.svg` | (865, 156) | 170×170 | (950, 326) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 09 Stage Beat | Stereo Steps | `assets/scenes/stage-beat/sound-check-resonator.svg` | (520, 156) | 170×170 | (605, 326) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 10 Quarry Rescue | Landing Gantry | `assets/scenes/quarry-rescue/lift-house-winch.svg` | (535, 118) | 170×170 | (620, 288) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 11 Sunset Wind Sail | Windmill Village | `assets/scenes/sunset-wind-sail/sunset-pier-wind-sock.svg` | (650, 104) | 170×170 | (735, 274) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 12 Cloud City | Forsaken Towers | `assets/scenes/cloud-city/cloud-ferry-beacon.svg` | (490, 108) | 165×170 | (572.5, 278) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 13 Thunder Harbor | Plains Approach | `assets/scenes/thunder-harbor/breakwater-lightning-rod.svg` | (570, 125) | 170×170 | (655, 295) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 14 Autumn Trail | Egg-Toss Meadow | `assets/scenes/autumn-trail/feather-trail-marker.svg` | (625, 77) | 170×170 | (710, 247) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 15 Inverted Observatory | Surface Approach | `assets/scenes/inverted-observatory/lower-dome-star-lens.svg` | (610, 112) | 170×170 | (695, 282) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 16 Bamboo Village | Spirit Glade | `assets/scenes/bamboo-village/bamboo-gate-lantern.svg` | (610, 109) | 160×170 | (690, 279) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 17 Steamworks | Root Cellar | `assets/scenes/steamworks/intake-valve-pressure-console.svg` | (560, 95) | 170×170 | (645, 265) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 18 Snow Village | Market Rooftops | `assets/scenes/snow-village/hearth-trail-ember-marker.svg` | (590, 114) | 170×170 | (675, 284) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 19 Canyon Crossing | Prison Steps | `assets/scenes/canyon-crossing/rope-bridge-winch.svg` | (565, 114) | 170×170 | (650, 284) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |
| 20 Submarine Dock | Street Insertion | `assets/scenes/submarine-dock/street-insertion-comms-post.svg` | (340, 105) | 170×170 | (425, 275) | Existing Stage 1 support, visual only | Passive rear world plane; no clip |

All Stage 1 placements have 0 gameplay collision of their own. Each prop's visual base is aligned with the authored room's walkable top at its center in `assets/platform-worlds.js`, with collision geometry owned by the platform runtime. Draw after parallax layers but before gameplay walls, tunnels and platforms; no motion trigger yet. Because these are static painted illustrations, motion clips, attack impact frames, cape/tail deformation, and 3D lighting are **pending**.

## Batch 4 — games 16–20

- **16 Bamboo Village:** Spirit Glade, original bamboo lantern gateway integrated; future 3D Ivy motion and stage art pending.
- **17 Steamworks:** Root Cellar, original industrial pressure console integrated; future Bolt and enemy 3D motion pending.
- **18 Snow Village:** Market Rooftops, original ember-marker sign integrated; future Frost 3D motion and environments pending.
- **19 Canyon Crossing:** Prison Steps, original canyon rope-winch scene prop integrated; future Stone 3D motion and level-specific threats pending.
- **20 Submarine Dock:** Street Insertion, original street comms post integrated; older uninstalled sonar buoy retained as concept art (not part of playable Stage 1).

**Source verification:** All twenty placement bottoms match at least one first-room support top using the current overridden source room plans; all active SVG paths are distinct and listed for offline caching; runtime JS syntax is valid. Automated regression test at `tests/platform-worlds.test.cjs`. **Live Pages, Android, enemy collision/animation and all movie/audio/caption checks remain not verified**.


Updated 2026-11-14, GitHub default branch `main`. This is a production-status record, **not** a claim of Android playtesting, cinematic 3D assets, or completed movies.

## Reference authority
- Use `docs/side-scrollers-25-individual-reference-review.md` and `assets/platform-worlds.js` for counterpart-to-game identity, story, stage names, and geometry.
- Counterpart references are mechanics guidance only. Do not copy copyrighted maps, sprites, voices, or audio.
- Character visuals must follow the approved master poster; no unverified replacement of canon character models.
- The runtime draws in an 800 × 380 landscape canvas, with world ground at y=326.
- Only free tooling and existing public GitHub Pages hosting.

## Batch 1 — five individually authored Stage 1 background props

These are **original vector-painted scenery assets, not 3D renders or character animations**. Placement is behind game collision shapes, deliberately decorative, with no gameplay hitbox changes. Stage 1-only coordinates are in the first section of each game (world x 590–770). All stage names are taken from the repo's chapter data.

| Game # | Game | Stage | Asset | World position | Scale | Pivot | Collision surface | Depth layer | Animation trigger | Current status | Subject |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Ember Foundry | 1 — Cold Intake | `assets/scenes/ember-foundry/cold-intake-beacon.svg` | (590, 156) upper-left; base (680, 326) | 180 × 170 world units; source 180 × 170, 1× | Bottom center (0.5, 1) | None; existing `platforms` geometry controls collision | Behind world walls, tunnels, and platforms, ahead of parallax | Passive stage scenery, always on when loaded | SVG source added; runtime integrated; source checks only | furnace evacuation beacon |
| 02 | Moonlit Library | 1 — Return Desk | `assets/scenes/moonlit-library/atlas-lectern.svg` | (590, 156) upper-left; base (680, 326) | 180 × 170 world units; source 180 × 170, 1× | Bottom center (0.5, 1) | None; existing `platforms` geometry controls collision | Behind world walls, tunnels, and platforms, ahead of parallax | Passive stage scenery, always on when loaded | SVG source added; runtime integrated; source checks only | moon atlas reading lectern |
| 03 | Coral Courier | 1 — Tide Pools | `assets/scenes/coral-courier/pearl-vent.svg` | (590, 156) upper-left; base (680, 326) | 180 × 170 world units; source 180 × 170, 1× | Bottom center (0.5, 1) | None; existing `platforms` geometry controls collision | Behind world walls, tunnels, and platforms, ahead of parallax | Passive stage scenery, always on when loaded | SVG source added; runtime integrated; source checks only | pearl breathing vent |
| 04 | Clocktower Relay | 1 — Market Gears | `assets/scenes/clocktower-relay/sunrise-gear.svg` | (590, 156) upper-left; base (680, 326) | 180 × 170 world units; source 180 × 170, 1× | Bottom center (0.5, 1) | None; existing `platforms` geometry controls collision | Behind world walls, tunnels, and platforms, ahead of parallax | Passive stage scenery, always on when loaded | SVG source added; runtime integrated; source checks only | sunrise timing gear |
| 05 | Seed Garden | 1 — Seed Nursery | `assets/scenes/seed-garden/seed-lantern.svg` | (590, 156) upper-left; base (680, 326) | 180 × 170 world units; source 180 × 170, 1× | Bottom center (0.5, 1) | None; existing `platforms` geometry controls collision | Behind world walls, tunnels, and platforms, ahead of parallax | Passive stage scenery, always on when loaded | SVG source added; runtime integrated; source checks only | seed lantern |

**Integration:** `assets/pawcade-side-scroll-no-badges-v2.js` loads only the selected game's corresponding `firstStageLandmarkPaths` entry. The canvas draws the asset when on-screen before walls, tunnels, and platform surfaces. `pawcade-side-scroll.html` has a bumped runtime URL. Failed or late image loads leave the prior scenery in place. The placement is visual-only, not a claim of matching an external game's platform layout.

**Still missing in these five games:** detailed stage-by-stage asset placement for the rest of each level; approved poster-matched 3D hero renders; individual enemy meshes and motion clips; platform-specific art revisions; 3D environments; stage-specific film assets; dialogue/audio/captioned film exports; real-device performance and controls checks.


## Batch 2 — five additional original Stage 1 environment set pieces

All 5 are **vector-painted concepts integrated as passive scene props**. They are not 3D assets, colliders, animated character clips, or cinematic footage. Drawn at world upper-left (590,156), 180 × 170 world units, bottom-center pivot (680,326), no collision, behind walls/tunnels/platforms; visible on entering world x590–770, with no animation trigger. Each asset is requested only by its own game index.

| Game | Stage | Original integrated art path | Subject | Source check | Live/device check |
| --- | --- | --- | --- | --- | --- |
| 06 Waterfall Climb | 1 Spray Bridge | `assets/scenes/waterfall-climb/spray-bridge-icefall.svg` | Frozen falling-water bridge accent | Created and wired | Pending |
| 07 Lantern Festival | 1 Parade Gate | `assets/scenes/lantern-festival/parade-gate-lantern.svg` | Festival lantern arch | Created and wired | Pending |
| 08 Crystal Polarity | 1 Inverted Intake | `assets/scenes/crystal-polarity/inverted-intake-core.svg` | Inverted-gravity crystal machine | Created and wired | Pending |
| 09 Stage Beat | 1 Sound Check | `assets/scenes/stage-beat/sound-check-resonator.svg` | Rhythm resonator stack | Created and wired | Pending |
| 10 Quarry Rescue | 1 Lift House | `assets/scenes/quarry-rescue/lift-house-winch.svg` | Lift and rescue winch | Created and wired | Pending |

**Integration commit:** `19510f1`. **HTML cache-bust commit:** `606583c`. Source JS syntax passed. Two live GitHub Pages GET attempts through the available web tool returned inaccessible/internal error; this is **not proof of either success or failure of the real deployment**. Android/collision/enemy-performance testing is still outstanding. For each of these five games, detailed stage-by-stage placements beyond the first-stage marker, film production, 3D art, attack clips, and finished movie delivery remain to do.

## Other games — not changed in batches 1–2

- 06 Waterfall Climb: Stage 1 prop integrated in Batch 2; Stage 2+ audit, 3D animation and movie pending.
- 07 Lantern Festival: Stage 1 prop integrated in Batch 2; Stage 2+ audit, 3D animation and movie pending.
- 08 Crystal Polarity: Stage 1 prop integrated in Batch 2; Stage 2+ audit, 3D animation and movie pending.
- 09 Stage Beat: Stage 1 prop integrated in Batch 2; Stage 2+ audit, 3D animation and movie pending.
- 10 Quarry Rescue: Stage 1 prop integrated in Batch 2; Stage 2+ audit, 3D animation and movie pending.
- 11 Sunset Wind Sail: Stage 1 SVG landmark integrated in Batch 3; later-stage asset, collision audit and animated movie pending.
- 12 Cloud City: Stage 1 SVG landmark integrated in Batch 3; later-stage asset, collision audit and animated movie pending.
- 13 Thunder Harbor: Stage 1 SVG landmark integrated in Batch 3; later-stage asset, collision audit and animated movie pending.
- 14 Autumn Trail: Stage 1 SVG landmark integrated in Batch 3; later-stage asset, collision audit and animated movie pending.
- 15 Inverted Observatory: Stage 1 SVG landmark integrated in Batch 3; later-stage asset, collision audit and animated movie pending.
- 16 Bamboo Village: counterpart assignment and source stages available; per-stage art/collision audit and original assets not completed in this batch; new 3D movie not rendered.
- 17 Steamworks: counterpart assignment and source stages available; per-stage art/collision audit and original assets not completed in this batch; new 3D movie not rendered.
- 18 Snow Village: counterpart assignment and source stages available; per-stage art/collision audit and original assets not completed in this batch; new 3D movie not rendered.
- 19 Canyon Crossing: counterpart assignment and source stages available; per-stage art/collision audit and original assets not completed in this batch; new 3D movie not rendered.
- 20 Submarine Dock: counterpart assignment and source stages available; per-stage art/collision audit and original assets not completed in this batch; new 3D movie not rendered.
- 21 Neon Circuit: counterpart assignment and source stages available; per-stage art/collision audit and original assets not completed in this batch; new 3D movie not rendered.
- 22 Marble Temple: counterpart assignment and source stages available; per-stage art/collision audit and original assets not completed in this batch; new 3D movie not rendered.
- 23 Swamp Ferry: counterpart assignment and source stages available; per-stage art/collision audit and original assets not completed in this batch; new 3D movie not rendered.
- 24 Sunflower Flight: counterpart assignment and source stages available; per-stage art/collision audit and original assets not completed in this batch; new 3D movie not rendered.
- 25 Starship Cargo: counterpart assignment and source stages available; per-stage art/collision audit and original assets not completed in this batch; new 3D movie not rendered.


## Batch 3 — five further game-specific Stage 1 set pieces (games 11–15)

**Production classification:** original SVG scenery (vector illustration), not 3D geometry, rendered movie footage, collision shapes, or character animation. All assets use world rectangle x=590–770, y=156–326 (180×170 world pixels), pivot bottom-center (680,326), decorative/non-colliding world-depth art behind walls, tunnels and platform collision tops; passive draw when onscreen. Exact source paths:

| Game | Stage | Counterpart mechanics | Asset path | Asset role | Repository verification |
| --- | --- | --- | --- | --- | --- |
| 11 Sunset Wind Sail | 1 Sunset Pier | Klonoa: Door to Phantomile — airlift/wind | `assets/scenes/sunset-wind-sail/sunset-pier-wind-sock.svg` | Sunset wind direction vane | SVG exists, path wired |
| 12 Cloud City | 1 Cloud Ferry | Celeste — dash/checkpoint | `assets/scenes/cloud-city/cloud-ferry-beacon.svg` | Ferry arrival signal beacon | SVG exists, path wired |
| 13 Thunder Harbor | 1 Breakwater | Shovel Knight — pogo/combat | `assets/scenes/thunder-harbor/breakwater-lightning-rod.svg` | Lightning conductor | SVG exists, path wired |
| 14 Autumn Trail | 1 Feather Trail | Yoshi's Island — arced throws | `assets/scenes/autumn-trail/feather-trail-marker.svg` | Migration path waymarker | SVG exists, path wired |
| 15 Inverted Observatory | 1 Lower Dome | Super Metroid — exploration | `assets/scenes/inverted-observatory/lower-dome-star-lens.svg` | Observatory star lens | SVG exists, path wired |

**Integration commit:** `ab710080`. **Runtime version commit:** `b54fa5c2`. **Checks:** JavaScript parsed without syntax errors, each SVG checked for opening/closing tags, file retrieval successful, runtime selection and HTML asset-version reference present. **Not checked:** 3D appearance, actual visual rendering in a browser, live Pages asset delivery, platform alignment in Android landscape, FPS, enemy trigger/animation, stage clear, film output. Stage 2+ and movies for each of these five remain pending. No paid services used.

## Movie production ledger

For **all 25 games**, final screenplay, approved voice recordings, storyboard-to-animatic timing, 3D character animation, soundtrack, dialogue sync, captions, finished exports, and live playback checks are **pending** unless another verified file-specific report establishes otherwise. The current source story arcs and chapter names in `assets/platform-worlds.js` are inputs, not finished movies. Never mark a concept still or screenplay as a completed movie.

## Verification matrix

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Five original source assets created | PASS (GitHub commit records) | Individual SVG files at their game-specific paths |
| Each image requested only for its own game | PASS (source inspection) | `index < firstStageLandmarkPaths.length` and index-specific selection |
| Scene draw order protects collider top readability | PASS (source inspection) | Draw before `walls`, `tunnels`, `localPlatforms` |
| Trigger path stays at Stage 1 | PASS (source position) | All five assets at world x 590–770, within the first chapter |
| Runtime JS syntax | PASS (JS parser check) | `new Function(...)` over updated runtime |
| GitHub Pages actually serves all five paths | NOT VERIFIED | Must use browser/HTTP on deployed site |
| Android landscape gameplay, framerate, multitouch | NOT VERIFIED | Requires actual landscape device run |
| Landing/collision + enemy motion in changed stages | NOT VERIFIED | Requires live interactive playthrough |
| Movie audio, captions, visuals | NOT VERIFIED | No finished new movie delivered |

## Next verification gates

1. Open the five `?game=0` through `?game=4` Games Room routes in landscape; verify each Stage 1 landmark visibly aligns with terrain without masking a landing.
2. Observe network responses and console errors for all five SVGs; check slow-network behavior and 404 fallback.
3. Run the repo's test suite and Android device tests; correct visual placement or frame-time regressions before declaring this batch fully verified live.
4. Audit Stage 2 onward individually using that game's stage geometry and actual reference mechanic. Write exact collision and placement records before extending art. Create the original rendered 3D assets separately from vector sketches.
