import api from './api';

export const getMessages = async (conversationId) => {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
};

export const sendMessage = async (conversationId, messageText) => {
  const response = await api.post(`/messages/${conversationId}`, { message: messageText });
  return response.data;
};

export const markMessageRead = async (messageId) => {
  const response = await api.patch(`/messages/${messageId}/read`);
  return response.data;
};

export default {
  getMessages,
  sendMessage,
  markMessageRead,
};
