import api from './api';

export const requestMeeting = async (meetingData) => {
  const response = await api.post('/meetings', meetingData);
  return response.data;
};

export const getMyMeetings = async (params = {}) => {
  const response = await api.get('/meetings', { params });
  return response.data;
};

export const getMeetingById = async (id) => {
  const response = await api.get(`/meetings/${id}`);
  return response.data;
};

export const confirmMeeting = async (id, meetingLink = '') => {
  const response = await api.patch(`/meetings/${id}/confirm`, { meetingLink });
  return response.data;
};

export const declineMeeting = async (id, cancellationReason = '') => {
  const response = await api.patch(`/meetings/${id}/decline`, { cancellationReason });
  return response.data;
};

export const cancelMeeting = async (id, cancellationReason = '') => {
  const response = await api.patch(`/meetings/${id}/cancel`, { cancellationReason });
  return response.data;
};

export const completeMeeting = async (id, notes = '') => {
  const response = await api.patch(`/meetings/${id}/complete`, { notes });
  return response.data;
};

export default {
  requestMeeting,
  getMyMeetings,
  getMeetingById,
  confirmMeeting,
  declineMeeting,
  cancelMeeting,
  completeMeeting,
};
