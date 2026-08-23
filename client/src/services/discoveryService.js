import api from './api';

export const discoverStartups = async (params = {}) => {
  const response = await api.get('/startups/discover', { params });
  return response.data;
};

export const getStartupDetailForInvestor = async (id) => {
  const response = await api.get(`/startups/discover/${id}`);
  return response.data;
};

export const getInvestorMatches = async (params = {}) => {
  const response = await api.get('/investors/matches', { params });
  return response.data;
};

export default {
  discoverStartups,
  getStartupDetailForInvestor,
  getInvestorMatches,
};

