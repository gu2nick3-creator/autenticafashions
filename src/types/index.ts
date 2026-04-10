export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  priceNormal: number;
  priceResale: number;
  stock: number;
  active: boolean;
  featured: boolean;
  isNew: boolean;
  isPopular: boolean;
  type: 'roupas' | 'sapatos';
  sizes: string[];
  colors: ProductColor[];
  images: string[];
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface CartItem {
  product: Product;
  priceType: 'normal' | 'resale';
  quantity: number;
  selectedColor?: string;
  sizeDistribution: Record<string, number>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  address: Address;
  role: 'client' | 'admin';
  createdAt: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

export type ShippingMethod = 'padrao' | 'expressa' | 'retirada';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: Address;
  items: CartItem[];
  priceType: 'normal' | 'resale';
  subtotal: number;
  discount: number;
  shippingMethod: ShippingMethod;
  shippingPrice: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  trackingCode?: string;
  carrier?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'em_analise' | 'em_preparo' | 'pago' | 'enviado' | 'entregue' | 'cancelado';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'value';
  discount: number;
  validUntil: string;
  maxUses: number;
  currentUses: number;
  usesPerClient: number;
  active: boolean;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  em_analise: 'Em Análise',
  em_preparo: 'Em Preparo',
  pago: 'Pago',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};
