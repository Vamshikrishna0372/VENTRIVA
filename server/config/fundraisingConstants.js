/**
 * Controlled Enum Values for Phase 17 Fundraising System
 */

const ROUND_TYPES = [
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

const ROUND_STATUSES = [
  'Draft',
  'Open',
  'Soft Commitments',
  'In Due Diligence',
  'Term Sheet Stage',
  'Closing',
  'Closed',
  'Cancelled',
];

const COMMITMENT_STATUSES = [
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

const INVESTOR_ROLES = [
  'Lead Investor',
  'Co-Investor',
  'Participant',
];

const FUNDING_STAGES = [
  'Pre-Fundraising',
  'Fundraising',
  'Near Target',
  'Target Reached',
  'Oversubscribed',
  'Closing',
  'Closed',
];

const INVITE_STATUSES = [
  'Pending',
  'Accepted',
  'Declined',
  'Withdrawn',
  'Expired',
];

const MILESTONE_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Cancelled',
];

module.exports = {
  ROUND_TYPES,
  ROUND_STATUSES,
  COMMITMENT_STATUSES,
  INVESTOR_ROLES,
  FUNDING_STAGES,
  INVITE_STATUSES,
  MILESTONE_STATUSES,
};
