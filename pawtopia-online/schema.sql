
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
