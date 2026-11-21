
# Pawtopia online setup

The player features run separately from GitHub Pages. Keep the Cloudflare account and Worker on the Free plan. The browser config is blank by default. Private browser backups and all solo play continue when online services are unavailable.

1. Create a Workers Free project and a Free D1 database named `pawtopia-online`. Bind the database to the Worker as `DB`. Set `PAWTOPIA_ORIGIN` to the GitHub Pages origin listed in Wrangler config. Apply `schema.sql` to the database.
2. Create a Free Turnstile widget scoped to `joshehrler1-maker.github.io`. Save its private key as the Worker secret `TURNSTILE_SECRET`. Keep the secret out of GitHub.
3. Deploy `worker.js` with `wrangler.jsonc` or the Cloudflare dashboard. Set the deployed HTTPS Worker URL and public Turnstile site key in `assets/pawtopia-online-config.js`. The Town Square and Progress Center links appear when an endpoint is configured.
4. Check signup, sharing a save between two browsers, conflict resolution with independent changes, profile visibility, daily puzzle limits, selling and buying a pin, and swapping two pins with separate accounts. Confirm that disabling the endpoint keeps local play available.

Account keys are private sign-in credentials. The service stores only a hash of each key. Sync saves and shared market state are stored separately. Player-controlled browser saves cannot add pins or tickets or set a leaderboard score. Public standings use generated aliases and optional clubs.
