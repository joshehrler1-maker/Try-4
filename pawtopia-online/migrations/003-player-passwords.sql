CREATE TABLE IF NOT EXISTS player_login (
  player_id TEXT PRIMARY KEY REFERENCES player(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  proof_hash TEXT NOT NULL,
  recovery_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS player_session (
  token_hash TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES player(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS player_session_owner ON player_session(player_id);
CREATE INDEX IF NOT EXISTS player_session_expiry ON player_session(expires_at);
CREATE TABLE IF NOT EXISTS player_auth_attempt (
  bucket TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  hits INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS player_auth_attempt_expiry ON player_auth_attempt(expires_at);
