import api from './api';

export const getInvestorRecommendations = async (params = {}) => {
  const response = await api.get('/analytics/investor/recommendations', { params });
  return response.data;
};

export default {
  getInvestorRecommendations,
};
