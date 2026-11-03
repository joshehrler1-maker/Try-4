# Try 4 pre-build requirements

## Current delivery
Static browser MVP only. No native APK, backend, verified earnings, autonomous content production, owner authentication, or payment access exists. Public preparation pages are not an authenticated owner dashboard. Local locks do not provide server-side authorization.

## Implemented in this update
- Relative-scope Android web app manifest, public game offline cache, installation guidance and fail-closed readiness display.
- Arcade pause/resume preserves the current run; hidden pages pause gameplay and clear held input.
- A shared release policy explicitly disables paid services, ads, payments and autonomous actions, with cat-only canonical heroes.
- Dependency-free static source validation, executable with `node scripts/validate.mjs`.

## Required evidence before enabling each capability
1. Physical Android tests: tap/hold/cancel, pause/resume, tab switching, rotation, complete every level, saves, offline relaunch, battery/heat and sustained frame pacing. Record device/browser/build plus actual outcomes in the manual test log. No boxes prechecked.
2. Native build: create Android source only after the web MVP passes; select a currently verified free build route, generate signing credentials under owner control and test installation, updates and recovery. Do not claim an APK is ready from these HTML files.
3. Backend: authenticated owner, server-side permissions, secret vault, durable queues, idempotency, retries, emergency stop, monitoring, encrypted backups and tested restore before unattended jobs. Local browser flags are not enforcement.
4. Integrations: verify current free availability, no card/trial requirement or silent paid fallback; enforce authoritative quotas before every remote job. Stop if price/quota is unknown. ChatGPT subscriptions do not authorize an app to call paid APIs.
5. Characters: preserve the master poster, Whisker and Luna as cats, no dogs, original approved feline friends, consistent belts/costumes/voices; verify art and audio rights. Current procedural game graphics do not match the poster's cinematic quality.
6. Publication: previews and owner-selected approval mode, originality, accessibility, child-safety, privacy, platform requirements and policy checks before any public content or ads are enabled.
7. Earnings: verified read-only provider data and timestamps; owner-only withdrawals at provider; never collect payment passwords or allow the AI to use Cash App. Tax exports need real transaction data.
8. Plan adaptation: explicitly authorized capability detection and free fallback; no assumed ChatGPT plan/API linkage. Recheck provider authorization when plans change.

## Cost and release behavior
No cloud resources, workflow jobs, paid APIs, ad networks or payment integrations are added by this update. Offline files require an initial online download (approximately 6 MB including art). Private preparation pages and their local data are not cached by the service worker. Failed offline setup leaves online use available. Browser storage can be evicted; it is not a backup guarantee. The worker activates after old tabs close to avoid interrupting gameplay.

This checklist is a specification for remaining work, not evidence that unimplemented systems exist.
