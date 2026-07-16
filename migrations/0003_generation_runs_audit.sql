CREATE TABLE generation_runs_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT REFERENCES posts(id),
  topic_id INTEGER NOT NULL REFERENCES topics(id),
  batch_id TEXT NOT NULL REFERENCES batches(id),
  workflow_id TEXT NOT NULL,
  openai_response_id TEXT NOT NULL UNIQUE,
  stage TEXT NOT NULL CHECK (stage IN ('draft', 'audit', 'retry')),
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  error_code TEXT,
  created_at TEXT NOT NULL
);

INSERT INTO generation_runs_v2 (
  id, post_id, topic_id, batch_id, workflow_id, openai_response_id,
  stage, model, input_tokens, output_tokens, status, error_code, created_at
)
SELECT
  runs.id, runs.post_id, posts.topic_id, posts.batch_id, posts.workflow_id,
  runs.openai_response_id, runs.stage, runs.model, runs.input_tokens,
  runs.output_tokens, runs.status, runs.error_code, runs.created_at
FROM generation_runs AS runs
JOIN posts ON posts.id = runs.post_id;

DROP TABLE generation_runs;
ALTER TABLE generation_runs_v2 RENAME TO generation_runs;
CREATE INDEX generation_runs_workflow ON generation_runs(workflow_id, created_at);
