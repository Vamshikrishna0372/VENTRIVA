import api from './api';

export const getInvestorProfile = async () => {
  const response = await api.get('/investors/me');
  return response.data;
};

export const updateInvestorProfile = async (profileData) => {
  const response = await api.put('/investors/me', profileData);
  return response.data;
};

export default {
  getInvestorProfile,
  updateInvestorProfile,
};
