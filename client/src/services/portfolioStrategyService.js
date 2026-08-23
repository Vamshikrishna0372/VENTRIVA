import api from './api';

export const getStrategyHealthOverview = async () => {
  const response = await api.get('/portfolio-strategy/health');
  return response.data;
};
