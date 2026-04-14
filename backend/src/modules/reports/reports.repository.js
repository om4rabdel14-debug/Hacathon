const BaseRepository = require('../../integrations/database/base.repository');

class ReportsRepository extends BaseRepository {
  constructor() {
    super('reports');
  }

  async findByIdWithDetails(id) {
    const { data, error } = await this.db
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async findForTracking(id) {
    // Get report
    const { data: report, error: reportError } = await this.db
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (reportError) throw reportError;
    if (!report) return null;

    // Get timeline
    const { data: updates, error: updatesError } = await this.db
      .from('report_updates')
      .select('*')
      .eq('report_id', id)
      .order('changed_at', { ascending: true });

    if (updatesError) throw updatesError;

    // Get resolution images
    const { data: resolutionImages, error: imgError } = await this.db
      .from('resolution_images')
      .select('*')
      .eq('report_id', id)
      .order('uploaded_at', { ascending: true });

    if (imgError) throw imgError;

    return {
      ...report,
      timeline: updates || [],
      resolution_images: resolutionImages || [],
    };
  }

  async getTimeline(reportId) {
    const { data, error } = await this.db
      .from('report_updates')
      .select('*')
      .eq('report_id', reportId)
      .order('changed_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async insertTimelineEntry(entry) {
    const { data, error } = await this.db
      .from('report_updates')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new ReportsRepository();
