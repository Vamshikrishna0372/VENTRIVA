/**
 * Centralized Portfolio Management & Post-Investment Constants
 */
const INVESTMENT_STATUSES = [
  'Active',
  'Monitoring',
  'Follow-on Consideration',
  'Exited',
  'Written Off',
];

const INVESTMENT_TYPES = [
  'Equity',
  'SAFE',
  'Convertible Note',
  'Debt',
  'Other',
];

const EXIT_TYPES = [
  'Acquisition',
  'IPO',
  'Secondary Sale',
  'Buyback',
  'Merger',
  'Other',
];

const PORTFOLIO_HEALTH_STATUSES = [
  'Excellent',
  'Healthy',
  'Watch',
  'At Risk',
  'Critical',
];

const MILESTONE_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Blocked',
];

const UPDATE_FREQUENCIES = [
  'Monthly',
  'Quarterly',
  'Semi-Annual',
  'Annual',
];

const PERFORMANCE_TRENDS = [
  'Improving',
  'Stable',
  'Declining',
  'Unknown',
];

module.exports = {
  INVESTMENT_STATUSES,
  INVESTMENT_TYPES,
  EXIT_TYPES,
  PORTFOLIO_HEALTH_STATUSES,
  MILESTONE_STATUSES,
  UPDATE_FREQUENCIES,
  PERFORMANCE_TRENDS,
};
