import api from './index';
import type { CustomerDto } from '../types';

export const getCustomers = () => api.get<CustomerDto[]>('/customers');

export const getCustomer = (id: number) =>
  api.get<CustomerDto>(`/customers/${id}`);

export const createCustomer = (data: CustomerDto) =>
  api.post<CustomerDto>('/customers', data);

export const updateCustomer = (id: number, data: CustomerDto) =>
  api.put<CustomerDto>(`/customers/${id}`, data);

export const deleteCustomer = (id: number) =>
  api.delete(`/customers/${id}`);
