import { api } from '@/lib/api';
import { User } from '@/types';

export const customerService = {
  getMe: () => api.get<User>('/api/customers/me'),
  updateMe: (data: Partial<User>) => api.put<User>('/api/customers/me', data),
};
