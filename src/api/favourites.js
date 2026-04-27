import api from './axios';

export const getFavourites = () =>
  api.get('/api/favourites');

export const addFavourite = (productId) =>
  api.post(`/api/favourites/${productId}`);

export const removeFavourite = (productId) =>
  api.delete(`/api/favourites/${productId}`);
