const { supabase } = require('../../integrations/database/supabase.client');

async function updateReportStatus(reportId, updates) {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function insertTimelineEntry(entry) {
  const { data, error } = await supabase
    .from('report_updates')
    .insert(entry)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function insertResolutionImage(record) {
  const { data, error } = await supabase
    .from('resolution_images')
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getResolutionImages(reportId) {
  const { data, error } = await supabase
    .from('resolution_images')
    .select('*')
    .eq('report_id', reportId)
    .order('uploaded_at', { ascending: true });

  if (error) throw error;
  return data;
}

module.exports = { updateReportStatus, insertTimelineEntry, insertResolutionImage, getResolutionImages };
