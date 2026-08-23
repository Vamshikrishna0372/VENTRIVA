import api from './api';

export const recordPerformanceSnapshot = async (perfData) => {
  const response = await api.post('/portfolio-performance', perfData);
  return response.data;
};

export const getPerformanceForInvestment = async (investmentId) => {
  const response = await api.get(`/portfolio-performance/investment/${investmentId}`);
  return response.data;
};
