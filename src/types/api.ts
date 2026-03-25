export type ProductType = "roupas" | "sapatos";
export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export interface ColorOption { name: string; hex: string; }
export interface Category { id: number; name: string; slug: string; image?: string; subcategories?: Subcategory[]; }
export interface Subcategory { id: number; category_id: number; name: string; slug: string; }
export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  categorySlug: string;
  subcategory?: string | null;
  subcategorySlug?: string | null;
  productType: ProductType;
  sizes: string[];
  colors: ColorOption[];
  normalPrice: number;
  resalePrice: number;
  images: string[];
  active: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  isLaunch?: boolean;
  discount?: number;
}
export interface Address {
  id: number;
  label: string;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  complement?: string;
}
export interface User {
  id: number;
  name: string;
  email: string;
  cpf?: string;
  role: "admin" | "customer";
  addresses?: Address[];
  createdAt?: string;
}
export interface CartItem {
  id?: number;
  productId: number;
  name: string;
  image: string;
  size: string;
  color: string;
  qty: number;
  unitPrice?: number;
  priceType?: "normal" | "revenda";
  selectedSizes?: string[];
  isResaleKit?: boolean;
}
export interface Coupon { id: number; code: string; discount: number; expiresAt: string; usageLimit: number; usedCount: number; active: boolean; }
export interface OrderItem { id?: number; productId: number; name: string; image?: string; size: string; color: string; qty: number; unitPrice: number; priceType: "normal" | "revenda"; selectedSizes?: string[]; }
export interface Order {
  id: number;
  code: string;
  customerId?: number;
  clientName: string;
  clientEmail: string;
  address: string;
  addressLabel?: string;
  status: OrderStatus;
  trackingCode: string;
  items: number;
  total: number;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  orderItems: OrderItem[];
}
export interface DashboardMetrics { revenue: number; orders: number; products: number; customers: number; averageTicket: number; processingOrders: number; shippedOrders: number; }
