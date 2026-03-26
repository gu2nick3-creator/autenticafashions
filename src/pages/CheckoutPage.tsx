import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { couponService } from '@/services/coupons';
import { orderService } from '@/services/orders';
import { toast } from 'sonner';
import { CreditCard, Tag } from 'lucide-react';

const CheckoutPage = () => {
  const { items, totalPrice, couponCode, setCouponCode, discount, setDiscount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState({ street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '' });

  const applyCoupon = async () => {
    try {
      const result = await couponService.validate(couponInput.toUpperCase());
      if (!result.valid || !result.coupon) {
        toast.error('Cupom inválido');
        return;
      }
      const coupon = result.coupon;
      setCouponCode(coupon.code);
      const d = coupon.type === 'percentage' ? totalPrice * (coupon.discount / 100) : coupon.discount;
      setDiscount(d);
      toast.success(`Cupom ${coupon.code} aplicado!`);
    } catch {
      toast.error('Cupom inválido');
    }
  };

  const handleFinalize = async () => {
    if (!address.street || !address.city || !address.zip) { toast.error('Preencha o endereço de entrega'); return; }
    setSubmitting(true);
    try {
      const finalTotal = totalPrice - discount;
      const priceType = items.some(i => i.priceType === 'resale') ? 'resale' : 'normal';
      await orderService.create({
        items,
        address,
        couponCode: couponCode || undefined,
        priceType,
        subtotal: totalPrice,
        discount,
        total: finalTotal,
      });
      toast.success('Pedido realizado com sucesso! Redirecionando para pagamento InfinitePay...');
      clearCart();
      setTimeout(() => navigate('/painel'), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao finalizar pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const finalTotal = totalPrice - discount;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Checkout</h1>
        <div className="w-12 h-0.5 gold-gradient mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer info */}
            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="font-display text-lg font-medium text-foreground mb-4">Identificação</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Nome:</span> <span className="text-foreground font-medium">{user?.name || '—'}</span></div>
                <div><span className="text-muted-foreground">E-mail:</span> <span className="text-foreground font-medium">{user?.email || '—'}</span></div>
                <div><span className="text-muted-foreground">Telefone:</span> <span className="text-foreground font-medium">{user?.phone || '—'}</span></div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="font-display text-lg font-medium text-foreground mb-4">Endereço de Entrega</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'zip', label: 'CEP', placeholder: '00000-000' },
                  { key: 'street', label: 'Rua', placeholder: 'Nome da rua' },
                  { key: 'number', label: 'Número', placeholder: '000' },
                  { key: 'complement', label: 'Complemento', placeholder: 'Apto, bloco...' },
                  { key: 'neighborhood', label: 'Bairro', placeholder: 'Bairro' },
                  { key: 'city', label: 'Cidade', placeholder: 'Cidade' },
                  { key: 'state', label: 'Estado', placeholder: 'SP' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-foreground tracking-wide">{f.label}</label>
                    <input
                      value={(address as any)[f.key]}
                      onChange={e => setAddress(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full mt-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary"
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-card border border-border rounded-sm p-6">
              <h2 className="font-display text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                <Tag size={18} className="text-primary" /> Cupom de Desconto
              </h2>
              <div className="flex gap-2">
                <input value={couponInput} onChange={e => setCouponInput(e.target.value)} className="flex-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary" placeholder="Código do cupom" />
                <button onClick={applyCoupon} className="gold-gradient text-primary-foreground px-6 py-2 text-sm font-medium">APLICAR</button>
              </div>
              {couponCode && <p className="text-xs text-primary mt-2">Cupom {couponCode} aplicado!</p>}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-sm p-6 h-fit">
            <h2 className="font-display text-lg font-medium text-foreground mb-4">Resumo do Pedido</h2>
            <div className="space-y-3 mb-6">
              {items.map((item, idx) => {
                const qty = item.priceType === 'resale' ? Object.values(item.sizeDistribution).reduce((a, b) => a + b, 0) : item.quantity;
                const price = item.priceType === 'resale' ? item.product.priceResale : item.product.priceNormal;
                return (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">{item.product.name} x{qty}</span>
                    <span className="text-foreground font-medium whitespace-nowrap">R$ {(price * qty).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>R$ {totalPrice.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-primary"><span>Desconto</span><span>- R$ {discount.toFixed(2)}</span></div>}
              <div className="flex justify-between font-semibold text-foreground text-base pt-2 border-t border-border">
                <span>Total</span><span>R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cream border border-border rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="text-primary" size={18} />
                <span className="text-sm font-medium text-foreground">Pagamento via InfinitePay</span>
              </div>
              <p className="text-xs text-muted-foreground">Pagamento seguro processado pela InfinitePay</p>
            </div>

            <button onClick={handleFinalize} disabled={submitting} className="w-full gold-gradient text-primary-foreground py-3 font-medium text-sm tracking-wider mt-6 hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? 'PROCESSANDO...' : 'FINALIZAR E PAGAR'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
