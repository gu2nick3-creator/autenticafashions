import type { CartItem } from "@/types/api";

export type SavedAddress = {
  id: string | number;
  label: string;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  complement?: string;
};

export type CheckoutPendingOrder = {
  id: string;
  customerId?: string | number;
  clientName: string;
  clientEmail: string;
  cpf?: string;
  address: string;
  addressData: SavedAddress;
  status: string;
  trackingCode: string;
  items: number;
  total: number;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  receiptUrl?: string;
  transactionNsu?: string;
  invoiceSlug?: string;
  lineItems: CartItem[];
};

export const ORDERS_KEY = "af_orders_backend";
export const PENDING_CHECKOUTS_KEY = "af_pending_checkouts_backend";
export const readJson = <T,>(_key: string, fallback: T): T => fallback;
export const saveJson = (_key: string, _value: unknown) => undefined;
export const savePendingCheckout = (_order: CheckoutPendingOrder) => undefined;
export const getPendingCheckout = (_orderId: string) => undefined;
export const removePendingCheckout = (_orderId: string) => undefined;
export const persistPaidOrder = (_order: CheckoutPendingOrder) => true;
