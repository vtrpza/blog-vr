CREATE UNIQUE INDEX editorial_events_once ON editorial_events(workflow_id, event);

CREATE TRIGGER posts_claim_weekly_slot
BEFORE UPDATE OF status ON posts
WHEN NEW.status = 'published' AND OLD.status <> 'published'
BEGIN
  UPDATE batches
  SET published_count = published_count + 1,
      status = CASE WHEN published_count + 1 >= target_count THEN 'completed' ELSE status END,
      updated_at = NEW.updated_at
  WHERE id = NEW.batch_id AND published_count < target_count;
  SELECT CASE WHEN changes() = 0 THEN RAISE(ABORT, 'weekly target reached') END;
END;
