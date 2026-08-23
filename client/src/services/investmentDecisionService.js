import api from './api';

export const recordDecision = async (decisionData) => {
  const response = await api.post('/investment-decisions', decisionData);
  return response.data;
};

export const getMyDecisions = async () => {
  const response = await api.get('/investment-decisions');
  return response.data;
};
