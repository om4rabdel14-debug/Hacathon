const { supabase } = require('../../integrations/database/supabase.client');

// For future use: notification records stored in DB
// Currently, notifications are handled through report_updates timeline

async function getNotificationsForReport(reportId) {
  const { data, error } = await supabase
    .from('report_updates')
    .select('*')
    .eq('report_id', reportId)
    .order('changed_at', { ascending: false });

  if (error) throw error;
  return data;
}

module.exports = { getNotificationsForReport };
