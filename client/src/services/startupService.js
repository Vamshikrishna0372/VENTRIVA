import api from './api';

export const getMyStartup = async () => {
  const response = await api.get('/startups/my');
  return response.data;
};

export const createStartup = async (startupData) => {
  const response = await api.post('/startups', startupData);
  return response.data;
};

export const updateMyStartup = async (id, startupData) => {
  const response = await api.put(`/startups/my/${id}`, startupData);
  return response.data;
};

export const deleteMyStartup = async (id) => {
  const response = await api.delete(`/startups/my/${id}`);
  return response.data;
};

// Team Members
export const addTeamMember = async (startupId, memberData) => {
  const response = await api.post(`/startups/my/${startupId}/team`, memberData);
  return response.data;
};

export const updateTeamMember = async (startupId, memberId, memberData) => {
  const response = await api.put(`/startups/my/${startupId}/team/${memberId}`, memberData);
  return response.data;
};

export const deleteTeamMember = async (startupId, memberId) => {
  const response = await api.delete(`/startups/my/${startupId}/team/${memberId}`);
  return response.data;
};

export const getMyStartupReadiness = async () => {
  const response = await api.get('/startups/my/readiness');
  return response.data;
};

export default {
  getMyStartup,
  getMyStartupReadiness,
  createStartup,
  updateMyStartup,
  deleteMyStartup,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
};

