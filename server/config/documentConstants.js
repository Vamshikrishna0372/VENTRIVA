/**
 * Centralized Document & Due-Diligence Constants
 */
const DOCUMENT_CATEGORIES = [
  'Pitch Deck',
  'Executive Summary',
  'Business Plan',
  'Financial Model',
  'Financial Statements',
  'Cap Table',
  'Market Research',
  'Product Documentation',
  'Legal Document',
  'Certificate',
  'Intellectual Property',
  'Customer Evidence',
  'Traction Evidence',
  'Fundraising Document',
  'Other',
];

const DOCUMENT_VISIBILITY = [
  'Founder Only',
  'Investors Only',
  'Specific Investors',
  'Admin Only',
];

const DOCUMENT_STATUSES = [
  'Active',
  'Archived',
  'Pending Review',
  'Rejected',
  'Suspended',
];

const ALLOWED_EXTENSIONS = [
  'pdf',
  'ppt',
  'pptx',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'csv',
  'png',
  'jpg',
  'jpeg',
];

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/png',
  'image/jpeg',
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const DEFAULT_DD_CHECKLIST_TEMPLATE = [
  { category: 'Company & Ownership', title: 'Certificate of Incorporation', description: 'Official corporate registration certificate' },
  { category: 'Company & Ownership', title: 'Cap Table & Ownership Structure', description: 'Complete capitalization table and shareholder breakdown' },
  { category: 'Financials', title: 'Historical Financial Statements', description: 'Past 1-3 years balance sheets and P&L statements' },
  { category: 'Financials', title: 'Pro Forma Financial Model', description: '3-year revenue projections and unit economics model' },
  { category: 'Product & IP', title: 'Intellectual Property Assignment', description: 'Founder & employee IP assignment agreements' },
  { category: 'Legal & Compliance', title: 'Material Contracts & Agreements', description: 'Key enterprise customer and vendor agreements' },
];

module.exports = {
  DOCUMENT_CATEGORIES,
  DOCUMENT_VISIBILITY,
  DOCUMENT_STATUSES,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  DEFAULT_DD_CHECKLIST_TEMPLATE,
};
