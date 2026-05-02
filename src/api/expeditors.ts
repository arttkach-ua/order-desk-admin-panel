import api from './index';
import type { ExpeditorDto, CustomerDto, PagedResponse } from '../types';

export const getExpeditors = (params?: { page?: number; size?: number; sort?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.sort) queryParams.append('sort', params.sort);

  const queryString = queryParams.toString();
  return api.get<PagedResponse<ExpeditorDto>>(`/expeditors${queryString ? `?${queryString}` : ''}`);
};

export const getExpeditor = (id: number) =>
  api.get<ExpeditorDto>(`/expeditors/${id}`);

export const createExpeditor = (data: ExpeditorDto) =>
  api.post<ExpeditorDto>('/expeditors', data);

export const updateExpeditor = (id: number, data: ExpeditorDto) =>
  api.put<ExpeditorDto>(`/expeditors/${id}`, data);

export const deleteExpeditor = (id: number) =>
  api.delete(`/expeditors/${id}`);

export const getExpeditorCustomers = (id: number) =>
  api.get<CustomerDto[]>(`/expeditors/${id}/customers`);
