-- ============================================
-- Duplicate detection, citizen feedback, escalation workflow
-- ============================================

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS duplicate_of_report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS submission_count INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS merged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS escalation_level INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS escalation_stage TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS last_escalated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_escalation_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

UPDATE reports
SET submission_count = 1
WHERE submission_count IS NULL OR submission_count < 1;

ALTER TABLE reports
  DROP CONSTRAINT IF EXISTS reports_status_check;

ALTER TABLE reports
  ADD CONSTRAINT reports_status_check
  CHECK (status IN (
    'submitted', 'analyzing', 'assigned', 'in_progress', 'resolved', 'rejected', 'merged'
  ));

ALTER TABLE reports
  DROP CONSTRAINT IF EXISTS reports_escalation_level_check;

ALTER TABLE reports
  ADD CONSTRAINT reports_escalation_level_check
  CHECK (escalation_level BETWEEN 0 AND 5);

CREATE TABLE IF NOT EXISTS report_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  submission_report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  citizen_name TEXT,
  citizen_email TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  resolved_confirmed BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_escalations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  stage TEXT NOT NULL,
  note TEXT,
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_duplicate_of ON reports(duplicate_of_report_id);
CREATE INDEX IF NOT EXISTS idx_reports_sla_due_at ON reports(sla_due_at);
CREATE INDEX IF NOT EXISTS idx_reports_escalation_level ON reports(escalation_level);
CREATE INDEX IF NOT EXISTS idx_report_feedback_report ON report_feedback(report_id);
CREATE INDEX IF NOT EXISTS idx_report_feedback_submission ON report_feedback(submission_report_id);
CREATE INDEX IF NOT EXISTS idx_report_escalations_report ON report_escalations(report_id);

ALTER TABLE report_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_escalations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on report_feedback" ON report_feedback;
DROP POLICY IF EXISTS "Service role full access on report_escalations" ON report_escalations;

CREATE POLICY "Service role full access on report_feedback"
  ON report_feedback FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on report_escalations"
  ON report_escalations FOR ALL
  USING (true)
  WITH CHECK (true);
