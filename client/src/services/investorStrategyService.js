import api from './api';

export const getMyStrategy = async () => {
  const response = await api.get('/investor-strategy');
  return response.data;
};

export const saveStrategy = async (strategyData) => {
  const response = await api.post('/investor-strategy', strategyData);
  return response.data;
};
