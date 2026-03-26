import { api } from '@/lib/api';
import { Product } from '@/types';

export const productService = {
  getAll: () => api.get<Product[]>('/api/products'),
  getById: (id: string) => api.get<Product>(`/api/products/${id}`),
};
