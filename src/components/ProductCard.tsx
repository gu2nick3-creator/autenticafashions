import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="group bg-card border border-border rounded-sm overflow-hidden hover:gold-shadow transition-all duration-300">
      <Link to={`/produto/${product.id}`}>
        <div className="aspect-[3/4] bg-cream overflow-hidden relative">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.isNew && (
            <span className="absolute top-3 left-3 gold-gradient text-primary-foreground text-xs px-3 py-1 font-medium tracking-wide">
              NOVO
            </span>
          )}
          {product.featured && (
            <span className="absolute top-3 right-3 bg-card/90 text-primary text-xs px-3 py-1 font-medium tracking-wide border border-primary">
              DESTAQUE
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-muted-foreground tracking-wider mb-1">{product.category}</p>
        <Link to={`/produto/${product.id}`}>
          <h3 className="font-display text-base font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {isAuthenticated ? (
          <div className="mt-3 space-y-1">
            <p className="text-sm text-foreground font-semibold">
              R$ {product.priceNormal.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">/ 1 par</span>
            </p>
            <p className="text-sm text-primary font-semibold">
              R$ {product.priceResale.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">/ revenda</span>
            </p>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-muted-foreground">
            <Lock size={14} />
            <p className="text-xs">Faça login para ver preços</p>
          </div>
        )}

        <Link
          to={`/produto/${product.id}`}
          className="mt-4 block text-center py-2 border border-primary text-primary text-sm font-medium tracking-wide hover:gold-gradient hover:text-primary-foreground transition-all duration-300"
        >
          VER OPÇÕES
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
