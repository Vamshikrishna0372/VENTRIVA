import api from './api';

export const recordDecision = async (decisionData) => {
  const response = await api.post('/investment-decisions', decisionData);
  return response.data;
};

export const getMyDecisions = async () => {
  const response = await api.get('/investment-decisions');
  return response.data;
};

export const updateDecision = async (id, decisionData) => {
  const response = await api.patch(`/investment-decisions/${id}`, decisionData);
  return response.data;
};

export const deleteDecision = async (id) => {
  const response = await api.delete(`/investment-decisions/${id}`);
  return response.data;
};

