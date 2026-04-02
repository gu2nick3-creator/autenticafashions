import { api } from '@/lib/api';
import { Order, Address, CartItem } from '@/types';

interface CheckoutCustomer {
  name: string;
  email: string;
  phone_number: string;
}

interface PaymentItem {
  quantity: number;
  price: number;
  description: string;
}

interface CreateOrderData {
  items: CartItem[];
  address: Address;
  couponCode?: string;
  priceType: 'normal' | 'resale';
  subtotal: number;
  discount: number;
  total: number;
  customer?: CheckoutCustomer;
  paymentItems?: PaymentItem[];
}

interface InfinitePayCheckoutResponse {
  checkout_url: string;
  provider: string;
  order_nsu: string;
  raw?: unknown;
}

type CreateOrderResult = Order & {
  checkout_url?: string;
  payment?: InfinitePayCheckoutResponse;
};

export const orderService = {
  getMyOrders: () => api.get<Order[]>('/api/orders/my'),

  create: async (data: CreateOrderData): Promise<CreateOrderResult> => {
    const orderResponse = await api.post<Order>('/api/orders', {
      items: data.items,
      address: data.address,
      couponCode: data.couponCode,
      priceType: data.priceType,
      subtotal: data.subtotal,
      discount: data.discount,
      total: data.total,
    });

    if (!data.customer || !data.paymentItems || data.paymentItems.length === 0) {
      return orderResponse as CreateOrderResult;
    }

    const checkoutResponse = await api.post<InfinitePayCheckoutResponse>(
      '/api/payments/infinitepay/create-checkout',
      {
        items: data.paymentItems,
        customer: data.customer,
        order_nsu: `PED-${Date.now()}`,
      }
    );

    return {
      ...(orderResponse as Order),
      checkout_url: checkoutResponse.checkout_url,
      payment: checkoutResponse,
    };
  },
};
