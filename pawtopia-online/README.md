
# Pawtopia online setup

The player features run separately from GitHub Pages. Keep the Cloudflare account and Worker on the Free plan. The browser config is blank by default. Private browser backups and all solo play continue when online services are unavailable.

1. Create a Workers Free project and a Free D1 database named `pawtopia-online`. Bind the database to the Worker as `DB`. Set `PAWTOPIA_ORIGIN` to the GitHub Pages origin listed in Wrangler config. Apply `schema.sql` to the database.
2. Create a Free Turnstile widget scoped to `joshehrler1-maker.github.io`. Save its private key as the Worker secret `TURNSTILE_SECRET`. Keep the secret out of GitHub.
3. Deploy `worker.js` with `wrangler.jsonc` or the Cloudflare dashboard. Set the deployed HTTPS Worker URL and public Turnstile site key in `assets/pawtopia-online-config.js`. The Town Square and Progress Center links appear when an endpoint is configured.
4. Keep `cloudSaves: false` and leave `PAWTOPIA_CLOUD_SAVES` unset for a market-only launch. Test sign-in and trading with two disposable player accounts. Verify that both save routes are disabled, leaderboards are opt-in, and private keys never appear in listings or standings.
5. If save sync is separately enabled, both the Worker setting (`PAWTOPIA_CLOUD_SAVES=enabled`) and browser configuration (`cloudSaves: true`) must be enabled. Each browser must then opt in separately. Cloud saves may contain player-entered game text such as cat bios. Test a two-browser conflict with disposable data before enabling this in production.

Account keys are private sign-in credentials. The service stores only a hash of each key. Sync saves and shared market state are stored separately. Player-controlled browser saves cannot add pins or tickets or set a leaderboard score. Public standings use generated aliases and optional clubs.

## Private pet log and owner gifts

Apply the latest `schema.sql` before deploying the Worker. Players sign in and choose whether to share a pet nickname and breed in the online town. These entries are self-reported and contain the sharing date, which can differ from the adoption date. Existing offline pets and unshared nicknames are never imported. Players can remove their own entries.

Use the signed-in Cloudflare D1 console for the private log and gifts. The Worker has no public gift-creation endpoint. To see player aliases available as recipients:

```sql
SELECT alias FROM player ORDER BY alias;
SELECT alias, nickname, breed, shared_at FROM owner_adoption_log ORDER BY shared_at DESC;
```

Send one pin or 1–100 market tickets using the exact player alias. Gifts go directly to their inventory or balance, even while the recipient is offline. Each insert sends one gift.

```sql
INSERT INTO owner_gift (player_id, pin)
SELECT id, 'Lantern pin' FROM player WHERE alias = 'PASTE-PLAYER-ALIAS-HERE';

INSERT INTO owner_gift (player_id, tickets)
SELECT id, 10 FROM player WHERE alias = 'PASTE-PLAYER-ALIAS-HERE';
```

## Player-versus-player Arena
Apply `migrations/001-arena-duels.sql` to production D1 before deploying the new Worker over the existing one. Fresh databases get the same table from `schema.sql`. The Arena uses the existing Pawtopia accounts. Invite codes last 24 hours before joining and 7 days once joined. Duel history is separate from solo progress, market rewards and cloud saves. Players choose an adopted cat locally, and the server validates the breed and supplies equal starting health and fixed move rules for both fighters.

Run `node --test tests/pawtopia-arena-duels.test.mjs` with Node 22.13 or later to test the Worker against SQLite.
