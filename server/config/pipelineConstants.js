/**
 * Centralized Deal Pipeline Constants
 */
const PIPELINE_STAGES = [
  'New',
  'Initial Review',
  'Interested',
  'Deep Review',
  'Due Diligence',
  'Partner Review',
  'Decision',
  'Invested',
  'Passed',
];

const TERMINAL_STAGES = ['Invested', 'Passed'];

const PIPELINE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const PIPELINE_STATUSES = ['Active', 'Closed'];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD'];

module.exports = {
  PIPELINE_STAGES,
  TERMINAL_STAGES,
  PIPELINE_PRIORITIES,
  PIPELINE_STATUSES,
  CURRENCIES,
};
