import { supabase } from '@/lib/supabase';
import { Order, Address, CartItem, ShippingMethod } from '@/types';
import { mapOrder } from '@/lib/mappers';

interface CheckoutCustomer {
  name: string;
  email: string;
  phone_number: string;
}

interface CreateOrderData {
  items: CartItem[];
  address: Address;
  couponCode?: string;
  priceType: 'normal' | 'resale';
  subtotal: number;
  discount: number;
  shippingMethod: ShippingMethod;
  shippingPrice: number;
  total: number;
  customer?: CheckoutCustomer;
}

export const orderService = {
  getMyOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapOrder);
  },

  create: async (data: CreateOrderData): Promise<Order> => {
    const { data: row, error } = await supabase.rpc('create_order', {
      p_items: data.items,
      p_address: data.address,
      p_coupon_code: data.couponCode || null,
      p_shipping_method: data.shippingMethod,
      p_shipping_price: data.shippingPrice,
      p_customer_name: data.customer?.name || '',
      p_customer_email: data.customer?.email || '',
      p_customer_phone: data.customer?.phone_number || '',
    });
    if (error) throw new Error(error.message);
    return mapOrder(row);
  },
};
