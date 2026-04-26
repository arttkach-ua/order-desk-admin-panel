import api from './index';
import type { ProductDto } from '../types';

export const getProducts = (page = 0, size = 100, category?: string) => {
  const params: Record<string, unknown> = { page, size };
  if (category) params.category = category;
  return api.get<ProductDto[]>('/products', { params });
};

export const createProduct = (data: ProductDto) =>
  api.post<ProductDto>('/products', data);
