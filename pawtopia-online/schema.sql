
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS player (
  id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL,
  alias TEXT UNIQUE NOT NULL, public INTEGER NOT NULL DEFAULT 0 CHECK(public IN (0,1)),
  club TEXT CHECK(club IN ('Scouts','Builders','Guardians')),
  tickets INTEGER NOT NULL DEFAULT 5 CHECK(tickets >= 0)
);
CREATE TABLE IF NOT EXISTS save (
  player_id TEXT PRIMARY KEY REFERENCES player(id), revision INTEGER NOT NULL, payload TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS item (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL REFERENCES player(id), kind TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS item_owner ON item(owner);
CREATE TABLE IF NOT EXISTS listing (
  id TEXT PRIMARY KEY REFERENCES item(id), seller TEXT NOT NULL REFERENCES player(id),
  price INTEGER CHECK(price BETWEEN 1 AND 20), wanted TEXT,
  CHECK((price IS NOT NULL) != (wanted IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS listing_seller ON listing(seller);
CREATE TABLE IF NOT EXISTS swap (
  id TEXT PRIMARY KEY, listing_id TEXT NOT NULL, buyer TEXT NOT NULL REFERENCES player(id),
  offered TEXT
);
CREATE TABLE IF NOT EXISTS solved (
  player_id TEXT NOT NULL REFERENCES player(id), day TEXT NOT NULL, month TEXT NOT NULL,
  prize TEXT NOT NULL UNIQUE, kind TEXT NOT NULL, PRIMARY KEY(player_id, day)
);
CREATE INDEX IF NOT EXISTS solved_month ON solved(month, player_id);
CREATE TRIGGER IF NOT EXISTS award_puzzle AFTER INSERT ON solved BEGIN
  UPDATE player SET tickets = tickets + 2 WHERE id = NEW.player_id;
  INSERT INTO item(id, owner, kind) VALUES(NEW.prize, NEW.player_id, NEW.kind);
END;
CREATE TRIGGER IF NOT EXISTS exchange_items BEFORE INSERT ON swap BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM listing l JOIN item i ON i.id = l.id JOIN player p ON p.id = NEW.buyer
    WHERE l.id = NEW.listing_id AND l.seller != NEW.buyer AND i.owner = l.seller
      AND ((l.price IS NOT NULL AND NEW.offered IS NULL AND p.tickets >= l.price)
        OR (l.wanted IS NOT NULL AND EXISTS (
          SELECT 1 FROM item o WHERE o.id = NEW.offered AND o.owner = NEW.buyer
          AND o.kind = l.wanted AND NOT EXISTS(SELECT 1 FROM listing q WHERE q.id = o.id)
        )))
  ) THEN RAISE(ABORT, 'listing unavailable') END;
  UPDATE player SET tickets = tickets - COALESCE((SELECT price FROM listing WHERE id = NEW.listing_id),0)
    WHERE id = NEW.buyer;
  UPDATE player SET tickets = tickets + COALESCE((SELECT price FROM listing WHERE id = NEW.listing_id),0)
    WHERE id = (SELECT seller FROM listing WHERE id = NEW.listing_id);
  UPDATE item SET owner = (SELECT seller FROM listing WHERE id = NEW.listing_id) WHERE id = NEW.offered;
  UPDATE item SET owner = NEW.buyer WHERE id = NEW.listing_id;
  DELETE FROM listing WHERE id = NEW.listing_id;
END;

-- Players choose which pet nicknames to share with the owner.
CREATE TABLE IF NOT EXISTS shared_pet (
  id TEXT PRIMARY KEY, player_id TEXT NOT NULL REFERENCES player(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL, breed TEXT NOT NULL, shared_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id,nickname,breed)
);
CREATE VIEW IF NOT EXISTS owner_adoption_log AS
  SELECT p.alias, s.nickname, s.breed, s.shared_at
  FROM shared_pet s JOIN player p ON p.id=s.player_id;

-- Only the database operator can insert gifts. No Worker route writes here.
CREATE TABLE IF NOT EXISTS owner_gift (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  player_id TEXT NOT NULL REFERENCES player(id),
  pin TEXT CHECK(pin IN ('Lantern pin','Glowbell pin','Sunbeam pin','Crystal pin')),
  tickets INTEGER CHECK(typeof(tickets)='integer' AND tickets BETWEEN 1 AND 100),
  sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK((pin IS NOT NULL) != (tickets IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS owner_gift_recipient ON owner_gift(player_id,sent_at);
CREATE TRIGGER IF NOT EXISTS deliver_owner_gift AFTER INSERT ON owner_gift BEGIN
  UPDATE player SET tickets=tickets+NEW.tickets WHERE id=NEW.player_id AND NEW.tickets IS NOT NULL;
  INSERT INTO item(id,owner,kind)
    SELECT substr(NEW.id,1,8)||'-'||substr(NEW.id,9,4)||'-'||substr(NEW.id,13,4)||'-'||
           substr(NEW.id,17,4)||'-'||substr(NEW.id,21,12), NEW.player_id, NEW.pin
    WHERE NEW.pin IS NOT NULL;
END;

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
