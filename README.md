# Try 4 / Super Paw Heroes

Offline Creator Studio and browser games, plus a native Android source project and an optional local worker. Whisker and Luna are cats; no dogs. Preserve the approved master poster designs, costumes, utility belts and creative continuity.

## Open
Serve the public top-level HTML/assets over HTTPS and open [Creator Studio](studio.html) or [games](index.html). Studio drafts with built-in templates at no cost: stories, symbol coloring activities, a memory game, song lyrics and storyboards. Preview, manually review, export and back up the results. Browser/local Android workspaces are not secure owner accounts.

## Verify
Node 22+: `node scripts/validate.mjs` and `node --test tests/core.test.cjs tests/server.test.mjs`. Python: `python3 scripts/check_android.py`. The two tracked PNGs must be present for full validation. The optional worker has its own [setup notes](server/README.md). Android source and compilation requirements are in [android/README.md](android/README.md).

## Absolute $0
No paid APIs, subscriptions, cloud upgrades, credits, paid ads, publication fees or AI financial access. Unknown cost/quota means stop. There are no external AI, ad, publishing or payment adapters in this implementation. The verification workflow runs only on a standard public-repository runner, uploads no cache/artifacts, and skips private repositories. Current GitHub billing reference: https://docs.github.com/en/actions/concepts/billing-and-usage

## Status
See [implementation status](IMPLEMENTATION-STATUS.md), [pre-build requirements](PRE-BUILD.md), [phone readiness](readiness.html) and [what remains](BUILD-REMAINING.md). Native source is not an installed APK. Public deployment and production release are not certified. ChatGPT plan adaptation, AI animation, real publication and earnings integrations remain incomplete.
