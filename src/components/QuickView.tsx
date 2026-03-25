import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Product } from "@/data/products";
import { formatBRL, getProductPrices } from "@/lib/product-pricing";

interface Props {
  product: Product;
  onClose: () => void;
}

const QuickView = ({ product, onClose }: Props) => {
  const { isLoggedIn } = useAuth();
  const prices = getProductPrices(product);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/50" />
      <div className="relative bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10">
          <X className="w-5 h-5" />
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="aspect-square bg-muted">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{product.category}</p>
            <h3 className="font-heading font-bold text-xl mb-3">{product.name}</h3>
            {isLoggedIn ? (
              <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 mb-3 space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Preço normal</span>
                  <strong>{formatBRL(prices.normalPrice)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-accent font-semibold">Preço revenda</span>
                  <strong className="text-accent">{formatBRL(prices.resalePrice)}</strong>
                </div>
              </div>
            ) : (
              <div className="bg-shop-price-hidden rounded px-3 py-2 mb-3">
                <p className="text-sm text-muted-foreground">Faça login ou registre-se para visualizar o preço!</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{product.description}</p>
            <Link to={`/produto/${product.id}`} onClick={onClose} className="bg-primary text-primary-foreground text-sm font-heading font-semibold py-2.5 rounded text-center hover:bg-accent hover:text-accent-foreground transition uppercase tracking-wider">
              Escolher opções
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;
