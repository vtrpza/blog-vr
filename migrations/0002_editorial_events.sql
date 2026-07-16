CREATE TABLE IF NOT EXISTS editorial_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER REFERENCES topics(id),
  batch_id TEXT NOT NULL REFERENCES batches(id),
  workflow_id TEXT NOT NULL,
  event TEXT NOT NULL CHECK (event IN ('shortfall', 'generation_rejected', 'near_duplicate', 'draft_conflict', 'held', 'published')),
  detail TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS editorial_events_batch ON editorial_events(batch_id, created_at);
