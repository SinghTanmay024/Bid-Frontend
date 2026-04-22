import api from './axios';

export const placeBid = (productId, userId) =>
  api.post(`/api/bids/${productId}?userId=${encodeURIComponent(userId)}`);

export const getBidsByUser = (userId) =>
  api.get(`/api/bids/user/${encodeURIComponent(userId)}`);

export const getBidsByProduct = (productId) =>
  api.get(`/api/bids/product/${productId}`);

export const getWinner = (productId) =>
  api.get(`/api/bids/winner/${productId}`);
