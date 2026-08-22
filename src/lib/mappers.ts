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

export function mapProduct(row: any): Product {
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

export function mapCategory(row: any, subcategories: any[] = []): Category {
  return {
    id: row.id,
    name: row.name,
    image: row.image || '',
    subcategories: subcategories
      .filter((sc) => sc.category_id === row.id)
      .map((sc) => ({ id: sc.id, name: sc.name })),
  };
}

export function mapProfile(row: any): User {
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

export function mapOrder(row: any): Order {
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

export function mapCoupon(row: any): Coupon {
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
