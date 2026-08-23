import api from './api';

export const submitPortfolioUpdate = async (updateData) => {
  const response = await api.post('/portfolio-updates', updateData);
  return response.data;
};

export const getUpdatesForInvestment = async (investmentId) => {
  const response = await api.get(`/portfolio-updates/investment/${investmentId}`);
  return response.data;
};

export const acknowledgePortfolioUpdate = async (id) => {
  const response = await api.post(`/portfolio-updates/${id}/acknowledge`);
  return response.data;
};
