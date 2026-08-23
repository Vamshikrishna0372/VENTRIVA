import api from './api';

export const getIntelligenceAlerts = async () => {
  const response = await api.get('/portfolio-intelligence/alerts');
  return response.data;
};

export const getConcentrationAnalysis = async () => {
  const response = await api.get('/portfolio-intelligence/concentration');
  return response.data;
};
