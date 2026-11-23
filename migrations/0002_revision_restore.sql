CREATE TABLE chapter_revisions_new (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  revision_number INTEGER NOT NULL CHECK (revision_number > 0),
  content TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('manual', 'ai_suggestion', 'import', 'restore')),
  restored_from_revision_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (chapter_id, revision_number),
  UNIQUE (id, chapter_id, owner_id),
  FOREIGN KEY (chapter_id, owner_id) REFERENCES chapters(id, owner_id) ON DELETE CASCADE
);

INSERT INTO chapter_revisions_new
  (id, owner_id, chapter_id, revision_number, content, source, restored_from_revision_id, created_at)
SELECT id, owner_id, chapter_id, revision_number, content, source, NULL, created_at
FROM chapter_revisions;

DROP TABLE chapter_revisions;
ALTER TABLE chapter_revisions_new RENAME TO chapter_revisions;

