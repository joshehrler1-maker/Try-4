# Optional local worker — not a hosted backend

This Node 22+ service uses the same offline template engine as Creator Studio. It is not connected to the Android app. It runs only on 127.0.0.1, has no remote provider adapters and cannot publish, spend or withdraw money.

Set `TRY4_STATE_DIR` to an absolute private directory and `TRY4_OWNER_TOKEN` to a freshly generated 64-character random hex token, then run `node server/service.mjs`. Generate the token locally with a cryptographic random generator; never commit it or put it in a URL. `TRY4_PORT` defaults to 8788. Do not expose the service to the Internet.

API: `GET /health`, `/state`, `/backup`; `POST /actions` with an engine action. All endpoints require `Authorization: Bearer TOKEN`; JSON only for POST. Requests with an Origin header or incorrect Host are rejected. There is no CORS support, payment endpoint, publishing endpoint or app login screen. The token is a local owner credential, not production multi-user authentication.

The worker persists checksummed snapshots by fsync and atomic rename, limits workspace size/jobs/retries, and takes an exclusive process lock. It starts paused and emergency-locked after restart. Queue outputs are drafts requiring owner review. A checksum detects corruption, not malicious modification. Workspace data and backups are not encrypted; use OS disk protection and a private directory. A failed write stops processing. No third-party credentials are stored.

Before production hosting: implement secure owner account authentication, TLS, a credential vault, encrypted backups, trusted quota/provider adapters, deployment-specific authorization and independent security review. No hosting is configured by this repository.
