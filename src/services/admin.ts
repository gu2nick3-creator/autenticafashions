import { supabase } from '@/lib/supabase';
import { Product, Category, Order, Coupon, User, OrderStatus } from '@/types';
import { mapProduct, mapOrder, mapCoupon, mapProfile, productToRow, couponToRow } from '@/lib/mappers';
import { categoryService } from '@/services/categories';

interface DashboardData {
  totalRevenue: number;
  paidOrders: number;
  pendingOrders: number;
  totalOrders: number;
}

const PAID_STATUSES = ['pago', 'enviado', 'entregue'];
const PENDING_STATUSES = ['em_analise', 'em_preparo'];

export const adminService = {
  // Dashboard
  getDashboard: async (): Promise<DashboardData> => {
    const { data, error } = await supabase.from('orders').select('status, total');
    if (error) throw error;
    const rows = data || [];
    return {
      totalRevenue: rows
        .filter((r) => PAID_STATUSES.includes(r.status))
        .reduce((sum, r) => sum + Number(r.total || 0), 0),
      paidOrders: rows.filter((r) => PAID_STATUSES.includes(r.status)).length,
      pendingOrders: rows.filter((r) => PENDING_STATUSES.includes(r.status)).length,
      totalOrders: rows.length,
    };
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const { data: row, error } = await supabase.from('products').insert(productToRow(data)).select().single();
    if (error) throw error;
    return mapProduct(row);
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    const { data: row, error } = await supabase
      .from('products')
      .update(productToRow(data))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapProduct(row);
  },

  deleteProduct: async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => categoryService.getAll(),

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const { data: row, error } = await supabase
      .from('categories')
      .insert({ name: data.name, image: data.image || '' })
      .select()
      .single();
    if (error) throw error;

    const subcats = data.subcategories || [];
    if (subcats.length > 0) {
      const { error: subError } = await supabase
        .from('subcategories')
        .insert(subcats.map((s) => ({ category_id: row.id, name: s.name })));
      if (subError) throw subError;
    }

    const all = await categoryService.getAll();
    return all.find((c) => c.id === row.id)!;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    const { error } = await supabase
      .from('categories')
      .update({ name: data.name, image: data.image })
      .eq('id', id);
    if (error) throw error;

    if (data.subcategories) {
      const { error: delError } = await supabase.from('subcategories').delete().eq('category_id', id);
      if (delError) throw delError;
      if (data.subcategories.length > 0) {
        const { error: insError } = await supabase
          .from('subcategories')
          .insert(data.subcategories.map((s) => ({ category_id: id, name: s.name })));
        if (insError) throw insError;
      }
    }

    const all = await categoryService.getAll();
    return all.find((c) => c.id === id)!;
  },

  deleteCategory: async (id: string): Promise<void> => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  // Customers
  getCustomers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapProfile);
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapOrder);
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<void> => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
  },

  updateOrderTracking: async (id: string, trackingCode: string, carrier: string): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .update({ tracking_code: trackingCode, carrier })
      .eq('id', id);
    if (error) throw error;
  },

  // Coupons
  getCoupons: async (): Promise<Coupon[]> => {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCoupon);
  },

  createCoupon: async (data: Partial<Coupon>): Promise<Coupon> => {
    const { data: row, error } = await supabase.from('coupons').insert(couponToRow(data)).select().single();
    if (error) throw error;
    return mapCoupon(row);
  },

  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    const { data: row, error } = await supabase
      .from('coupons')
      .update(couponToRow(data))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapCoupon(row);
  },

  deleteCoupon: async (id: string): Promise<void> => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw error;
  },

  // Uploads
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return { url: data.publicUrl };
  },
};
