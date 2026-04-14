const ISSUE_TYPES = Object.freeze({
  OVERFLOWING_BIN: 'overflowing_bin',
  ILLEGAL_DUMPING: 'illegal_dumping',
  CONSTRUCTION_DEBRIS: 'construction_debris',
  SCATTERED_GARBAGE: 'scattered_garbage',
  BURNING_WASTE: 'burning_waste',
  BROKEN_CONTAINER: 'broken_container',
  INVALID: 'invalid',
});

const ISSUE_TYPE_LIST = Object.values(ISSUE_TYPES);

const ISSUE_TYPE_LABELS = Object.freeze({
  [ISSUE_TYPES.OVERFLOWING_BIN]: 'Overflowing Bin',
  [ISSUE_TYPES.ILLEGAL_DUMPING]: 'Illegal Dumping',
  [ISSUE_TYPES.CONSTRUCTION_DEBRIS]: 'Construction Debris',
  [ISSUE_TYPES.SCATTERED_GARBAGE]: 'Scattered Garbage',
  [ISSUE_TYPES.BURNING_WASTE]: 'Burning Waste',
  [ISSUE_TYPES.BROKEN_CONTAINER]: 'Broken Container',
  [ISSUE_TYPES.INVALID]: 'Invalid / Unrelated',
});

module.exports = { ISSUE_TYPES, ISSUE_TYPE_LIST, ISSUE_TYPE_LABELS };
