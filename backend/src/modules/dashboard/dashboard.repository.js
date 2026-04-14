const { supabase } = require('../../integrations/database/supabase.client');

/**
 * Get aggregate statistics for the dashboard.
 */
async function getStats() {
  // Total reports
  const { count: total } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'merged');

  // Count by status
  const statusCounts = {};
  for (const status of ['submitted', 'analyzing', 'assigned', 'in_progress', 'resolved', 'rejected', 'merged']) {
    const { count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    statusCounts[status] = count || 0;
  }

  // Count by priority level
  const priorityCounts = {};
  for (const level of ['low', 'medium', 'high', 'urgent']) {
    const { count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('priority_level', level);
    priorityCounts[level] = count || 0;
  }

  // Reports created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: todayCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'merged')
    .gte('created_at', today.toISOString());

  return {
    total: total || 0,
    by_status: statusCounts,
    by_priority: priorityCounts,
    today: todayCount || 0,
    pending: (statusCounts.submitted || 0) + (statusCounts.analyzing || 0) + (statusCounts.assigned || 0),
    active: statusCounts.in_progress || 0,
    resolved: statusCounts.resolved || 0,
    urgent: priorityCounts.urgent || 0,
    merged: statusCounts.merged || 0,
  };
}

/**
 * Get paginated and filtered reports for the dashboard.
 */
async function getReports(filters = {}) {
  const {
    status,
    severity,
    department,
    priority_level,
    page = 1,
    limit = 20,
    sort_by = 'created_at',
    sort_order = 'desc',
  } = filters;

  let query = supabase
    .from('reports')
    .select('*', { count: 'exact' });

  // Apply filters
  if (status) query = query.eq('status', status);
  if (!status) query = query.neq('status', 'merged');
  if (severity) query = query.eq('severity', severity);
  if (department) query = query.eq('assigned_department', department);
  if (priority_level) query = query.eq('priority_level', priority_level);

  // Sorting
  query = query.order(sort_by, { ascending: sort_order === 'asc' });

  // Secondary sort by priority for consistent ordering
  if (sort_by !== 'priority_score') {
    query = query.order('priority_score', { ascending: false });
  }

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

module.exports = { getStats, getReports };
