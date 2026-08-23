import api from './api';

export const proposeTermSheet = async (dealId, termSheetData) => {
  const response = await api.post(`/deals/${dealId}/term-sheets`, termSheetData);
  return response.data;
};

export const getTermSheetsForDeal = async (dealId) => {
  const response = await api.get(`/deals/${dealId}/term-sheets`);
  return response.data;
};

export const acceptTermSheet = async (dealId, termSheetId) => {
  const response = await api.patch(`/deals/${dealId}/term-sheets/${termSheetId}/accept`);
  return response.data;
};

export const declineTermSheet = async (dealId, termSheetId, rejectionReason) => {
  const response = await api.patch(`/deals/${dealId}/term-sheets/${termSheetId}/decline`, { rejectionReason });
  return response.data;
};

export const withdrawTermSheet = async (dealId, termSheetId) => {
  const response = await api.patch(`/deals/${dealId}/term-sheets/${termSheetId}/withdraw`);
  return response.data;
};
