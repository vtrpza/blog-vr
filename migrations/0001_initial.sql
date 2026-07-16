PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  target_count INTEGER NOT NULL DEFAULT 90 CHECK (target_count BETWEEN 1 AND 90),
  attempt_limit INTEGER NOT NULL DEFAULT 100 CHECK (attempt_limit BETWEEN target_count AND 100),
  published_count INTEGER NOT NULL DEFAULT 0 CHECK (published_count BETWEEN 0 AND target_count),
  pipedrive_qa_activity_id INTEGER,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'shortfall')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intent_key TEXT NOT NULL UNIQUE,
  cluster TEXT NOT NULL CHECK (cluster IN ('busca-e-apreensao', 'revisao-de-contratos', 'dividas-empresariais')),
  query TEXT NOT NULL,
  brief TEXT NOT NULL,
  allowed_domains_json TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'published', 'rejected', 'held')),
  batch_id TEXT REFERENCES batches(id),
  workflow_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS topics_queue ON topics(status, priority DESC, id);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  topic_id INTEGER NOT NULL UNIQUE REFERENCES topics(id),
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content_json TEXT NOT NULL,
  sources_json TEXT NOT NULL,
  author_slug TEXT NOT NULL DEFAULT 'equipe-editorial',
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'rejected', 'held')),
  workflow_id TEXT NOT NULL UNIQUE,
  batch_id TEXT NOT NULL REFERENCES batches(id),
  published_at TEXT,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS posts_public ON posts(status, published_at DESC);

CREATE TABLE IF NOT EXISTS generation_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL REFERENCES posts(id),
  openai_response_id TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('draft', 'audit', 'retry')),
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  error_code TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_receipts (
  idempotency_hash TEXT PRIMARY KEY,
  pipedrive_lead_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);
