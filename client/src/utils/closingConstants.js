/**
 * Client-side Controlled Enums and Formatting Helpers for Investment Closing
 */

export const TRANSACTION_TYPES = [
  'Priced Equity Round',
  'SAFE Conversion',
  'Convertible Note',
  'Follow-On Equity',
  'Secondary Purchase',
];

export const TRANSACTION_STATUSES = [
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

export const CONDITION_CATEGORIES = [
  'Legal',
  'Financial',
  'Corporate',
  'Compliance',
  'Documentation',
  'Payment',
  'Investor Approval',
  'Founder Approval',
];

export const CONDITION_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Waived',
  'Failed',
];

export const LEGAL_DOCUMENT_TYPES = [
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

export const LEGAL_DOCUMENT_STATUSES = [
  'Required',
  'Uploaded',
  'Under Review',
  'Approved',
  'Rejected',
  'Signed',
];

export const SIGNATURE_ROLES = [
  'Founder',
  'Investor',
  'Company Officer',
  'Witness',
];

export const SIGNATURE_STATUSES = [
  'Pending',
  'Signed',
  'Declined',
  'Expired',
];

export const PAYMENT_STATUSES = [
  'Expected',
  'Pending',
  'Submitted',
  'Verified',
  'Received',
  'Failed',
  'Cancelled',
];

export const SHARE_CLASSES = [
  'Common Stock',
  'Preferred Stock - Seed',
  'Preferred Stock - Series A',
  'Preferred Stock - Series B',
  'SAFE Option',
];

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getClosingBadgeVariant = (status) => {
  switch (status) {
    case 'Pending':
    case 'Draft':
      return 'slate';
    case 'Due Diligence':
    case 'Conditions Pending':
    case 'Documentation Pending':
      return 'amber';
    case 'Signature Pending':
    case 'Payment Pending':
      return 'purple';
    case 'Ready to Close':
      return 'cyan';
    case 'Closed':
    case 'Completed':
    case 'Verified':
    case 'Received':
    case 'Signed':
    case 'Approved':
      return 'emerald';
    case 'Cancelled':
    case 'Failed':
    case 'Expired':
    case 'Rejected':
    case 'Declined':
      return 'rose';
    default:
      return 'slate';
  }
};
