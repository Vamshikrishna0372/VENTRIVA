import api from './api';

export const getOpportunityRanking = async (params = {}) => {
  const response = await api.get('/opportunities/ranking', { params });
  return response.data;
};

