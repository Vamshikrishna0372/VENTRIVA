/**
 * Client-side Controlled Enums and Formatting Helpers for Corporate Governance
 */

export const BOARD_ROLES = [
  'Founder Director',
  'Investor Director',
  'Independent Director',
  'Observer',
  'Chairperson',
];

export const BOARD_MEMBER_STATUSES = [
  'Active',
  'Pending Approval',
  'Retired',
  'Resigned',
  'Terminated',
];

export const MEETING_STATUSES = [
  'Scheduled',
  'In Progress',
  'Completed',
  'Cancelled',
  'Postponed',
];

export const MEETING_TYPES = [
  'Regular',
  'Special',
  'Emergency',
  'Annual',
  'Committee',
];

export const RESOLUTION_TYPES = [
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

export const RESOLUTION_STATUSES = [
  'Draft',
  'Proposed',
  'Voting',
  'Approved',
  'Rejected',
  'Withdrawn',
  'Expired',
];

export const VOTE_VALUES = [
  'For',
  'Against',
  'Abstain',
];

export const CORPORATE_ACTION_TYPES = [
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

export const SHARE_TRANSFER_STATUSES = [
  'Draft',
  'Proposed',
  'Under Review',
  'Approved',
  'Rejected',
  'Completed',
  'Cancelled',
];

export const COMPLIANCE_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Overdue',
  'Waived',
];

export const COMPLIANCE_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical',
];

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getGovernanceBadgeVariant = (status) => {
  switch (status) {
    case 'Active':
    case 'Approved':
    case 'Completed':
    case 'Executed':
    case 'Valid':
    case 'For':
      return 'emerald';
    case 'Proposed':
    case 'Voting':
    case 'In Progress':
    case 'Under Review':
    case 'Scheduled':
    case 'Expiring Soon':
      return 'amber';
    case 'Draft':
    case 'Pending':
    case 'Pending Approval':
    case 'Abstain':
      return 'purple';
    case 'Rejected':
    case 'Cancelled':
    case 'Overdue':
    case 'Expired':
    case 'Against':
    case 'Terminated':
      return 'rose';
    default:
      return 'slate';
  }
};
