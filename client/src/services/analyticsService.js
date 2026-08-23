import api from './api';

export const getFounderAnalytics = async () => {
  const response = await api.get('/analytics/founder');
  return response.data;
};

export const getFounderInsights = async () => {
  const response = await api.get('/analytics/founder/insights');
  return response.data;
};

export const getInvestorAnalytics = async () => {
  const response = await api.get('/analytics/investor');
  return response.data;
};

export const getInvestorInsights = async () => {
  const response = await api.get('/analytics/investor/insights');
  return response.data;
};

export const getStartupAnalytics = async (startupId) => {
  const response = await api.get(`/analytics/startups/${startupId}`);
  return response.data;
};

export const getAdminOverviewAnalytics = async (period = 'all') => {
  const response = await api.get('/analytics/admin/overview', { params: { period } });
  return response.data;
};

export default {
  getFounderAnalytics,
  getFounderInsights,
  getInvestorAnalytics,
  getInvestorInsights,
  getStartupAnalytics,
  getAdminOverviewAnalytics,
};
