import api from './api';

export const createDealFromPipeline = async (dealData) => {
  const response = await api.post('/deals', dealData);
  return response.data;
};

export const getMyDeals = async () => {
  const response = await api.get('/deals');
  return response.data;
};

export const getDealById = async (id) => {
  const response = await api.get(`/deals/${id}`);
  return response.data;
};

export const updateDealStatus = async (id, statusData) => {
  const response = await api.patch(`/deals/${id}/status`, statusData);
  return response.data;
};

export const archiveDeal = async (id) => {
  const response = await api.patch(`/deals/${id}/archive`);
  return response.data;
};
