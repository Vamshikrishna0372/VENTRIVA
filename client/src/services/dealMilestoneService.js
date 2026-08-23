import api from './api';

export const createMilestone = async (dealId, milestoneData) => {
  const response = await api.post(`/deals/${dealId}/milestones`, milestoneData);
  return response.data;
};

export const getMilestonesForDeal = async (dealId) => {
  const response = await api.get(`/deals/${dealId}/milestones`);
  return response.data;
};

export const updateMilestoneStatus = async (dealId, milestoneId, status) => {
  const response = await api.patch(`/deals/${dealId}/milestones/${milestoneId}`, { status });
  return response.data;
};

export const deleteMilestone = async (dealId, milestoneId) => {
  const response = await api.delete(`/deals/${dealId}/milestones/${milestoneId}`);
  return response.data;
};
