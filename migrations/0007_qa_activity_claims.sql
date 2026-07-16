UPDATE batches SET pipedrive_qa_activity_id=NULL WHERE pipedrive_qa_activity_id=-1;

CREATE TABLE qa_activity_claims (
  batch_id TEXT PRIMARY KEY REFERENCES batches(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'uncertain')),
  activity_id INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
