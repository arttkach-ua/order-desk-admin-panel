import api from './index';
import type {
  PriceTypeDto,
  PriceDto,
  BatchPriceRequestDto,
} from '../types';

export const getPriceTypes = () => api.get<PriceTypeDto[]>('/price_type');

export const createPriceType = (data: PriceTypeDto) =>
  api.post<PriceTypeDto>('/price_type', data);

export const createPriceTypesBatch = (data: PriceTypeDto[]) =>
  api.post<PriceTypeDto[]>('/price_type/batch', data);

export const getPrices = () => api.get<PriceDto[]>('/prices');

export const getCurrentPrices = () => api.get<PriceDto[]>('/prices/current');

export const getCurrentPricesByType = (priceType: string) =>
  api.get<PriceDto[]>(`/prices/current/${priceType}`);

export const createPricesBatch = (data: BatchPriceRequestDto) =>
  api.post<PriceDto[]>('/prices/batch', data);
