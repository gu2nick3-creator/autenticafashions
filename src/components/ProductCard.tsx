import { Link } from "react-router-dom";
import { Heart, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";
import { formatBRL, getProductPrices } from "@/lib/product-pricing";

interface Props {
  product: Product;
  onQuickView?: (p: Product) => void;
}

const ProductCard = ({ product, onQuickView }: Props) => {
  const { isLoggedIn } = useAuth();
  const { toggleWishlist, isInWishlist } = useCart();
  const inWish = isInWishlist(product.id);
  const prices = getProductPrices(product);

  return (
    <div className="group bg-card border border-border rounded overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/produto/${product.id}`} className="relative block aspect-square overflow-hidden bg-muted">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && <span className="bg-shop-new text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">Novo</span>}
          {product.discount && <span className="bg-shop-sale text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm">-{product.discount}%</span>}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${inWish ? "bg-accent text-accent-foreground" : "bg-card/90 text-foreground hover:bg-accent hover:text-accent-foreground"}`}
            title="Favoritar"
          >
            <Heart className="w-4 h-4" fill={inWish ? "currentColor" : "none"} />
          </button>
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="w-8 h-8 rounded-full bg-card/90 text-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition"
              title="Visualização rápida"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </Link>

      <div className="p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
        <Link to={`/produto/${product.id}`} className="block"><h3 className="font-heading font-semibold text-sm text-card-foreground leading-tight mb-2 line-clamp-2 hover:text-accent transition-colors">{product.name}</h3></Link>

        {isLoggedIn ? (
          <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 mb-2 space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground uppercase tracking-wide">Preço normal</span>
              <span className="font-heading font-bold text-foreground">{formatBRL(prices.normalPrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-accent uppercase tracking-wide font-semibold">Preço revenda</span>
              <span className="font-heading font-black text-accent">{formatBRL(prices.resalePrice)}</span>
            </div>
          </div>
        ) : (
          <div className="bg-shop-price-hidden rounded px-2 py-1.5 mb-2">
            <p className="text-[11px] text-muted-foreground leading-tight">Faça login ou registre-se para visualizar o preço!</p>
          </div>
        )}

        <div className="flex gap-1 mt-2 mb-2">
          {product.colors.slice(0, 4).map(c => (
            <span key={c.hex} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c.hex }} title={c.name} />
          ))}
        </div>

        <Link
          to={`/produto/${product.id}`}
          className="block w-full text-center bg-primary text-primary-foreground text-xs font-heading font-semibold py-2 rounded hover:bg-accent hover:text-accent-foreground transition uppercase tracking-wider"
        >
          Ver opções
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
