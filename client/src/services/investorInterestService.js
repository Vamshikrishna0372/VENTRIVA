import api from './api';

export const expressInterest = async (startupId, message = '') => {
  const response = await api.post('/interests', { startupId, message });
  return response.data;
};

export const getMyInterests = async () => {
  const response = await api.get('/interests/my');
  return response.data;
};

export const getStartupInterests = async (startupId) => {
  const response = await api.get(`/interests/startup/${startupId}`);
  return response.data;
};

export const respondToInterest = async (id, status) => {
  const response = await api.patch(`/interests/${id}/respond`, { status });
  return response.data;
};

export const withdrawInterest = async (id) => {
  const response = await api.patch(`/interests/${id}/withdraw`);
  return response.data;
};

export default {
  expressInterest,
  getMyInterests,
  getStartupInterests,
  respondToInterest,
  withdrawInterest,
};
