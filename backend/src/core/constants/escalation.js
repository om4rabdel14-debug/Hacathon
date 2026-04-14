const { REPORT_STATUSES } = require('./reportStatus');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const SLA_DAYS_BY_PRIORITY = Object.freeze({
  low: 14,
  medium: 7,
  high: 3,
  urgent: 1,
});

const ESCALATION_STEPS = Object.freeze([
  {
    level: 1,
    key: 'internal_escalation',
    label: 'Internal escalation',
    maxOverdueDays: 3,
    nextThresholdDays: 3,
  },
  {
    level: 2,
    key: 'institutional_pressure',
    label: 'Institutional pressure',
    maxOverdueDays: 7,
    nextThresholdDays: 7,
  },
  {
    level: 3,
    key: 'community_pressure',
    label: 'Community pressure',
    maxOverdueDays: 14,
    nextThresholdDays: 14,
  },
  {
    level: 4,
    key: 'legal_documentation',
    label: 'Legal documentation',
    maxOverdueDays: 30,
    nextThresholdDays: 30,
  },
  {
    level: 5,
    key: 'external_intervention',
    label: 'External intervention',
    maxOverdueDays: Number.POSITIVE_INFINITY,
    nextThresholdDays: null,
  },
]);

function calculateSlaDueAt(priorityLevel, createdAt = new Date()) {
  const days = SLA_DAYS_BY_PRIORITY[priorityLevel] ?? SLA_DAYS_BY_PRIORITY.medium;
  const dueAt = new Date(createdAt);
  dueAt.setTime(dueAt.getTime() + (days * DAY_IN_MS));
  return dueAt.toISOString();
}

function getEscalationByOverdueDays(overdueDays) {
  return ESCALATION_STEPS.find((step) => overdueDays <= step.maxOverdueDays)
    || ESCALATION_STEPS[ESCALATION_STEPS.length - 1];
}

function getNextEscalationAt(slaDueAt, currentLevel) {
  if (!slaDueAt) return null;

  if (currentLevel <= 0) {
    return new Date(slaDueAt).toISOString();
  }

  const currentStep = ESCALATION_STEPS.find((step) => step.level === currentLevel);
  if (!currentStep?.nextThresholdDays) {
    return null;
  }

  return new Date(
    new Date(slaDueAt).getTime() + (currentStep.nextThresholdDays * DAY_IN_MS)
  ).toISOString();
}

function getEscalationSnapshot(report, now = new Date()) {
  const closedStatuses = [
    REPORT_STATUSES.RESOLVED,
    REPORT_STATUSES.REJECTED,
    REPORT_STATUSES.MERGED,
  ];

  if (!report.sla_due_at) {
    return {
      level: 0,
      stage: 'no_sla',
      label: 'No SLA deadline set',
      overdue_days: 0,
      due_at: null,
      next_escalation_at: null,
      is_overdue: false,
      is_closed: closedStatuses.includes(report.status),
    };
  }

  if (closedStatuses.includes(report.status)) {
    return {
      level: report.escalation_level || 0,
      stage: report.escalation_stage || 'closed',
      label: 'Escalation closed',
      overdue_days: 0,
      due_at: report.sla_due_at,
      next_escalation_at: null,
      is_overdue: false,
      is_closed: true,
    };
  }

  const dueAt = new Date(report.sla_due_at);
  const overdueMs = now.getTime() - dueAt.getTime();

  if (overdueMs <= 0) {
    return {
      level: 0,
      stage: 'on_time',
      label: 'Within SLA',
      overdue_days: 0,
      due_at: report.sla_due_at,
      next_escalation_at: dueAt.toISOString(),
      is_overdue: false,
      is_closed: false,
    };
  }

  const overdueDays = overdueMs / DAY_IN_MS;
  const step = getEscalationByOverdueDays(overdueDays);

  return {
    level: step.level,
    stage: step.key,
    label: step.label,
    overdue_days: Number(overdueDays.toFixed(2)),
    due_at: report.sla_due_at,
    next_escalation_at: getNextEscalationAt(report.sla_due_at, step.level),
    is_overdue: true,
    is_closed: false,
  };
}

module.exports = {
  ESCALATION_STEPS,
  SLA_DAYS_BY_PRIORITY,
  calculateSlaDueAt,
  getEscalationSnapshot,
};
