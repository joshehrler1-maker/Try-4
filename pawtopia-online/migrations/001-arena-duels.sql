CREATE TABLE IF NOT EXISTS arena_duel (
  code TEXT PRIMARY KEY,
  host_id TEXT NOT NULL UNIQUE REFERENCES player(id) ON DELETE CASCADE,
  guest_id TEXT REFERENCES player(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('waiting','active','finished')),
  revision INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL,
  CHECK (guest_id IS NULL OR guest_id <> host_id)
);
