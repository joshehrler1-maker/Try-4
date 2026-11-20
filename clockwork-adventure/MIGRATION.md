# Clockwork Adventure migration

Recovered the editable owner project at https://super-paw-clockwork-adventure.pebblycrow16.chatgpt.site/, source commit ba4ab8be5cfb19cb6e17fd9539352c2b286a64b3. All nine files in dist/ match the original hosted responses byte for byte. The original project notes, asset registry, package manifests and gameplay tests are included. The deployable game is self-contained. The root index opens dist/ using a relative path for GitHub Pages.

Run npm run check and npm test from this folder. Both passed in staging, along with the syntax check for the compatibility renderer. Android verification and GitHub Pages release are pending.

Existing phone saves belong to the original site's browser storage. Use Pause → Export save at the original address, keep the JSON backup, and use the migrated game's import control to resume on a new origin.
