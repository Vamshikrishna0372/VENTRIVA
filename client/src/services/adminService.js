import api from './api';

export const getAdminDashboardMetrics = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getAdminUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUserStatus = async (id, isActive, reason = '') => {
  const response = await api.patch(`/admin/users/${id}/status`, { isActive, reason });
  return response.data;
};

export const deleteUserAccount = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const updateUserVerification = async (id, isVerified) => {
  const response = await api.patch(`/admin/users/${id}/verification`, { isVerified });
  return response.data;
};

export const getAdminStartups = async (params = {}) => {
  const response = await api.get('/admin/startups', { params });
  return response.data;
};

export const getAdminStartupById = async (id) => {
  const response = await api.get(`/admin/startups/${id}`);
  return response.data;
};

export const updateStartupVerification = async (id, verificationStatus, reason = '') => {
  const response = await api.patch(`/admin/startups/${id}/verification`, { verificationStatus, reason });
  return response.data;
};

export const updateStartupPublication = async (id, isPublished, profileVisibility, reason = '') => {
  const response = await api.patch(`/admin/startups/${id}/publication`, { isPublished, profileVisibility, reason });
  return response.data;
};

export const createModerationFlag = async (flagData) => {
  const response = await api.post('/admin/flags', flagData);
  return response.data;
};

export const getModerationFlags = async (params = {}) => {
  const response = await api.get('/admin/flags', { params });
  return response.data;
};

export const updateModerationFlag = async (id, status, priority, resolutionNote = '') => {
  const response = await api.patch(`/admin/flags/${id}`, { status, priority, resolutionNote });
  return response.data;
};

export const getAdminAuditLogs = async (params = {}) => {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await api.get('/admin/analytics');
  return response.data;
};

export default {
  getAdminDashboardMetrics,
  getAdminUsers,
  getAdminUserById,
  updateUserStatus,
  updateUserVerification,
  getAdminStartups,
  getAdminStartupById,
  updateStartupVerification,
  updateStartupPublication,
  createModerationFlag,
  getModerationFlags,
  updateModerationFlag,
  getAdminAuditLogs,
  getAdminAnalytics,
};
