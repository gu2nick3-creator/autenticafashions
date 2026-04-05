import { api, setAuthToken } from '@/lib/api';
import { User } from '@/types';

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
  password: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const data = await api.post<LoginResponse>('/api/auth/login', { email, password });
    setAuthToken(data.token);
    return data;
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/auth/register', data);
    setAuthToken(res.token);
    return res;
  },

  me: async (): Promise<User> => {
    return api.get<User>('/api/auth/me');
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setAuthToken(null);
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/api/auth/forgot-password', { email });
  },
};
