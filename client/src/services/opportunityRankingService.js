import api from './api';

export const getOpportunityRanking = async () => {
  const response = await api.get('/opportunities/ranking');
  return response.data;
};
