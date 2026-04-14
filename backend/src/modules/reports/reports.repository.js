const BaseRepository = require('../../integrations/database/base.repository');
const { REPORT_STATUSES } = require('../../core/constants/reportStatus');

const DUPLICATE_RADIUS_METERS = 75;
const EARTH_RADIUS_METERS = 6371000;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(lat1, lng1, lat2, lng2) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getBoundingBox(lat, lng, radiusMeters = DUPLICATE_RADIUS_METERS) {
  const latDelta = radiusMeters / 111320;
  const lngDelta = radiusMeters / (111320 * Math.max(Math.cos(toRadians(lat)), 0.1));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

class ReportsRepository extends BaseRepository {
  constructor() {
    super('reports');
  }

  async findByIdOptional(id) {
    const { data, error } = await this.db
      .from('reports')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
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

  async findDuplicateCandidate({ lat, lng, issueType, excludeReportId = null }) {
    const { minLat, maxLat, minLng, maxLng } = getBoundingBox(lat, lng);

    let query = this.db
      .from('reports')
      .select('*')
      .is('duplicate_of_report_id', null)
      .eq('issue_type', issueType)
      .in('status', [
        REPORT_STATUSES.SUBMITTED,
        REPORT_STATUSES.ANALYZING,
        REPORT_STATUSES.ASSIGNED,
        REPORT_STATUSES.IN_PROGRESS,
      ])
      .gte('lat', minLat)
      .lte('lat', maxLat)
      .gte('lng', minLng)
      .lte('lng', maxLng)
      .order('created_at', { ascending: true });

    if (excludeReportId) {
      query = query.neq('id', excludeReportId);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data?.length) return null;

    const ranked = data
      .map((report) => ({
        ...report,
        distance_meters: calculateDistanceMeters(lat, lng, report.lat, report.lng),
      }))
      .filter((report) => report.distance_meters <= DUPLICATE_RADIUS_METERS)
      .sort((a, b) => a.distance_meters - b.distance_meters);

    return ranked[0] || null;
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

  async incrementSubmissionCount(reportId) {
    const report = await this.findByIdWithDetails(reportId);
    return this.update(reportId, {
      submission_count: (report.submission_count || 1) + 1,
    });
  }

  async getDuplicates(reportId) {
    const { data, error } = await this.db
      .from('reports')
      .select('*')
      .eq('duplicate_of_report_id', reportId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async insertFeedback(record) {
    const { data, error } = await this.db
      .from('report_feedback')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFeedback(reportId) {
    const { data, error } = await this.db
      .from('report_feedback')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getFeedbackSummary(reportId) {
    const feedback = await this.getFeedback(reportId);
    const total = feedback.length;

    if (!total) {
      return {
        total_reviews: 0,
        average_rating: null,
        resolved_confirmed_count: 0,
        unresolved_count: 0,
        satisfaction_rate: null,
        latest_review_at: null,
      };
    }

    const ratingTotal = feedback.reduce((sum, item) => sum + item.rating, 0);
    const resolvedConfirmedCount = feedback.filter((item) => item.resolved_confirmed).length;

    return {
      total_reviews: total,
      average_rating: Number((ratingTotal / total).toFixed(2)),
      resolved_confirmed_count: resolvedConfirmedCount,
      unresolved_count: total - resolvedConfirmedCount,
      satisfaction_rate: Number(((resolvedConfirmedCount / total) * 100).toFixed(2)),
      latest_review_at: feedback[0]?.created_at || null,
    };
  }

  async insertEscalation(record) {
    const { data, error } = await this.db
      .from('report_escalations')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEscalationHistory(reportId) {
    const { data, error } = await this.db
      .from('report_escalations')
      .select('*')
      .eq('report_id', reportId)
      .order('triggered_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

module.exports = new ReportsRepository();
