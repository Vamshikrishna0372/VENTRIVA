import api from './api';

export const getShortlist = async () => {
  const response = await api.get('/shortlists');
  return response.data;
};

export const addToShortlist = async (startupId, notes = '', tags = []) => {
  const response = await api.post('/shortlists', { startupId, notes, tags });
  return response.data;
};

export const removeFromShortlist = async (startupId) => {
  const response = await api.delete(`/shortlists/${startupId}`);
  return response.data;
};

export const getShortlistStatus = async (startupId) => {
  const response = await api.get(`/shortlists/${startupId}/status`);
  return response.data;
};

export default {
  getShortlist,
  addToShortlist,
  removeFromShortlist,
  getShortlistStatus,
};
