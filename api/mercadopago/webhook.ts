import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Mercado Pago expects a fast 2xx response; always ack even if we can't
  // fully process, so it doesn't keep retrying the same notification forever.
  if (req.method !== 'POST') {
    res.status(200).end();
    return;
  }

  try {
    const body = req.body || {};
    const paymentId = body?.data?.id || req.query.id;
    const topic = body?.type || req.query.topic;

    if (topic !== 'payment' || !paymentId) {
      res.status(200).end();
      return;
    }

    const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN as string });
    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: String(paymentId) });

    const orderId = paymentData.external_reference;
    if (!orderId) {
      res.status(200).end();
      return;
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY as string;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    await supabase.rpc('mark_order_paid', {
      p_order_id: orderId,
      p_secret: process.env.MP_WEBHOOK_SECRET,
      p_mp_payment_id: String(paymentData.id),
      p_payment_status: paymentData.status,
      p_payment_method: paymentData.payment_method_id || null,
    });

    res.status(200).end();
  } catch (err) {
    console.error('Erro no webhook Mercado Pago:', err);
    // Still 200 — Mercado Pago will keep retrying an errored notification
    // and we don't want a transient failure to spam retries; errors are logged above.
    res.status(200).end();
  }
}
