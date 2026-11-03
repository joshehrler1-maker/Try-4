# What remains before the full Try 4 vision works

This is an implementation boundary, not a list of completed features.

1. The Android compile workflow passed at source commit `1bf4b66c64f8210884336b40d4b70800e38fa6d7`. Keep it green as code changes. No APK is uploaded by this workflow.
2. Test the browser studio and games on the owner’s Android phone. Record actual device/browser versions, backup restore, offline relaunch, every game win condition, long-session frame pacing, heat and battery behavior. Keep the pre-build gate blocked until the evidence passes.
3. Prepare owner-controlled signing and install a test APK only after the required readiness review. Back up the signing key outside the public repository. Reproducible builds and install/update checks are still required.
4. Build a secure hosted owner account and connect the Android app to it. The current loopback worker is a tested starting implementation, not an Internet-facing backend or remote authentication system. Add TLS, encrypted secrets/backups, provider token revocation, account recovery, security review and deployment-specific budget enforcement.
5. Select and authorize genuinely free production/publishing services. Verify present availability, limits, commercial rights, region/age rules, child-directed-content policies and no-card/no-trial requirements before writing adapters. Do not substitute paid credits. The user’s ChatGPT plan is not an app API credential.
6. Obtain canonical rigged cat models and approved consistent audio assets. Build and test full-body animation, facial movement, lip-sync, video rendering, sound mixing and previews. A storyboard is not a rendered movie and lyrics are not singing audio.
7. Add platform-authorized publishing and analytics with durable retries, idempotency, approvals and a global emergency stop. Add genuine demand discovery and optimization only after those integrations work.
8. Add child-appropriate monetization only after required privacy and provider reviews. Connect real read-only earnings data and provider-controlled owner withdrawals. Do not allow the AI to use Cash App or payment credentials. Tax reports need real transaction evidence.

Nothing in this repository guarantees earnings or free unlimited third-party usage. No public production backend, ad network, paid API, payout provider or automated publication is connected.
