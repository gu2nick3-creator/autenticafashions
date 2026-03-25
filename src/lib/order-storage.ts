import type { CartItem } from "@/contexts/CartContext";

export type SavedAddress = {
  id: string;
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
  customerId?: string;
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

export const ORDERS_KEY = "af_orders";
export const PENDING_CHECKOUTS_KEY = "af_pending_checkouts";

export const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const saveJson = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

export const savePendingCheckout = (order: CheckoutPendingOrder) => {
  const pending = readJson<Record<string, CheckoutPendingOrder>>(PENDING_CHECKOUTS_KEY, {});
  pending[order.id] = order;
  saveJson(PENDING_CHECKOUTS_KEY, pending);
};

export const getPendingCheckout = (orderId: string) => {
  const pending = readJson<Record<string, CheckoutPendingOrder>>(PENDING_CHECKOUTS_KEY, {});
  return pending[orderId];
};

export const removePendingCheckout = (orderId: string) => {
  const pending = readJson<Record<string, CheckoutPendingOrder>>(PENDING_CHECKOUTS_KEY, {});
  delete pending[orderId];
  saveJson(PENDING_CHECKOUTS_KEY, pending);
};

export const persistPaidOrder = (order: CheckoutPendingOrder) => {
  const orders = readJson<CheckoutPendingOrder[]>(ORDERS_KEY, []);
  const exists = orders.some((item) => item.id === order.id);
  if (exists) return false;
  saveJson(ORDERS_KEY, [order, ...orders]);
  return true;
};
