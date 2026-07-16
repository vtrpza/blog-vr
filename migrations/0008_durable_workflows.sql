DELETE FROM lead_receipts;

CREATE UNIQUE INDEX topics_workflow_once
ON topics(workflow_id)
WHERE workflow_id IS NOT NULL;

CREATE TABLE batch_launches (
  batch_id TEXT PRIMARY KEY REFERENCES batches(id),
  status TEXT NOT NULL CHECK (status IN ('launching', 'confirmed', 'uncertain')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
