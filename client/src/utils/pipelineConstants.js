import { CURRENCIES } from './constants';

export { CURRENCIES };

export const PIPELINE_STAGES = [
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

export const TERMINAL_STAGES = ['Invested', 'Passed'];

export const PIPELINE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const PIPELINE_STATUSES = ['Active', 'Closed'];

export const PRIORITY_COLORS = {
  Low: 'slate',
  Medium: 'indigo',
  High: 'amber',
  Critical: 'rose',
};

export const getFollowUpStatus = (dateString) => {
  if (!dateString) return null;
  const fDate = new Date(dateString);
  const now = new Date();

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (fDate >= startOfDay && fDate <= endOfDay) {
    return { status: 'dueToday', label: 'Due Today', color: 'amber' };
  } else if (fDate < startOfDay) {
    return { status: 'overdue', label: 'Overdue', color: 'rose' };
  } else {
    return { status: 'upcoming', label: 'Upcoming', color: 'slate' };
  }
};
