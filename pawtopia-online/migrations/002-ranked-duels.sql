CREATE TABLE IF NOT EXISTS arena_ranked_player (
  player_id TEXT PRIMARY KEY REFERENCES player(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL DEFAULT 1000,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  queued_at INTEGER,
  seen_at INTEGER,
  fighter TEXT,
  match_code TEXT
);
CREATE INDEX IF NOT EXISTS arena_ranked_waiting ON arena_ranked_player(seen_at)
  WHERE queued_at IS NOT NULL AND match_code IS NULL;
CREATE TABLE IF NOT EXISTS arena_ranked_match (
  code TEXT PRIMARY KEY,
  host_id TEXT NOT NULL REFERENCES player(id) ON DELETE CASCADE,
  guest_id TEXT REFERENCES player(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('active','finished')),
  revision INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL,
  CHECK (guest_id IS NULL OR guest_id <> host_id)
);
CREATE TRIGGER IF NOT EXISTS arena_ranked_assign AFTER INSERT ON arena_ranked_match
BEGIN
  UPDATE arena_ranked_player SET match_code = NEW.code, queued_at = NULL, seen_at = NULL, fighter = NULL
    WHERE player_id = NEW.host_id OR player_id = NEW.guest_id;
END;
CREATE TRIGGER IF NOT EXISTS arena_ranked_score AFTER UPDATE OF phase ON arena_ranked_match
WHEN OLD.phase = 'active' AND NEW.phase = 'finished' AND NEW.guest_id IS NOT NULL
BEGIN
  UPDATE arena_ranked_player SET
    rating = MAX(0,rating + CASE WHEN json_extract(NEW.state,'$.winner') IS NULL THEN 0
      WHEN json_extract(NEW.state,'$.winner') = (player_id = NEW.guest_id) THEN 20 ELSE -20 END),
    wins = wins + COALESCE(json_extract(NEW.state,'$.winner') = (player_id = NEW.guest_id),0),
    losses = losses + COALESCE(json_extract(NEW.state,'$.winner') <> (player_id = NEW.guest_id),0),
    draws = draws + (json_extract(NEW.state,'$.winner') IS NULL)
  WHERE player_id = NEW.host_id OR player_id = NEW.guest_id;
END;
