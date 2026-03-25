import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";

const Favoritos = () => {
  const { wishlist } = useCart();
  const favProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container-shop py-8 flex-1">
        <h1 className="font-heading font-black text-2xl uppercase tracking-wider mb-6">Favoritos</h1>
        {favProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Você ainda não adicionou produtos aos favoritos.</p>
            <Link to="/produtos" className="bg-primary text-primary-foreground font-heading font-semibold text-sm px-6 py-2.5 rounded uppercase">Ver Produtos</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Favoritos;
