import api from './api';

export const createFollowOnOpportunity = async (followOnData) => {
  const response = await api.post('/follow-on-investments', followOnData);
  return response.data;
};

export const getFollowOnOpportunities = async () => {
  const response = await api.get('/follow-on-investments');
  return response.data;
};

export const updateFollowOnStatus = async (id, status) => {
  const response = await api.patch(`/follow-on-investments/${id}/status`, { status });
  return response.data;
};

export const convertFollowOnToInvestment = async (id) => {
  const response = await api.post(`/follow-on-investments/${id}/convert`);
  return response.data;
};
