const SEVERITY_LEVELS = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

const SEVERITY_LIST = Object.values(SEVERITY_LEVELS);

module.exports = { SEVERITY_LEVELS, SEVERITY_LIST };
