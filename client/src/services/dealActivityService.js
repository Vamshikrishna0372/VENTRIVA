import api from './api';

export const getDealActivities = async (dealId) => {
  const response = await api.get(`/deals/${dealId}/activities`);
  return response.data;
};
