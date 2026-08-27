import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { couponService } from '@/services/coupons';
import { orderService } from '@/services/orders';
import { paymentService } from '@/services/payments';
import { shippingService, ShippingQuote } from '@/services/shipping';
import { ShippingMethod } from '@/types';
import { toast } from 'sonner';
import { CreditCard, Tag, Truck } from 'lucide-react';

const PICKUP_OPTION = {
  id: 'retirada',
  label: 'Retirada no local',
  description: 'Retire sem custo',
  price: 0,
};

const CheckoutPage = () => {
  const { items, totalPrice, couponCode, setCouponCode, discount, setDiscount, clearCart } = useCart();
  const { user } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('retirada');
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip: '',
  });

  const shippingOptions = [
    ...shippingQuotes.map((q) => ({
      id: q.id,
      label: q.label,
      description: `Prazo estimado: ${q.deliveryDays} dia(s) útil(eis)`,
      price: q.price,
    })),
    PICKUP_OPTION,
  ];

  useEffect(() => {
    const cep = address.zip.replace(/\D/g, '');
    if (cep.length !== 8) {
      setShippingQuotes([]);
      setShippingError('');
      setShippingMethod((prev) => (prev.startsWith('me-') ? 'retirada' : prev));
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoadingShipping(true);
      setShippingError('');
      try {
        const quotes = await shippingService.calculate(cep, items);
        if (cancelled) return;
        setShippingQuotes(quotes);
        if (quotes.length > 0) {
          setShippingMethod(quotes[0].id);
        } else {
          setShippingError('Nenhuma opção de entrega disponível para este CEP');
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Erro ao calcular frete';
        setShippingError(message);
        setShippingQuotes([]);
      } finally {
        if (!cancelled) setLoadingShipping(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.zip]);

  const selectedShipping =
    shippingOptions.find((option) => option.id === shippingMethod) || PICKUP_OPTION;

  const shippingPrice = selectedShipping.price;

  const applyCoupon = async () => {
    try {
      const result = await couponService.validate(couponInput.toUpperCase());

      if (!result.valid || !result.coupon) {
        toast.error('Cupom inválido');
        return;
      }

      const coupon = result.coupon;
      setCouponCode(coupon.code);

      const d =
        coupon.type === 'percentage'
          ? totalPrice * (coupon.discount / 100)
          : coupon.discount;

      setDiscount(d);
      toast.success(`Cupom ${coupon.code} aplicado!`);
    } catch {
      toast.error('Cupom inválido');
    }
  };

  const handleFinalize = async () => {
    if (shippingMethod !== 'retirada' && (!address.street || !address.city || !address.zip)) {
      toast.error('Preencha o endereço de entrega');
      return;
    }

    if (!user?.name || !user?.email || !user?.phone) {
      toast.error('Complete seus dados de cadastro antes de finalizar');
      return;
    }

    setSubmitting(true);

    try {
      const finalTotal = totalPrice - discount + shippingPrice;

      if (finalTotal <= 0) {
        toast.error('O total do pedido está inválido');
        return;
      }

      const order = await orderService.create({
        items,
        address,
        couponCode: couponCode || undefined,
        priceType: items.some((i) => i.priceType === 'resale') ? 'resale' : 'normal',
        subtotal: totalPrice,
        discount,
        shippingMethod,
        shippingPrice,
        total: finalTotal,
        customer: {
          name: user.name,
          email: user.email,
          phone_number: user.phone,
        },
      });

      clearCart();

      const { initPoint } = await paymentService.createPreference(order.id);
      window.location.href = initPoint;
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      const message = err instanceof Error ? err.message : 'Erro ao finalizar pedido';
      toast.error(message);
      setSubmitting(false);
    }
  };

  const finalTotal = totalPrice - discount + shippingPrice;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Checkout</h1>
        <div className="w-12 h-0.5 gold-gradient mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="font-display text-lg font-medium text-foreground mb-4">Identificação</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span>{' '}
                  <span className="text-foreground font-medium">{user?.name || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">E-mail:</span>{' '}
                  <span className="text-foreground font-medium">{user?.email || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefone:</span>{' '}
                  <span className="text-foreground font-medium">{user?.phone || '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="font-display text-lg font-medium text-foreground mb-4">
                Endereço de Entrega
              </h2>
              <p className="text-xs text-muted-foreground mb-3">
                Informe o CEP para calcularmos o frete automaticamente.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(
                  [
                    { key: 'zip', label: 'CEP', placeholder: '00000-000' },
                    { key: 'street', label: 'Rua', placeholder: 'Nome da rua' },
                    { key: 'number', label: 'Número', placeholder: '000' },
                    { key: 'complement', label: 'Complemento', placeholder: 'Apto, bloco...' },
                    { key: 'neighborhood', label: 'Bairro', placeholder: 'Bairro' },
                    { key: 'city', label: 'Cidade', placeholder: 'Cidade' },
                    { key: 'state', label: 'Estado', placeholder: 'SP' },
                  ] as { key: keyof typeof address; label: string; placeholder: string }[]
                ).map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-foreground tracking-wide">
                      {f.label}
                    </label>
                    <input
                      value={address[f.key] || ''}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          [f.key]: e.target.value,
                        }))
                      }
                      className="w-full mt-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="font-display text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Truck size={18} className="text-primary" /> Modalidade de Envio
              </h2>

              {address.zip.replace(/\D/g, '').length !== 8 && (
                <p className="text-xs text-muted-foreground mb-3">
                  Informe o CEP acima para ver as opções de entrega, ou escolha retirada no local.
                </p>
              )}

              {loadingShipping && (
                <p className="text-xs text-muted-foreground mb-3">Calculando frete...</p>
              )}

              {shippingError && (
                <p className="text-xs text-destructive mb-3">{shippingError}</p>
              )}

              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-start justify-between gap-4 border rounded-sm p-4 cursor-pointer transition-colors ${
                      shippingMethod === option.id
                        ? 'border-primary bg-cream'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === option.id}
                        onChange={() => setShippingMethod(option.id)}
                        className="mt-1 accent-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {option.price === 0 ? 'Grátis' : `R$ ${option.price.toFixed(2)}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="font-display text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Tag size={18} className="text-primary" /> Cupom de Desconto
              </h2>

              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary"
                  placeholder="Código do cupom"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="gold-gradient text-primary-foreground px-6 py-2 text-sm font-medium"
                >
                  APLICAR
                </button>
              </div>

              {couponCode && (
                <p className="text-xs text-primary mt-2">Cupom {couponCode} aplicado!</p>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm p-6 h-fit">
            <h2 className="font-display text-lg font-medium text-foreground mb-4">
              Resumo do Pedido
            </h2>

            <div className="space-y-3 mb-6">
              {items.map((item, idx) => {
                const qty =
                  item.priceType === 'resale'
                    ? Object.values(item.sizeDistribution || {}).reduce(
                        (a, b) => a + Number(b || 0),
                        0
                      )
                    : item.quantity;

                const price =
                  item.priceType === 'resale'
                    ? Number(item.product.priceResale || 0)
                    : Number(item.product.priceNormal || 0);

                return (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">
                      {item.product.name} x{qty}
                    </span>
                    <span className="text-foreground font-medium whitespace-nowrap">
                      R$ {(price * Number(qty || 0)).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Desconto</span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Envio</span>
                <span>{shippingPrice === 0 ? 'Grátis' : `R$ ${shippingPrice.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Modalidade</span>
                <span>{selectedShipping.label}</span>
              </div>

              <div className="flex justify-between font-semibold text-foreground text-base pt-2 border-t border-border">
                <span>Total</span>
                <span>R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cream border border-border rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="text-primary" size={18} />
                <span className="text-sm font-medium text-foreground">
                  Pagamento via Mercado Pago
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ao finalizar, você será redirecionado para o Mercado Pago para concluir o pagamento com
                Pix, cartão ou boleto.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinalize}
              disabled={submitting}
              className="w-full gold-gradient text-primary-foreground py-3 font-medium text-sm tracking-wider mt-6 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'PROCESSANDO...' : 'IR PARA PAGAMENTO'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
