CREATE TABLE ai_request_limits (
  owner_id TEXT PRIMARY KEY,
  minute_window INTEGER NOT NULL,
  minute_count INTEGER NOT NULL CHECK (minute_count > 0),
  day_window TEXT NOT NULL,
  day_count INTEGER NOT NULL CHECK (day_count > 0)
);

