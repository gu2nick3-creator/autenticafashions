import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';

const CartPage = () => {
  const { items, removeItem, totalPrice, discount } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <ShoppingBag className="text-primary mx-auto mb-4" size={48} />
          <h1 className="font-display text-2xl text-foreground mb-4">Faça login para acessar o carrinho</h1>
          <Link to="/login" className="gold-gradient text-primary-foreground px-8 py-3 text-sm font-medium inline-block">ENTRAR</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Carrinho</h1>
        <div className="w-12 h-0.5 gold-gradient mb-8"></div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="text-muted-foreground mx-auto mb-4" size={48} />
            <p className="text-muted-foreground mb-4">Seu carrinho está vazio</p>
            <Link to="/" className="gold-gradient text-primary-foreground px-8 py-3 text-sm font-medium inline-block">CONTINUAR COMPRANDO</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, idx) => {
                const qty = item.priceType === 'resale' ? Object.values(item.sizeDistribution).reduce((a, b) => a + b, 0) : item.quantity;
                const price = item.priceType === 'resale' ? item.product.priceResale : item.product.priceNormal;
                return (
                  <div key={idx} className="flex gap-4 p-4 bg-card border border-border rounded-sm">
                    <div className="w-20 h-24 bg-cream rounded-sm overflow-hidden flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base font-medium text-foreground truncate">{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.priceType === 'resale' ? 'Revenda' : 'Normal'} • {qty} {qty === 1 ? 'par' : 'pares'}
                      </p>
                      {item.priceType === 'resale' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Tamanhos: {Object.entries(item.sizeDistribution).map(([s, q]) => `${s}(${q})`).join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-primary mt-2">R$ {(price * qty).toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive transition-colors self-start">
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-card border border-border rounded-sm p-6 h-fit">
              <h3 className="font-display text-lg font-medium text-foreground mb-4">Resumo</h3>
              <div className="space-y-2 text-sm">
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
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>R$ {(totalPrice - discount).toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="block text-center gold-gradient text-primary-foreground py-3 font-medium text-sm tracking-wider mt-6 hover:opacity-90 transition-opacity">
                FINALIZAR COMPRA
              </Link>
              <Link to="/" className="block text-center text-sm text-muted-foreground mt-3 hover:text-primary transition-colors">
                Continuar comprando
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
