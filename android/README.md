# Try4 Android source — offline studio and games

Android app source is present. Android Java compilation passed for source commit `1bf4b66c64f8210884336b40d4b70800e38fa6d7` in https://github.com/joshehrler1-maker/Try-4/actions/runs/41584281235. APK packaging and physical-device verification remain release blockers. No APK is supplied until the readiness requirements are met.

Toolchain: Java 17, Gradle 8.13, Android Gradle Plugin 8.13.2, compile/target SDK 36, minimum Android 8 (API 26), AndroidX WebKit 1.14.0. These fixed versions are compatibility choices, not claims to be the latest versions.

Build in an environment with the Android SDK and Gradle installed: `gradle -p android :app:compileDebugJavaWithJavac`. The repository's public-only GitHub Actions check uses this command and uploads no artifacts or caches. It does not produce a downloadable build. Compilation must pass before any packaging work.

After the entire pre-build gate passes, packaging can be configured under owner-controlled signing credentials. Never store a keystore or password in Git. There is intentionally no release signing configuration or automatic store upload.

## Behavior

- Bundles public top-level web assets from the repository; all studio drafts and games run locally.
- Uses WebViewAssetLoader for HTTPS-origin local assets, with external URL loads blocked and no Internet permission.
- No JavaScript/native interface, file-origin access, payment APIs, microphone, camera, broad storage or background permissions.
- Native Studio/Games toolbar and Android document-picker export/restore of studio JSON. Selected files are bounded and validated; restore relocks the workspace. The backup includes studio artifacts/ledger only, not separate legacy game checkpoints.
- Lifecycle pauses queue/game timers; screen rotation may recreate the screen. Persisted studio drafts remain local.
- A sandboxed HTML preview can run a generated memory game without accessing its parent workspace. Imported backups should still come only from a trusted source.

Not implemented: biometric/account login, cloud sync, hosted backend connection, background production, external publication, AI generation, rendered films, consistent character audio, ads or payouts. A native wrapper does not make those features exist.

Reference: https://developer.android.com/develop/ui/views/layout/webapps/load-local-content
Toolchain reference: https://developer.android.com/build/releases/agp-8-13-0-release-notes
