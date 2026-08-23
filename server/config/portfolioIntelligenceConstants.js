/**
 * Centralized Portfolio Intelligence & Exit Management Constants
 */
const PERFORMANCE_PERIODS = ['Monthly', 'Quarterly', 'Yearly', 'Custom'];

const PERFORMANCE_METRICS = [
  'Revenue',
  'Revenue Growth',
  'MRR',
  'ARR',
  'Customer Count',
  'Burn Rate',
  'Cash Balance',
  'Runway',
  'Valuation',
  'Ownership',
  'Investment Value',
];

const FOLLOW_ON_STATUSES = [
  'Proposed',
  'Under Review',
  'Approved',
  'Declined',
  'Invested',
  'Withdrawn',
];

const FOLLOW_ON_TYPES = [
  'Pro Rata',
  'Follow-On',
  'Bridge',
  'Extension',
  'Secondary',
];

const EXIT_STATUSES = [
  'Planned',
  'In Progress',
  'Completed',
  'Cancelled',
];

const EXIT_TYPES = [
  'Acquisition',
  'IPO',
  'Secondary Sale',
  'Buyback',
  'Merger',
  'Write-Off',
  'Other',
];

const PERFORMANCE_TRENDS = [
  'Strong Growth',
  'Growing',
  'Stable',
  'Declining',
  'Critical',
];

const ALERT_TYPES = [
  'Runway Risk',
  'Revenue Decline',
  'Missed Milestone',
  'Update Overdue',
  'Valuation Change',
  'Follow-On Opportunity',
  'Exit Event',
  'Ownership Dilution',
];

const ALERT_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const PORTFOLIO_DECISIONS = [
  'Continue Monitoring',
  'Increase Exposure',
  'Maintain',
  'Reduce Exposure',
  'Prepare Exit',
  'Write Off',
];

module.exports = {
  PERFORMANCE_PERIODS,
  PERFORMANCE_METRICS,
  FOLLOW_ON_STATUSES,
  FOLLOW_ON_TYPES,
  EXIT_STATUSES,
  EXIT_TYPES,
  PERFORMANCE_TRENDS,
  ALERT_TYPES,
  ALERT_PRIORITIES,
  PORTFOLIO_DECISIONS,
};
