import { api } from '@/lib/api';
import { Category } from '@/types';

export const categoryService = {
  getAll: () => api.get<Category[]>('/api/categories'),
};
