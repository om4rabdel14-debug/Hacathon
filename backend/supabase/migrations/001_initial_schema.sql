-- ============================================
-- AI Waste Report & Priority System
-- Initial Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: reports
-- ============================================
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Citizen input
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  address TEXT,
  citizen_name TEXT NOT NULL DEFAULT 'Anonymous',
  citizen_email TEXT,

  -- AI analysis fields (filled after Gemini analysis)
  issue_type TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence DOUBLE PRECISION,
  ai_summary TEXT,
  severity_explanation TEXT,
  recommended_department TEXT,

  -- Priority scoring
  priority_score INTEGER DEFAULT 0,
  priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),

  -- Status lifecycle
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'analyzing', 'assigned', 'in_progress', 'resolved', 'rejected'
  )),
  assigned_department TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: report_updates (timeline tracking)
-- ============================================
CREATE TABLE report_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  changed_by TEXT DEFAULT 'system',
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: resolution_images (before/after)
-- ============================================
CREATE TABLE resolution_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_priority ON reports(priority_score DESC);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_reports_department ON reports(assigned_department);
CREATE INDEX idx_reports_location ON reports(lat, lng);
CREATE INDEX idx_report_updates_report ON report_updates(report_id);
CREATE INDEX idx_resolution_images_report ON resolution_images(report_id);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (simplified for hackathon)
-- ============================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolution_images ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service key)
CREATE POLICY "Service role full access on reports"
  ON reports FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on report_updates"
  ON report_updates FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on resolution_images"
  ON resolution_images FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Storage buckets (run these in Supabase dashboard SQL editor)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resolution-images', 'resolution-images', true);
--
-- CREATE POLICY "Public read for report-images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'report-images');
-- CREATE POLICY "Service upload for report-images" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'report-images');
--
-- CREATE POLICY "Public read for resolution-images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'resolution-images');
-- CREATE POLICY "Service upload for resolution-images" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'resolution-images');
