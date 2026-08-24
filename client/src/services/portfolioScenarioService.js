import api from './api';

export const calculateScenario = async (scenarioData) => {
  const response = await api.post('/portfolio-scenarios/calculate', scenarioData);
  return response.data;
};

export const getSavedScenarios = async () => {
  const response = await api.get('/portfolio-scenarios');
  return response.data;
};

export const deleteScenario = async (id) => {
  const response = await api.delete(`/portfolio-scenarios/${id}`);
  return response.data;
};
