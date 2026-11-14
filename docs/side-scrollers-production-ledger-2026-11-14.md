# Super Paw Heroes — 25-game art and film production ledger


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
