import { CartItem } from '@/types';

export interface ShippingQuote {
  id: string;
  label: string;
  price: number;
  deliveryDays: number;
}

export const shippingService = {
  calculate: async (cep: string, items: CartItem[]): Promise<ShippingQuote[]> => {
    const products = items.map((item) => {
      const quantity =
        item.priceType === 'resale'
          ? Object.values(item.sizeDistribution || {}).reduce((a, b) => a + Number(b || 0), 0)
          : item.quantity;

      const unitPrice =
        item.priceType === 'resale'
          ? Number(item.product.priceResale || 0)
          : Number(item.product.priceNormal || 0);

      return {
        quantity: Math.max(1, Number(quantity || 1)),
        insuranceValue: unitPrice,
      };
    });

    const response = await fetch('/api/frete/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cepDestino: cep, products }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Erro ao calcular frete');
    return data.options as ShippingQuote[];
  },
};
