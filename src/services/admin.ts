import { api } from '@/lib/api';
import { Product, Category, Order, Coupon, User, OrderStatus } from '@/types';

interface DashboardData {
  totalRevenue: number;
  paidOrders: number;
  pendingOrders: number;
  totalOrders: number;
}

export const adminService = {
  // Dashboard
  getDashboard: () => api.get<DashboardData>('/api/admin/dashboard'),

  // Products
  getProducts: () => api.get<Product[]>('/api/admin/products'),
  createProduct: (data: Partial<Product>) => api.post<Product>('/api/admin/products', data),
  updateProduct: (id: string, data: Partial<Product>) => api.put<Product>(`/api/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/api/admin/products/${id}`),

  // Categories
  getCategories: () => api.get<Category[]>('/api/admin/categories'),
  createCategory: (data: Partial<Category>) => api.post<Category>('/api/admin/categories', data),
  updateCategory: (id: string, data: Partial<Category>) => api.put<Category>(`/api/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/api/admin/categories/${id}`),

  // Customers
  getCustomers: () => api.get<User[]>('/api/admin/customers'),

  // Orders
  getOrders: () => api.get<Order[]>('/api/admin/orders'),
  updateOrderStatus: (id: string, status: OrderStatus) => api.put(`/api/admin/orders/${id}/status`, { status }),
  updateOrderTracking: (id: string, trackingCode: string, carrier: string) => api.put(`/api/admin/orders/${id}/tracking`, { trackingCode, carrier }),

  // Coupons
  getCoupons: () => api.get<Coupon[]>('/api/admin/coupons'),
  createCoupon: (data: Partial<Coupon>) => api.post<Coupon>('/api/admin/coupons', data),
  updateCoupon: (id: string, data: Partial<Coupon>) => api.put<Coupon>(`/api/admin/coupons/${id}`, data),
  deleteCoupon: (id: string) => api.delete(`/api/admin/coupons/${id}`),

  // Uploads
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.upload<{ url: string }>('/api/admin/uploads', formData);
  },
};
