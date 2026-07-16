CREATE TABLE lead_receipts_v2 (
  idempotency_hash TEXT PRIMARY KEY,
  pipedrive_lead_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO lead_receipts_v2(idempotency_hash,pipedrive_lead_id,status,created_at,updated_at)
SELECT idempotency_hash,pipedrive_lead_id,'completed',created_at,created_at FROM lead_receipts;

DROP TABLE lead_receipts;
ALTER TABLE lead_receipts_v2 RENAME TO lead_receipts;
