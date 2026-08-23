import api from './api';

export const createInvestmentFromDeal = async (dealId, investmentData) => {
  const response = await api.post(`/investments/from-deal/${dealId}`, investmentData);
  return response.data;
};

export const getMyInvestments = async () => {
  const response = await api.get('/investments');
  return response.data;
};

export const getInvestmentById = async (id) => {
  const response = await api.get(`/investments/${id}`);
  return response.data;
};

export const getPortfolioAnalytics = async () => {
  const response = await api.get('/investments/portfolio/analytics');
  return response.data;
};

export const updateInvestmentStatus = async (id, statusData) => {
  const response = await api.patch(`/investments/${id}/status`, statusData);
  return response.data;
};
