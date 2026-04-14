const REPORT_STATUSES = Object.freeze({
  SUBMITTED: 'submitted',
  ANALYZING: 'analyzing',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  MERGED: 'merged',
});

const STATUS_LIST = Object.values(REPORT_STATUSES);

// Valid status transitions
const STATUS_TRANSITIONS = Object.freeze({
  [REPORT_STATUSES.SUBMITTED]: [REPORT_STATUSES.ANALYZING, REPORT_STATUSES.REJECTED],
  [REPORT_STATUSES.ANALYZING]: [REPORT_STATUSES.ASSIGNED, REPORT_STATUSES.REJECTED],
  [REPORT_STATUSES.ASSIGNED]: [REPORT_STATUSES.IN_PROGRESS, REPORT_STATUSES.REJECTED],
  [REPORT_STATUSES.IN_PROGRESS]: [REPORT_STATUSES.RESOLVED, REPORT_STATUSES.ASSIGNED],
  [REPORT_STATUSES.RESOLVED]: [],
  [REPORT_STATUSES.REJECTED]: [],
  [REPORT_STATUSES.MERGED]: [],
});

function isValidTransition(from, to) {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

function isClosedStatus(status) {
  return [
    REPORT_STATUSES.RESOLVED,
    REPORT_STATUSES.REJECTED,
    REPORT_STATUSES.MERGED,
  ].includes(status);
}

module.exports = {
  REPORT_STATUSES,
  STATUS_LIST,
  STATUS_TRANSITIONS,
  isValidTransition,
  isClosedStatus,
};
