export const ANALYTICS_PERIODS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '12m', label: 'Last 12 Months' },
  { value: 'all', label: 'All Time' },
];

export const getMatchScoreColor = (score) => {
  if (score >= 80) return 'emerald';
  if (score >= 60) return 'brand';
  if (score >= 40) return 'amber';
  return 'rose';
};
