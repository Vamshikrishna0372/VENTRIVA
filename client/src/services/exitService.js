import api from './api';

export const createExitTransaction = async (exitData) => {
  const response = await api.post('/exits', exitData);
  return response.data;
};

export const getExitTransactions = async () => {
  const response = await api.get('/exits');
  return response.data;
};

export const completeExitTransaction = async (id) => {
  const response = await api.post(`/exits/${id}/complete`);
  return response.data;
};
