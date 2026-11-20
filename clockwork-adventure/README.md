# Super Paw Heroes · The Clockwork Adventure

An original black-and-white cartoon adventure, early Chapter 1. Separate from Try-4's 25 side-scrollers.

Open the deployed Site, choose Begin or Continue, and use landscape orientation on Android. Joystick moves; drag the world view to rotate the camera; the four buttons attack, dodge, interact and lock onto an enemy. Desktop: WASD/arrows, Space, Shift, E and Q.

Follow Luna's guidance, collect the three winding gears, repair the woodland bridge, solve the bell puzzle, defeat the Warden and ring the great bell. Mallow offers healing and reinforced gloves for earned coins. No real-money purchases.

Progress saves to this browser. Pause → Export save creates a portable backup. Source development progress is in PROGRESS.md; asset provenance is in ASSETS.md. Read those before continuing.

## Checks
`npm run check`
`node --check dist/software-renderer.js`
`node tests/smoke.mjs`

Static distribution in dist/, no build step. Three.js 0.180.0 is vendored under its MIT license. A compatibility renderer is used if WebGL is unavailable; its graphics are simpler. This is not final art, a full-length game, or a Nintendo remake.
