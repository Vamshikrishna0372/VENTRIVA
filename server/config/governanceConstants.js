/**
 * Controlled Enum Definitions for Phase 19 Corporate Governance, Board Operations, Equity Administration & Compliance
 */

const BOARD_ROLES = [
  'Founder Director',
  'Investor Director',
  'Independent Director',
  'Observer',
  'Chairperson',
];

const BOARD_MEMBER_STATUSES = [
  'Active',
  'Pending Approval',
  'Retired',
  'Resigned',
  'Terminated',
];

const MEETING_STATUSES = [
  'Scheduled',
  'In Progress',
  'Completed',
  'Cancelled',
  'Postponed',
];

const MEETING_TYPES = [
  'Regular',
  'Special',
  'Emergency',
  'Annual',
  'Committee',
];

const RESOLUTION_TYPES = [
  'Investment',
  'Fundraising',
  'Share Issuance',
  'Share Transfer',
  'ESOP',
  'Corporate Action',
  'Board Appointment',
  'Budget',
  'Strategic Decision',
  'Other',
];

const RESOLUTION_STATUSES = [
  'Draft',
  'Proposed',
  'Voting',
  'Approved',
  'Rejected',
  'Withdrawn',
  'Expired',
];

const VOTING_STATUSES = [
  'Open',
  'Closed',
  'Extended',
];

const VOTE_TYPES = [
  'Board Vote',
  'Shareholder Vote',
  'Investor Majority Vote',
];

const VOTE_VALUES = [
  'For',
  'Against',
  'Abstain',
];

const CORPORATE_ACTION_TYPES = [
  'Share Issuance',
  'Share Transfer',
  'Share Buyback',
  'Stock Split',
  'Stock Consolidation',
  'ESOP Allocation',
  'Convertible Conversion',
  'Secondary Sale',
  'Dividend',
  'Other',
];

const CORPORATE_ACTION_STATUSES = [
  'Draft',
  'Proposed',
  'Approval Required',
  'Approved',
  'Executed',
  'Cancelled',
];

const SHARE_TRANSFER_STATUSES = [
  'Draft',
  'Proposed',
  'Under Review',
  'Approved',
  'Rejected',
  'Completed',
  'Cancelled',
];

const EQUITY_POOL_TYPES = [
  'ESOP Pool',
  'Advisor Pool',
  'Warrant Pool',
  'Executive Option Pool',
];

const EQUITY_POOL_STATUSES = [
  'Active',
  'Draft',
  'Depleted',
  'Closed',
];

const COMPLIANCE_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Overdue',
  'Waived',
];

const COMPLIANCE_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

const DOCUMENT_EXPIRY_STATUSES = [
  'Valid',
  'Expiring Soon',
  'Expired',
  'No Expiry',
];

const GOVERNANCE_RIGHT_TYPES = [
  'Voting Rights',
  'Board Seat',
  'Board Observer',
  'Information Rights',
  'Pro-Rata Rights',
  'Pre-Emptive Rights',
  'Veto Rights',
  'Drag-Along',
  'Tag-Along',
  'ROFR',
  'ROFO',
];

const GOVERNANCE_EVENT_TYPES = [
  'BOARD_APPOINTED',
  'BOARD_REMOVED',
  'MEETING_SCHEDULED',
  'MEETING_COMPLETED',
  'RESOLUTION_PROPOSED',
  'VOTE_CAST',
  'RESOLUTION_APPROVED',
  'RESOLUTION_REJECTED',
  'CORPORATE_ACTION_EXECUTED',
  'SHARE_TRANSFER_COMPLETED',
  'EQUITY_POOL_ALLOCATED',
  'GOVERNANCE_RIGHT_UPDATED',
  'COMPLIANCE_COMPLETED',
  'COMPLIANCE_OVERDUE',
  'DOCUMENT_EXPIRED',
];

module.exports = {
  BOARD_ROLES,
  BOARD_MEMBER_STATUSES,
  MEETING_STATUSES,
  MEETING_TYPES,
  RESOLUTION_TYPES,
  RESOLUTION_STATUSES,
  VOTING_STATUSES,
  VOTE_TYPES,
  VOTE_VALUES,
  CORPORATE_ACTION_TYPES,
  CORPORATE_ACTION_STATUSES,
  SHARE_TRANSFER_STATUSES,
  EQUITY_POOL_TYPES,
  EQUITY_POOL_STATUSES,
  COMPLIANCE_STATUSES,
  COMPLIANCE_PRIORITIES,
  DOCUMENT_EXPIRY_STATUSES,
  GOVERNANCE_RIGHT_TYPES,
  GOVERNANCE_EVENT_TYPES,
};
