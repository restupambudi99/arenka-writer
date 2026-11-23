CREATE TABLE IF NOT EXISTS book_outlines (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  outline_json TEXT NOT NULL CHECK (json_valid(outline_json)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (book_id, version),
  FOREIGN KEY (book_id, owner_id) REFERENCES books(id, owner_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS book_outlines_owner_idx ON book_outlines(owner_id, book_id, version);

