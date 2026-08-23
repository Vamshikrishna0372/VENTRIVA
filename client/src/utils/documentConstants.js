export const DOCUMENT_CATEGORIES = [
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

export const DOCUMENT_VISIBILITY = [
  'Founder Only',
  'Investors Only',
  'Specific Investors',
  'Admin Only',
];

export const DOCUMENT_STATUSES = [
  'Active',
  'Archived',
  'Pending Review',
  'Rejected',
  'Suspended',
];

export const ALLOWED_EXTENSIONS = [
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

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
