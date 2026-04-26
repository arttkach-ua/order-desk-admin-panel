import api from './index';
import type { ExpeditorDto, CustomerDto } from '../types';

export const getExpeditors = () => api.get<ExpeditorDto[]>('/expeditors');

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
