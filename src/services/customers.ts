import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { mapProfile } from '@/lib/mappers';

export const customerService = {
  getMe: async (): Promise<User> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) throw error;
    return mapProfile(data);
  },

  updateMe: async (data: Partial<User>): Promise<User> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.cpfCnpj !== undefined) payload.cpf_cnpj = data.cpfCnpj;
    if (data.address !== undefined) payload.address = data.address;

    const { data: row, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return mapProfile(row);
  },
};
