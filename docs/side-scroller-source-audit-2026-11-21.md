# Side-scroller source audit — November 21, 2026

Source blobs inspected
- platform-worlds.js 35d6d98fba0883964033eef1f2e857f6a0b0a712
- active runtime pawcade-side-scroll-no-badges-v2.js 6dbcf50a64ad78e664536a4f0665bcfdbbfd32d9

All 25 course plans evaluated successfully in an isolated JavaScript context. Every referenced room exists. All platform tuples have finite coordinates and positive widths. Chapter counts match room counts. Ember Foundry defines 18 rooms. Each remaining game defines six.

These are authored source room counts. Runtime additions and per-game overrides can change playable geometry. Steamworks explicitly builds its longer catwalks in the active renderer. Source counts alone cannot establish reachability or counterpart coverage.

Coverage still required for every game
- Verify counterpart level count, topology and scale from attributable sources.
- Compare actual runtime platform positions and hazards with counterpart-inspired design.
- Play every accessible stage and record checkpoints, failed jumps and completion.
- Inspect approved heroes, restored enemy artwork, floor contact and animation in screenshots.
- Measure mobile frame timing, loading and input responsiveness.
- Verify deployed asset bytes against the committed build.
- Audit Baron encounters and finale completion conditions.

The full redesign is incomplete. No game is marked complete by this audit. No live deployment, visual QA, Android device play, or performance measurements were completed during this source-only pass.

Previous runtime fix to verify next
- f51a23e adds swept hostile projectile contact.
- 147017f refreshes the Game Room reference.
- Confirm active live asset before applying further geometry changes.
