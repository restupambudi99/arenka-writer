-- Preserve chapter_revisions and record restore lineage in an additive table.
CREATE TABLE revision_restore_links (
  revision_id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  restored_from_revision_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (revision_id, chapter_id, owner_id)
    REFERENCES chapter_revisions(id, chapter_id, owner_id) ON DELETE CASCADE,
  FOREIGN KEY (restored_from_revision_id, chapter_id, owner_id)
    REFERENCES chapter_revisions(id, chapter_id, owner_id)
);

CREATE INDEX revision_restore_links_source_idx
  ON revision_restore_links(owner_id, chapter_id, restored_from_revision_id);

