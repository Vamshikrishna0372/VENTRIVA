import api from './api';

export const uploadDocument = async (formData) => {
  const response = await api.post('/documents', formData);
  return response.data;
};

export const getDocumentsByStartup = async (startupId, params = {}) => {
  const response = await api.get(`/documents/startup/${startupId}`, { params });
  return response.data;
};

export const downloadDocumentBlob = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/download`, {
    responseType: 'blob',
  });
  return response;
};

export const uploadDocumentVersion = async (documentId, formData) => {
  const response = await api.post(`/documents/${documentId}/version`, formData);
  return response.data;
};

export const getDocumentVersions = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/versions`);
  return response.data;
};

export const updateDocument = async (documentId, metadata) => {
  const response = await api.patch(`/documents/${documentId}`, metadata);
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};

export const createDocumentRequest = async (requestData) => {
  const response = await api.post('/document-requests', requestData);
  return response.data;
};

export const getDocumentRequests = async (params = {}) => {
  const response = await api.get('/document-requests', { params });
  return response.data;
};

export const updateDocumentRequest = async (id, data) => {
  const response = await api.patch(`/document-requests/${id}`, data);
  return response.data;
};

export default {
  uploadDocument,
  getDocumentsByStartup,
  downloadDocumentBlob,
  uploadDocumentVersion,
  getDocumentVersions,
  updateDocument,
  deleteDocument,
  createDocumentRequest,
  getDocumentRequests,
  updateDocumentRequest,
};
