import api from './api';

export const saveAllocationPlan = async (planData) => {
  const response = await api.post('/capital-allocations', planData);
  return response.data;
};

export const getAllocationPlans = async () => {
  const response = await api.get('/capital-allocations');
  return response.data;
};
