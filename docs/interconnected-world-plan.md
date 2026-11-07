# Crystal Catacombs — Interconnected World Foundation

Status: design and source audit started; **not deployed**.

## Existing game baseline
- Entry: `super-paw-3d.html` (~510 KB HTML)
- Existing external scripts include `crystal-professional.js`, `cross-platform.js`, `app.js`, `face-review.js`, `assets/super-paw-rig.js`, `assets/hero-turnaround.js`.
- Existing UI references quests, districts, roads, joystick, inventory and save storage. These are not yet validated end-to-end.
- Preserve the main branch and current live GitHub Pages game until tested.

## Architecture decisions
1. One logically continuous overworld; no level-select transitions between outdoor regions.
2. Chunked world streaming (only nearby geometry and NPCs active) to fit Android memory and GPU budgets.
3. Road network stored as graph of intersections, curved road segments, bridges and trails. Roads must join without seams.
4. Towns, forest, rivers, mountain paths and cave entrances connect via traversable roads. Cave interiors may use a controlled loading transition while preserving world continuity.
5. Stable world coordinates and persistent IDs for quests, shops, NPCs, loot and save migration.
6. Feature-film-stylized visuals with scalable quality tiers, not a claim of photorealism.
7. Maintain existing controls, combat, inventory, quest and save functionality through incremental integration.

## First implementation milestone
- Inspect all scripts and identify world state, movement, map rendering, camera, NPC spawns and persistence hooks.
- Extract a small testable road graph with two towns, forest junction, bridge and cave entrance.
- Add graph validation: no disconnected required locations; no dangling road endpoints; pathfinding succeeds.
- Render this as an opt-in preview on the feature branch.
- Test on Android: movement, collision, restart, quest tracking, minimap, save/load, frame time.
- Only then expand region count and merge after approval.

## Safety
- No paid dependencies, services or automatic publishing.
- No destructive rewrite of current game.
- Do not treat this design document as a playable implementation.
