import api from './index';
import type { ProductCategoryDto } from '../types';

export const getCategories = () =>
  api.get<ProductCategoryDto[]>('/product-categories');

export const createCategory = (data: ProductCategoryDto) =>
  api.post<ProductCategoryDto>('/product-categories', data);
