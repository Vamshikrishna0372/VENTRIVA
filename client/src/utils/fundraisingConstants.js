/**
 * Client-side Controlled Enum Values and Formatting Utilities for Fundraising
 */

export const ROUND_TYPES = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Bridge',
  'SAFE',
  'Convertible Note',
  'Other',
];

export const ROUND_STATUSES = [
  'Draft',
  'Open',
  'Soft Commitments',
  'In Due Diligence',
  'Term Sheet Stage',
  'Closing',
  'Closed',
  'Cancelled',
];

export const COMMITMENT_STATUSES = [
  'Interested',
  'Invited',
  'Soft Committed',
  'Due Diligence',
  'Term Sheet Proposed',
  'Committed',
  'Declined',
  'Withdrawn',
  'Funded',
];

export const INVESTOR_ROLES = [
  'Lead Investor',
  'Co-Investor',
  'Participant',
];

export const FUNDING_STAGES = [
  'Pre-Fundraising',
  'Fundraising',
  'Near Target',
  'Target Reached',
  'Oversubscribed',
  'Closing',
  'Closed',
];

export const INVITE_STATUSES = [
  'Pending',
  'Accepted',
  'Declined',
  'Withdrawn',
  'Expired',
];

export const MILESTONE_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Cancelled',
];

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'Draft':
      return 'slate';
    case 'Open':
    case 'Fundraising':
      return 'brand';
    case 'Soft Commitments':
    case 'Near Target':
    case 'In Due Diligence':
      return 'amber';
    case 'Term Sheet Stage':
    case 'Committed':
      return 'purple';
    case 'Target Reached':
    case 'Oversubscribed':
    case 'Closed':
    case 'Funded':
    case 'Completed':
      return 'emerald';
    case 'Closing':
      return 'blue';
    case 'Cancelled':
    case 'Declined':
    case 'Withdrawn':
      return 'rose';
    default:
      return 'slate';
  }
};
