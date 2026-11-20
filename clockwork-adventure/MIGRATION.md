# Clockwork Adventure — editable migration workspace

Status: **Source recovery pending. Not yet a playable copy.**

Original deployed URL: https://super-paw-clockwork-adventure.pebblycrow16.chatgpt.site/

## Goal
Preserve the existing Super Paw Heroes: Clockwork Adventure game and move its **actual source files and assets** into this repository so ChatGPT Work can make updates via Git commits, test changes, and release upgrades on GitHub Pages.

## Safety rules
- **Never overwrite or take down the existing game** until the migrated game has been compared and verified playable.
- Work on `clockwork-adventure-migration` first, then open a pull request for review.
- Keep this game in an isolated `clockwork-adventure/` folder; do not alter the other 25 games.
- No paid APIs, hosting, credits, or subscriptions.
- Retain original assets, gameplay, save behavior and mobile support where available; do not claim exact parity without comparing versions.
- Preserve the character canon of Whisker, Luna, and Baron Brasswhirl.

## Source recovery checklist
1. Find the original editable ChatGPT Site project (or source export / ZIP / previous source bundle). A published site is not sufficient proof that project source is accessible.
2. Export or copy the source files and assets using authorized access.
3. Inventory entry points, dependencies, saves, audio and asset paths; check for external services or secrets.
4. Add recovered files under `clockwork-adventure/` on this branch.
5. Adjust paths for GitHub Pages project base path `/Try-4/clockwork-adventure/`.
6. Smoke-test Android landscape/touch, controllers, level progression, saves, and assets.
7. Deploy preview; verify feature parity with original; merge to main only when verified.
8. Then update the Games Room link to the new verified URL.

## Current audit
- GitHub repository `joshehrler1-maker/Try-4` is writable.
- A recursive listing of the main branch (380 tree entries) did not show an obvious Clockwork Adventure source directory.
- The published site's complete source was not retrievable using available tools at the time of setup.
- Therefore **migration is not complete**, and **no original game code has been replaced**.

## Expected final location
After publishing the recovered game via GitHub Pages, the proposed URL is:
https://joshehrler1-maker.github.io/Try-4/clockwork-adventure/

This is only the **planned URL**, not a verified working game link yet.
