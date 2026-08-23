import api from './api';

export const getMyConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

export const getConversationById = async (id) => {
  const response = await api.get(`/conversations/${id}`);
  return response.data;
};

export const archiveConversation = async (id) => {
  const response = await api.patch(`/conversations/${id}/archive`);
  return response.data;
};

export const blockConversation = async (id) => {
  const response = await api.patch(`/conversations/${id}/block`);
  return response.data;
};

export const markConversationRead = async (id) => {
  const response = await api.patch(`/conversations/${id}/read`);
  return response.data;
};

export default {
  getMyConversations,
  getConversationById,
  archiveConversation,
  blockConversation,
  markConversationRead,
};
