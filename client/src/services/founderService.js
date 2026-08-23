import api from './api';

export const getFounderProfile = async () => {
  const response = await api.get('/founders/me');
  return response.data;
};

export const updateFounderProfile = async (profileData) => {
  const response = await api.put('/founders/me', profileData);
  return response.data;
};

export default {
  getFounderProfile,
  updateFounderProfile,
};
