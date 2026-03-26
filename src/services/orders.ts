import { api } from '@/lib/api';
import { Order, Address, CartItem } from '@/types';

interface CreateOrderData {
  items: CartItem[];
  address: Address;
  couponCode?: string;
  priceType: 'normal' | 'resale';
  subtotal: number;
  discount: number;
  total: number;
}

export const orderService = {
  getMyOrders: () => api.get<Order[]>('/api/orders/my'),
  create: (data: CreateOrderData) => api.post<Order>('/api/orders', data),
};
