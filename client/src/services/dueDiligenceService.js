import api from './api';

export const getDueDiligenceChecklist = async (startupId) => {
  const response = await api.get(`/due-diligence/${startupId}`);
  return response.data;
};

export const updateChecklistItem = async (startupId, itemId, data) => {
  const response = await api.patch(`/due-diligence/${startupId}/items/${itemId}`, data);
  return response.data;
};

export const getMyDueDiligenceWorkspaces = async () => {
  const response = await api.get('/due-diligence/my');
  return response.data;
};

export default {
  getDueDiligenceChecklist,
  updateChecklistItem,
  getMyDueDiligenceWorkspaces,
};
