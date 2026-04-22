import api from './axios';

export const getOpenProducts = () =>
  api.get('/api/products/open');

export const getAllProducts = () =>
  api.get('/api/products');

export const getProduct = (id) =>
  api.get(`/api/products/${id}`);
