import api from './axios';

export const createProfile = (profileData) =>
  api.post('/api/users/profile', profileData);

export const getProfile = (userId) =>
  api.get(`/api/users/profile/${encodeURIComponent(userId)}`);

export const updateProfile = (userId, profileData) =>
  api.put(`/api/users/profile/${encodeURIComponent(userId)}`, profileData);
