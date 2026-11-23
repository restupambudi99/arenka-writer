PRAGMA foreign_keys = ON;

CREATE TABLE voice_profiles (
  id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'ready', 'archived')),
  profile_json TEXT NOT NULL CHECK (json_valid(profile_json)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, version),
  UNIQUE (id, owner_id, version)
);

CREATE INDEX voice_profiles_owner_idx ON voice_profiles(owner_id, created_at);

CREATE TABLE books (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  voice_profile_id TEXT NOT NULL,
  voice_profile_version INTEGER NOT NULL CHECK (voice_profile_version > 0),
  kind TEXT NOT NULL CHECK (kind IN ('fiction', 'nonfiction')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  target_word_count INTEGER NOT NULL DEFAULT 30000 CHECK (target_word_count > 0),
  stage TEXT NOT NULL DEFAULT 'blueprint'
    CHECK (stage IN ('blueprint', 'outline', 'manuscript', 'preview')),
  layout_json TEXT NOT NULL CHECK (json_valid(layout_json)),
  archived_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id, owner_id),
  FOREIGN KEY (voice_profile_id, owner_id, voice_profile_version)
    REFERENCES voice_profiles(id, owner_id, version)
);

CREATE INDEX books_owner_updated_idx ON books(owner_id, archived_at, updated_at);

CREATE TABLE chapters (
  id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0),
  title TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT '',
  current_revision_id TEXT,
  approved_revision_id TEXT,
  approval_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (approval_status IN ('draft', 'in_review', 'approved')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (book_id, position),
  UNIQUE (id, owner_id),
  FOREIGN KEY (book_id, owner_id) REFERENCES books(id, owner_id) ON DELETE CASCADE
);

CREATE INDEX chapters_book_position_idx ON chapters(book_id, position);

CREATE TABLE chapter_revisions (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  revision_number INTEGER NOT NULL CHECK (revision_number > 0),
  content TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('manual', 'ai_suggestion', 'import')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (chapter_id, revision_number),
  UNIQUE (id, chapter_id, owner_id),
  FOREIGN KEY (chapter_id, owner_id) REFERENCES chapters(id, owner_id) ON DELETE CASCADE
);

CREATE TABLE exports (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format = 'pdf'),
  source_revision_ids_json TEXT NOT NULL CHECK (json_valid(source_revision_ids_json)),
  r2_object_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id, owner_id) REFERENCES books(id, owner_id) ON DELETE CASCADE
);

CREATE TABLE ai_usage (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  book_id TEXT,
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ai_usage_owner_created_idx ON ai_usage(owner_id, created_at);

