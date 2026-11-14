# Ember Foundry art handoff

Use this brief to create and integrate the next two story shots in Try-4. Start with the approved Super Paw Heroes master poster and the current playable Ember Foundry. Use the poster as the character design authority. Keep Whisker’s orange fur, face, red cape, and red, navy, and gold suit consistent. Create original Ember Foundry imagery with feature-film-stylized 3D lighting, materials, poses, and depth.

| Arrival | Story and shot index | Art to create | Composition focus (x, y) |
| --- | --- | --- | --- |
| Stage 10, Slag Aqueduct | 8, Signal over the aqueduct | Whisker pauses above a slag channel and notices the trembling bell cable on the far bank. Use the actual stage conveyor silhouettes and crossing direction as visual references. | 0.74, 0.55 |
| Stage 14, Ashfall Galleries | 9, Through the ashfall | Whisker climbs between lift decks as ash thins and reveals the bell gantry ahead. Match the actual stage decks and foundry materials. | 0.41, 0.24 |

## Asset delivery and placement

- Create a separate landscape shot for each scene. Compose for the game's 800 × 380 canvas and leave the lower center quiet for the story dialog. Keep the main subject visible through the existing pan and zoom.
- Suggested destinations are `assets/scenes/ember-foundry/08-slag-aqueduct.webp` and `assets/scenes/ember-foundry/09-ashfall-galleries.webp`. Export web-ready WebP images. Keep original production files if available.
- Use `assets/pawcade-side-scroll-no-badges-v2.js` as the integration point. In `playFoundryShot(scene)`, select the corresponding image by scene index and draw it in the story canvas before the tint, particles, and letterbox. Preserve the existing backdrop as the loading and error fallback. These are scene images. Gameplay platform and collision coordinates stay in `assets/platform-worlds.js`.
- Preserve `foundryScenesByStage`, the existing Continue control, reduced-motion behavior, and checkpoint flow. Update the runtime asset version in `pawcade-side-scroll.html` with the integration commit.

## Movie continuity

Use the Slag Aqueduct shot as the moment Whisker picks up the bell keeper’s signal. Use Ashfall Galleries as the reveal of the bell gantry. Furnace Crown sets up the final guard, and the all-clear follows victory. Story stills can guide the storyboard. Track animated shots and final movie exports separately from the installed game stills.

## Publish and verify

Check spelling and case of paths, syntax-check the runtime, and verify both trigger mappings. Preview each shot inside the story canvas in landscape, including with reduced motion. Verify Continue returns the player to gameplay and the fallback works without the image. Publish to the existing GitHub Pages site, confirm both asset URLs load, and verify the live scene triggers when possible. Record which checks were run against the live build. Use only $0 tools and services.
