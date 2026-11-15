# Approved enemy appearance — all 25 Super Paw Heroes side-scrollers

**Current user-directed rollback (November 14, 2026):** The newer angular, simplified, experimental procedural enemy bodies changed the creature designs too far from the earlier crab-creature-era look. Restore the **earlier on-screen creature/sprite appearances for EVERY ONE of the 25 playable games**. This is not permission to put the identical crab model in every game; each game must retain its original creature identity and stage-specific authored species.

## Binding visual baseline for playable builds

- Visual-era reference: repository commit `9768ec86ad`, which contains the original Furnace Crab body, articulated pincers, beak/sensor, shell lighting and individual specialist opponents. Other games used the original five-column sprite atlas `assets/scenes/platform-enemies.webp` with their original world-specific motion/limb accents, not the newer five families of replacement vector rigs.
- Current deliberate selection: `const useCrabEraArt = index>=0 && index<25;` in `assets/pawcade-side-scroll-no-badges-v2.js`. All 25 playable games MUST keep their original existing art dispatch. The independently authored newer vector/WebGL experiments can remain in preview/lab source but **must not replace playable enemies** without an explicit visual approval.
- Ember Foundry: original `drawFoundryEnemy` Furnace Crab and all 18 authored specialist Foundry variants stay. Library, Reef, Clock, Steamworks specialist illustrations stay. All other games restore their earlier atlas appearance and visual effects, preserving game-specific sprite cells and stage-specific behavior.
- Do not reset or touch the 25 games' chapter layouts, camera, platform placements, collision, damage, enemy AI, enemy spawns, input, player character rigs, quest logic, stage-scene props, saved progress, or existing movie drafts.
- Do NOT recreate or recolor faces, shell proportions, legs, claws, antennae, or silhouettes just to modernize them. Improve animation timing, lighting and detail ONLY while keeping the approved creature appearance unmistakably intact. Compare visible before/after screenshots on Android before promoting any future redesign.
- Do not claim film-quality 3D or live device playtesting just because source regression tests pass. The user must be able to review a visual preview before any major enemy-silhouette replacement.

## Source QA boundary

`tests/platform-worlds.test.cjs` includes a guard for the 25-game visual rollback; the specific corrected runtime and matching `sw.js`/HTML URLs are versioned. All five later procedural enemy rig modules are preserved as experiments but their playable render calls are gated off by the visual-era flag. Historical designs are restored via the rendering path, not by reverting later stage/world gameplay improvements.

**Device verification remaining:** Inspect each game on Android in landscape, screenshot the creatures at idle/turn/move/attack/hit/death and confirm no overlays, pop-in or missing images. Live GitHub Pages deployment and frame-rate validation are separate checks.

## Crab-era movement silhouette restoration — follow-up

The original `drawEnemyArticulatedLimbs` and `drawEnemySecondaryMotion` art functions were copied from the verified historical `9768ec86ad` code and reinstalled **verbatim** in the playable source. This undoes later generic longer limbs, changed feet and bulkier flight decorations, without altering enemy AI, collision, level geometry or animation timing of the simulation. Source QA checks the original characteristic shapes. Page/worker/game versions advanced together for offline refresh. Device screenshots remain necessary for visual approval.

## Full 25-game restoration pass and stage verification

Use [the individually checked 25-game / 162-stage restoration checklist](ENEMY-RESTORATION-CHECKLIST-25.md) and machine-readable `assets/enemy-restoration-baseline-25.json`. The verified source now routes **all 25 games** through the exact older creature-art rendering transforms as well as the prior body/leg/articulated motion functions. All newer five-family rig assets are designated **preview-only** in `assets/enemy-art-motion-registry.json`; they must not be silently restored to the playable engine.

The separate `tests/enemy-restoration-25.test.cjs` compares every stage's specific room, encounter/setpiece, hero and assigned counterpart with the real world definitions. It also guards old body proportions, original existing specialists, sprite atlas path, and the HTML/worker build version. **Source QA is complete; visual approval and actual live/Android browser gameplay QA are pending.**
