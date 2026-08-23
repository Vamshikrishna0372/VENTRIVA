import api from './api';

export const saveEvaluation = async (evaluationData) => {
  const response = await api.post('/evaluations', evaluationData);
  return response.data;
};

export const getMyEvaluations = async (params = {}) => {
  const response = await api.get('/evaluations/my', { params });
  return response.data;
};

export const getEvaluationByStartup = async (startupId) => {
  const response = await api.get(`/evaluations/${startupId}`);
  return response.data;
};

export const deleteEvaluation = async (startupId) => {
  const response = await api.delete(`/evaluations/${startupId}`);
  return response.data;
};

export const getEvaluationAnalytics = async () => {
  const response = await api.get('/evaluations/analytics/summary');
  return response.data;
};

export const compareStartups = async (startupIds = []) => {
  const idsParam = Array.isArray(startupIds) ? startupIds.join(',') : startupIds;
  const response = await api.get('/evaluations/compare', { params: { ids: idsParam } });
  return response.data;
};

export default {
  saveEvaluation,
  getMyEvaluations,
  getEvaluationByStartup,
  deleteEvaluation,
  getEvaluationAnalytics,
  compareStartups,
};
