# Super Paw Heroes — The Clockwork Adventure

## Approved direction, 2026-11-15
Separate new original adventure, not edits to the 25 Try-4 games. Inspired by the broad exploration, combat, puzzle and equipment progression qualities of Ocarina of Time. Original maps, story, dialogue, puzzles, music and artwork. User approved black-and-white Steamboat Willie era rubber-hose art. Maintain Whisker and Luna as cat superhero best friends. NO DOG ALLIES. Baron Brasswhirl is the eventual final antagonist; do not invent a replacement design for Baron without his approved reference. Smooth continuous movement, third-person world depth, Android landscape controls, $0 services only.

## Permanent project identity
Site ID: appgprj_6af9f02c2f988191ba5e4c1231ceec90
Source: Sites-managed git repository. Use Sites get_site and source credential to reopen this exact project; do not create a second site on “continue.”
Title: Super Paw Heroes · The Clockwork Adventure

## Scope and honesty
This first implementation is an early Chapter 1 prototype, not the full-length adventure and not final art fidelity. The approved concept image is a visual target. Procedural toon models establish gameplay; they need further artistic refinement to match the illustration. No claims of complete asset production, exact Zelda recreation, tested Android frame rate, or finished full game.

## Full adventure production plan
1. Establish playable village, woodland route, puzzle dungeon and clockwork guardian; save state and source.
2. Refine Whisker/Luna models, hands, faces, costumes and motion toward approved reference; multiple facial expressions and action animations.
3. Expand original village interiors, NPC quests and meaningful equipment progression.
4. Build further original regions and dungeons with their own art, equipment, puzzles and bosses.
5. Add Baron using approved reference, final dungeon and ending only after story and regions are built.
6. Original audio, accessibility, tuning, Android device performance checks, complete playthrough and recovery testing.

## Resume procedure
Read this file, ASSETS.md and latest source; inspect existing deployed build and git status. Continue from verified current state. Keep source and art in this repository; update this checkpoint each batch. Preserve no-dog-allies rule. Do not silently downgrade world depth to a side-scroller or claim concept images are real screenshots.

## Checkpoint 1 — implemented
- Three original traversable 3D areas: Bellwether Village, Whispering Woods, Clockwork Temple.
- Whisker playable, Luna and Mallow (cat) NPCs; no dog allies.
- Smooth acceleration and turning; animated limbs, cape, tail; attack, dodge and nearby target lock; camera drag; Android joystick/action UI.
- Three village winding gears; 34 collectible coins; shop healing and attack upgrade; three clockwork beetles; bridge mechanism; original middle-low-high bell puzzle; guardian encounter; first-chapter ending.
- Local autosave, continue, JSON export/import validation, pause, sound toggle, fullscreen and regional map.
- Original generated cobblestone asset integrated in scene; concept artwork used on title screen; self-contained runtime libraries.
- Main WebGL toon renderer plus Canvas compatibility fallback. All assets loaded locally, no paid APIs or runtime CDN dependency.

## Verification
- `npm run check` and `node --check dist/software-renderer.js`: passed.
- `node tests/smoke.mjs`: passed. Runs actual game logic with a stub renderer. Checks movement, collision-grid reachability of required objectives, gear pickup, persistence, invalid save rejection, bridge/river restrictions, temple gate, wrong/correct bell sequence, guardian damage/defeat, chapter ending and shop healing.
- Browser checked title, start, fallback scene rendering, generated texture integration, map, continue from saved progress, and control responses. The cloud browser explicitly disables WebGL, so primary WebGL visuals and real Android frame rate remain UNVERIFIED. A complete manual browser playthrough is still pending.
- Fixed during QA: module configuration, fallback label scaling, foreground tree occlusion, grayscale shading, and requiring the great bell interaction after defeating the guardian.

## Next work
Prioritize art fidelity and actual Android playtesting before expanding more regions. Current models/environment are visibly early prototype geometry and do not yet match the approved hand-drawn concept. Need richer original silhouettes, facial animation, directional combat effects, more natural paths, building interiors, optimized draw calls, camera obstruction handling for buildings, and improved touch targeting. Luna is currently an NPC; playable switching and follow-companion behavior remain unimplemented. No original soundtrack/voices yet, only simple generated audio feedback. Baron is not yet modeled or implemented; preserve him for the eventual full-adventure finale and fetch approved reference first. Do not present this first chapter as the full game or all assets finished.
