import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ProductInput {
  quantity: number;
  insuranceValue: number;
}

interface MelhorEnvioOption {
  id: number;
  name: string;
  price: string;
  delivery_time: number;
  company: { id: number; name: string };
  error?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { cepDestino, products } = (req.body || {}) as {
      cepDestino?: string;
      products?: ProductInput[];
    };

    const cep = String(cepDestino || '').replace(/\D/g, '');
    if (cep.length !== 8) {
      res.status(400).json({ error: 'CEP inválido' });
      return;
    }

    if (!Array.isArray(products) || products.length === 0) {
      res.status(400).json({ error: 'Carrinho vazio' });
      return;
    }

    const token = process.env.MELHOR_ENVIO_TOKEN;
    const fromCep = process.env.MELHOR_ENVIO_FROM_CEP;
    if (!token || !fromCep) {
      res.status(500).json({ error: 'Cálculo de frete não configurado' });
      return;
    }

    const sandbox = process.env.MELHOR_ENVIO_SANDBOX === 'true';
    const baseUrl = sandbox
      ? 'https://sandbox.melhorenvio.com.br'
      : 'https://www.melhorenvio.com.br';

    const meResponse = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Autentica Fashions (contato@autenticafashions.com)',
      },
      body: JSON.stringify({
        from: { postal_code: fromCep.replace(/\D/g, '') },
        to: { postal_code: cep },
        products: products.map((p, idx) => ({
          id: String(idx + 1),
          width: 20,
          height: Math.max(2, Math.min(50, 2 * p.quantity)),
          length: 30,
          weight: Math.max(0.3, 0.3 * p.quantity),
          insurance_value: p.insuranceValue,
          quantity: p.quantity,
        })),
      }),
    });

    if (!meResponse.ok) {
      const errBody = await meResponse.text();
      console.error('Erro Melhor Envio:', meResponse.status, errBody);
      res.status(502).json({ error: 'Erro ao calcular frete' });
      return;
    }

    const options = (await meResponse.json()) as MelhorEnvioOption[];

    const valid = options
      .filter((o) => !o.error && o.price)
      .map((o) => ({
        id: `me-${o.id}`,
        label: `${o.company.name} - ${o.name}`,
        price: Number(o.price),
        deliveryDays: o.delivery_time,
      }));

    res.status(200).json({ options: valid });
  } catch (err) {
    console.error('Erro ao calcular frete:', err);
    res.status(500).json({ error: 'Erro ao calcular frete' });
  }
}
