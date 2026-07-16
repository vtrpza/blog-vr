CREATE TABLE contact_rate_limits (
  key TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL CHECK (count > 0),
  updated_at TEXT NOT NULL
);

CREATE INDEX contact_rate_limits_window ON contact_rate_limits(window_start);
