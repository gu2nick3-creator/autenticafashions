import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { mapProduct } from '@/lib/mappers';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  getById: async (id: string): Promise<Product> => {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    return mapProduct(data);
  },
};
