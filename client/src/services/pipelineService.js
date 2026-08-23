import api from './api';

export const savePipelineEntry = async (pipelineData) => {
  const response = await api.post('/pipelines', pipelineData);
  return response.data;
};

export const getMyPipelines = async (params = {}) => {
  const response = await api.get('/pipelines', { params });
  return response.data;
};

export const getPipelineByStartup = async (startupId) => {
  const response = await api.get(`/pipelines/${startupId}`);
  return response.data;
};

export const updatePipelineStage = async (startupId, stage, note = '') => {
  const response = await api.patch(`/pipelines/${startupId}/stage`, { stage, note });
  return response.data;
};

export const deletePipeline = async (startupId) => {
  const response = await api.delete(`/pipelines/${startupId}`);
  return response.data;
};

export const getPipelineAnalytics = async () => {
  const response = await api.get('/pipelines/analytics/summary');
  return response.data;
};

export default {
  savePipelineEntry,
  getMyPipelines,
  getPipelineByStartup,
  updatePipelineStage,
  deletePipeline,
  getPipelineAnalytics,
};
