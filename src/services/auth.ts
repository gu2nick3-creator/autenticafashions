import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { mapProfile } from '@/lib/mappers';

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
  password: string;
}

async function fetchProfile(userId: string): Promise<User> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return mapProfile(data);
}

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Login falhou');
    return fetchProfile(data.user.id);
  },

  register: async (data: RegisterData): Promise<User> => {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone || '',
          cpfCnpj: data.cpfCnpj || '',
        },
      },
    });
    if (error) throw error;
    if (!signUpData.user) throw new Error('Cadastro falhou');
    return fetchProfile(signUpData.user.id);
  },

  me: async (): Promise<User> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw error || new Error('Não autenticado');
    return fetchProfile(user.id);
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  forgotPassword: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) throw error;
  },
};
