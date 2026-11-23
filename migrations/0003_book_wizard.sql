-- Book wizard metadata stored separately from immutable voice-profile snapshots.
ALTER TABLE books
ADD COLUMN wizard_json TEXT NOT NULL DEFAULT '{}'
CHECK (json_valid(wizard_json));

