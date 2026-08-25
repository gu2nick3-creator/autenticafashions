import { Product, Category, Order, Coupon, User, Address } from '@/types';

const emptyAddress: Address = {
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zip: '',
};

interface ProductRow {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  price_normal: number | null;
  price_resale: number | null;
  stock: number | null;
  active: boolean;
  featured: boolean;
  is_new: boolean;
  is_popular: boolean;
  type: Product['type'];
  sizes: string[] | null;
  colors: Product['colors'] | null;
  images: string[] | null;
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku || '',
    name: row.name,
    description: row.description || '',
    category: row.category || '',
    subcategory: row.subcategory || undefined,
    priceNormal: Number(row.price_normal || 0),
    priceResale: Number(row.price_resale || 0),
    stock: row.stock ?? 0,
    active: row.active,
    featured: row.featured,
    isNew: row.is_new,
    isPopular: row.is_popular,
    type: row.type,
    sizes: row.sizes || [],
    colors: row.colors || [],
    images: row.images || [],
  };
}

export function productToRow(data: Partial<Product>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.sku !== undefined) row.sku = data.sku;
  if (data.name !== undefined) row.name = data.name;
  if (data.description !== undefined) row.description = data.description;
  if (data.category !== undefined) row.category = data.category;
  if (data.subcategory !== undefined) row.subcategory = data.subcategory;
  if (data.priceNormal !== undefined) row.price_normal = data.priceNormal;
  if (data.priceResale !== undefined) row.price_resale = data.priceResale;
  if (data.stock !== undefined) row.stock = data.stock;
  if (data.active !== undefined) row.active = data.active;
  if (data.featured !== undefined) row.featured = data.featured;
  if (data.isNew !== undefined) row.is_new = data.isNew;
  if (data.isPopular !== undefined) row.is_popular = data.isPopular;
  if (data.type !== undefined) row.type = data.type;
  if (data.sizes !== undefined) row.sizes = data.sizes;
  if (data.colors !== undefined) row.colors = data.colors;
  if (data.images !== undefined) row.images = data.images;
  return row;
}

interface CategoryRow {
  id: string;
  name: string;
  image: string | null;
}

interface SubcategoryRow {
  id: string;
  category_id: string;
  name: string;
}

export function mapCategory(row: CategoryRow, subcategories: SubcategoryRow[] = []): Category {
  return {
    id: row.id,
    name: row.name,
    image: row.image || '',
    subcategories: subcategories
      .filter((sc) => sc.category_id === row.id)
      .map((sc) => ({ id: sc.id, name: sc.name })),
  };
}

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  cpf_cnpj: string | null;
  address: Partial<Address> | null;
  role: User['role'];
  created_at: string;
}

export function mapProfile(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    cpfCnpj: row.cpf_cnpj || '',
    address: { ...emptyAddress, ...(row.address || {}) },
    role: row.role,
    createdAt: row.created_at,
  };
}

interface OrderRow {
  id: string;
  user_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address: Partial<Address> | null;
  items: Order['items'] | null;
  price_type: Order['priceType'];
  subtotal: number | null;
  discount: number | null;
  shipping_method: Order['shippingMethod'];
  shipping_price: number | null;
  total: number | null;
  coupon_code: string | null;
  status: Order['status'];
  tracking_code: string | null;
  carrier: string | null;
  created_at: string;
  updated_at: string;
}

export function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name || '',
    customerEmail: row.customer_email || '',
    customerPhone: row.customer_phone || '',
    address: { ...emptyAddress, ...(row.address || {}) },
    items: row.items || [],
    priceType: row.price_type,
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    shippingMethod: row.shipping_method,
    shippingPrice: Number(row.shipping_price || 0),
    total: Number(row.total || 0),
    couponCode: row.coupon_code || undefined,
    status: row.status,
    trackingCode: row.tracking_code || undefined,
    carrier: row.carrier || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface CouponRow {
  id: string;
  code: string;
  type: Coupon['type'];
  discount: number | null;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number | null;
  uses_per_client: number | null;
  active: boolean;
}

export function mapCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    discount: Number(row.discount || 0),
    validUntil: row.valid_until || '',
    maxUses: row.max_uses ?? 0,
    currentUses: row.current_uses ?? 0,
    usesPerClient: row.uses_per_client ?? 1,
    active: row.active,
  };
}

export function couponToRow(data: Partial<Coupon>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.code !== undefined) row.code = data.code;
  if (data.type !== undefined) row.type = data.type;
  if (data.discount !== undefined) row.discount = data.discount;
  if (data.validUntil !== undefined) row.valid_until = data.validUntil || null;
  if (data.maxUses !== undefined) row.max_uses = data.maxUses;
  if (data.usesPerClient !== undefined) row.uses_per_client = data.usesPerClient;
  if (data.active !== undefined) row.active = data.active;
  return row;
}
