import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import { mapCategory } from '@/lib/mappers';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const [{ data: categories, error: catError }, { data: subcategories, error: subError }] = await Promise.all([
      supabase.from('categories').select('*').order('created_at', { ascending: true }),
      supabase.from('subcategories').select('*'),
    ]);
    if (catError) throw catError;
    if (subError) throw subError;

    return (categories || []).map((cat) => mapCategory(cat, subcategories || []));
  },
};
