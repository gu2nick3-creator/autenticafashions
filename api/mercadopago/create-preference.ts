import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { orderId } = req.body || {};
    if (!orderId) {
      res.status(400).json({ error: 'orderId é obrigatório' });
      return;
    }

    const authHeader = req.headers.authorization || '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '');
    if (!accessToken) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total, customer_name, customer_email, payment_status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      res.status(404).json({ error: 'Pedido não encontrado' });
      return;
    }

    if (order.payment_status === 'approved') {
      res.status(400).json({ error: 'Pedido já está pago' });
      return;
    }

    const siteUrl = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;

    const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN as string });
    const preference = new Preference(mpClient);

    const result = await preference.create({
      body: {
        items: [
          {
            id: order.id,
            title: `Pedido Autentica Fashions #${order.id.slice(0, 8)}`,
            quantity: 1,
            unit_price: Number(order.total),
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: order.customer_name || undefined,
          email: order.customer_email || undefined,
        },
        external_reference: order.id,
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
        back_urls: {
          success: `${siteUrl}/painel?pagamento=sucesso`,
          pending: `${siteUrl}/painel?pagamento=pendente`,
          failure: `${siteUrl}/painel?pagamento=falha`,
        },
        auto_return: 'approved',
      },
    });

    await supabase.rpc('set_order_preference', {
      p_order_id: order.id,
      p_secret: process.env.MP_WEBHOOK_SECRET,
      p_mp_preference_id: result.id,
    });

    res.status(200).json({ initPoint: result.init_point });
  } catch (err) {
    console.error('Erro ao criar preferência Mercado Pago:', err);
    res.status(500).json({ error: 'Erro ao iniciar pagamento' });
  }
}
