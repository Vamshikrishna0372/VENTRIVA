/**
 * Centralized Investor Strategy, Decision Intelligence & Scenario Constants
 */
const STRATEGY_STATUSES = ['Active', 'Draft', 'Archived'];

const ALLOCATION_STATUSES = [
  'Draft',
  'Under Review',
  'Approved',
  'Rejected',
  'Executed',
  'Archived',
];

const DECISION_TYPES = [
  'Invest',
  'Increase Exposure',
  'Maintain',
  'Monitor',
  'Pass',
  'Reduce Exposure',
  'Exit',
];

const DECISION_STATUSES = [
  'Draft',
  'Recommended',
  'Approved',
  'Rejected',
  'Executed',
  'Superseded',
];

const CONFIDENCE_LEVELS = [
  'Very High',
  'High',
  'Moderate',
  'Low',
  'Very Low',
];

const RECOMMENDED_ACTIONS = [
  'Invest Now',
  'Deep Review',
  'Continue Due Diligence',
  'Monitor',
  'Pass',
];

const SCENARIO_TYPES = [
  'Base Case',
  'Conservative',
  'Growth',
  'Aggressive',
  'Downside',
  'Custom',
];

module.exports = {
  STRATEGY_STATUSES,
  ALLOCATION_STATUSES,
  DECISION_TYPES,
  DECISION_STATUSES,
  CONFIDENCE_LEVELS,
  RECOMMENDED_ACTIONS,
  SCENARIO_TYPES,
};
