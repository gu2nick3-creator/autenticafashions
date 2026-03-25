export type ColorOption = { name: string; hex: string };

export type Product = {
  id: string;
  sku?: string;
  name: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  subcategorySlug?: string;
  images: string[];
  sizes: string[];
  colors: ColorOption[];
  description: string;
  productType?: "roupas" | "sapatos";
  normalPrice: number;
  resalePrice: number;
  isNew?: boolean;
  discount?: number | null;
  isPopular?: boolean;
  isLaunch?: boolean;
  isClearance?: boolean;
  status?: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  subcategories?: { id: string; name: string; slug: string }[];
};

export type Address = {
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

export type User = {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  addresses?: Address[];
  isAdmin?: boolean;
  createdAt?: string;
};

export type CartItem = {
  id?: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  qty: number;
  unitPrice?: number;
  priceType?: "normal" | "revenda";
  selectedSizes?: string[] | null;
  isResaleKit?: boolean;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount?: number;
  isActive?: boolean;
};

export type Order = {
  id: string;
  orderNumber?: string;
  clientName?: string;
  clientEmail?: string;
  address: string;
  addressData?: Address;
  status: string;
  trackingCode?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.message || "Erro ao comunicar com a API.");
  }
  return data as T;
}

export const api = {
  me: async () => request<{ ok: boolean; user: User | null }>("/auth/me"),
  login: async (login: string, password: string) => request<{ ok: boolean; user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ login, password }) }),
  register: async (payload: { name: string; cpf: string; email: string; password: string }) => request<{ ok: boolean; user: User }>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  logout: async () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  updateProfile: async (payload: { name: string; cpf: string }) => request<{ ok: boolean; user: User }>("/account/profile", { method: "PUT", body: JSON.stringify(payload) }),
  listAddresses: async () => request<{ ok: boolean; addresses: Address[] }>("/account/addresses"),
  addAddress: async (payload: Omit<Address, "id">) => request<{ ok: boolean; addresses: Address[] }>("/account/addresses", { method: "POST", body: JSON.stringify(payload) }),
  getCategories: async () => request<{ ok: boolean; categories: Category[] }>("/catalog/categories"),
  getProducts: async (query = "") => request<{ ok: boolean; products: Product[] }>(`/catalog/products${query ? `?${query}` : ""}`),
  getProduct: async (id: string) => request<{ ok: boolean; product: Product }>(`/catalog/products/${id}`),
  getCart: async () => request<{ ok: boolean; items: CartItem[] }>("/cart/items"),
  addToCart: async (item: CartItem) => request<{ ok: boolean; items: CartItem[] }>("/cart/items", { method: "POST", body: JSON.stringify(item) }),
  updateCartItem: async (id: string, qty: number) => request<{ ok: boolean; items: CartItem[] }>(`/cart/items/${id}`, { method: "PATCH", body: JSON.stringify({ qty }) }),
  removeCartItem: async (id: string) => request<{ ok: boolean; items: CartItem[] }>(`/cart/items/${id}`, { method: "DELETE" }),
  clearCart: async () => request<{ ok: boolean }>("/cart/items", { method: "DELETE" }),
  getWishlist: async () => request<{ ok: boolean; wishlist: string[] }>("/wishlist"),
  toggleWishlist: async (productId: string) => request<{ ok: boolean; wishlist: string[] }>("/wishlist/toggle", { method: "POST", body: JSON.stringify({ productId }) }),
  validateCoupon: async (code: string) => request<{ ok: boolean; coupon: Coupon }>("/coupons/validate", { method: "POST", body: JSON.stringify({ code }) }),
  createOrder: async (payload: Record<string, unknown>) => request<{ ok: boolean; order: Order }>("/orders", { method: "POST", body: JSON.stringify(payload) }),
  myOrders: async () => request<{ ok: boolean; orders: Order[] }>("/orders/my"),
  adminDashboard: async () => request<{ ok: boolean; summary: Record<string, number> }>("/admin/dashboard"),
  adminProducts: async () => request<{ ok: boolean; products: Product[] }>("/admin/products"),
  saveAdminProduct: async (payload: Record<string, unknown>, id?: string) => request<{ ok: boolean; product: Product }>(id ? `/admin/products/${id}` : "/admin/products", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) }),
  deleteAdminProduct: async (id: string) => request<{ ok: boolean }>(`/admin/products/${id}`, { method: "DELETE" }),
  adminCategories: async () => request<{ ok: boolean; categories: Category[] }>("/admin/categories"),
  createCategory: async (payload: Record<string, unknown>) => request<{ ok: boolean; categories: Category[] }>("/admin/categories", { method: "POST", body: JSON.stringify(payload) }),
  updateCategory: async (id: string, payload: Record<string, unknown>) => request<{ ok: boolean; categories: Category[] }>(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteCategory: async (id: string) => request<{ ok: boolean }>(`/admin/categories/${id}`, { method: "DELETE" }),
  createSubcategory: async (payload: Record<string, unknown>) => request<{ ok: boolean; categories: Category[] }>("/admin/subcategories", { method: "POST", body: JSON.stringify(payload) }),
  deleteSubcategory: async (id: string) => request<{ ok: boolean }>(`/admin/subcategories/${id}`, { method: "DELETE" }),
  adminClients: async () => request<{ ok: boolean; clients: User[] }>("/admin/clients"),
  adminCoupons: async () => request<{ ok: boolean; coupons: Coupon[] }>("/admin/coupons"),
  saveAdminCoupon: async (payload: Record<string, unknown>, id?: string) => request<{ ok: boolean; coupons: Coupon[] }>(id ? `/admin/coupons/${id}` : "/admin/coupons", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) }),
  deleteAdminCoupon: async (id: string) => request<{ ok: boolean }>(`/admin/coupons/${id}`, { method: "DELETE" }),
  adminOrders: async () => request<{ ok: boolean; orders: Order[] }>("/admin/orders"),
  updateAdminOrder: async (id: string, payload: Record<string, unknown>) => request<{ ok: boolean; orders: Order[] }>(`/admin/orders/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  uploadImages: async (files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("images[]", file));
    return request<{ ok: boolean; files: { url: string }[] }>("/admin/upload", { method: "POST", body: form });
  },
};
