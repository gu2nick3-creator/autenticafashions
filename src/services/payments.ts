import { supabase } from '@/lib/supabase';

export const paymentService = {
  createPreference: async (orderId: string): Promise<{ initPoint: string }> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) throw new Error('Não autenticado');

    const response = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erro ao iniciar pagamento');
    return data;
  },
};
