/**
 * Centralized Investment Deal Room & Term Sheet Constants
 */
const DEAL_STATUSES = [
  'Draft',
  'Active',
  'Negotiating',
  'Term Sheet Proposed',
  'Term Sheet Accepted',
  'Due Diligence',
  'Investment Committee',
  'Approved',
  'Closing',
  'Closed',
  'Invested',
  'Withdrawn',
  'Rejected',
  'Passed',
];

const TERM_SHEET_STATUSES = [
  'Draft',
  'Proposed',
  'Under Review',
  'Accepted',
  'Rejected',
  'Withdrawn',
  'Superseded',
];

const DEAL_TYPES = [
  'Priced Equity Round',
  'SAFE (Simple Agreement for Future Equity)',
  'Convertible Note',
  'Debt Financing',
  'Grant / Non-Dilutive',
];

const MILESTONE_STATUSES = ['Pending', 'In Progress', 'Completed', 'Waived'];

module.exports = {
  DEAL_STATUSES,
  TERM_SHEET_STATUSES,
  DEAL_TYPES,
  MILESTONE_STATUSES,
};
