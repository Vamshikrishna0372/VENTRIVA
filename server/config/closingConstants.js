/**
 * Controlled Enum Definitions for Phase 18 Investment Closing & Cap Table System
 */

const TRANSACTION_TYPES = [
  'Priced Equity Round',
  'SAFE Conversion',
  'Convertible Note',
  'Follow-On Equity',
  'Secondary Purchase',
];

const TRANSACTION_STATUSES = [
  'Pending',
  'Due Diligence',
  'Conditions Pending',
  'Documentation Pending',
  'Signature Pending',
  'Payment Pending',
  'Ready to Close',
  'Closed',
  'Cancelled',
  'Failed',
  'Expired',
];

const CONDITION_CATEGORIES = [
  'Legal',
  'Financial',
  'Corporate',
  'Compliance',
  'Documentation',
  'Payment',
  'Investor Approval',
  'Founder Approval',
];

const CONDITION_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Waived',
  'Failed',
];

const LEGAL_DOCUMENT_TYPES = [
  'Term Sheet',
  'Share Subscription Agreement',
  'Shareholders Agreement',
  'Board Resolution',
  'Founder Consent',
  'Investor Consent',
  'KYC Compliance Document',
  'Payment Confirmation',
  'Closing Certificate',
];

const LEGAL_DOCUMENT_STATUSES = [
  'Required',
  'Uploaded',
  'Under Review',
  'Approved',
  'Rejected',
  'Signed',
];

const SIGNATURE_ROLES = [
  'Founder',
  'Investor',
  'Company Officer',
  'Witness',
];

const SIGNATURE_STATUSES = [
  'Pending',
  'Signed',
  'Declined',
  'Expired',
];

const PAYMENT_STATUSES = [
  'Expected',
  'Pending',
  'Submitted',
  'Verified',
  'Received',
  'Failed',
  'Cancelled',
];

const SHARE_CLASSES = [
  'Common Stock',
  'Preferred Stock',
  'Preferred Stock - Seed',
  'Preferred Stock - Series Seed',
  'Preferred Stock - Series A',
  'Preferred Stock - Series B',
  'SAFE Option',
  'Options',
];

module.exports = {
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  CONDITION_CATEGORIES,
  CONDITION_STATUSES,
  LEGAL_DOCUMENT_TYPES,
  LEGAL_DOCUMENT_STATUSES,
  SIGNATURE_ROLES,
  SIGNATURE_STATUSES,
  PAYMENT_STATUSES,
  SHARE_CLASSES,
};
