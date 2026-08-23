import api from './api';

export const getAvailability = async (founderId = null) => {
  const response = await api.get('/availability', { params: { founderId } });
  return response.data;
};

export const createAvailability = async (slotData) => {
  const response = await api.post('/availability', slotData);
  return response.data;
};

export const updateAvailability = async (id, slotData) => {
  const response = await api.put(`/availability/${id}`, slotData);
  return response.data;
};

export const deleteAvailability = async (id) => {
  const response = await api.delete(`/availability/${id}`);
  return response.data;
};

export default {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
};
