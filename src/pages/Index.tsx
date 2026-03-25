import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import QuickView from "@/components/QuickView";
import { products, categories, type Product } from "@/data/products";

const Index = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const launches = products.filter(p => p.isLaunch).slice(0, 8);
  const popular = products.filter(p => p.isPopular).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* HERO BANNER */}
      <section className="relative w-full">
        <div className="relative h-[320px] sm:h-[420px] lg:h-[500px] overflow-hidden bg-primary">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=600&fit=crop"
            alt="Banner AUTENTICA FASHIONF"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-primary-foreground mb-4 tracking-tight drop-shadow-lg">
              AUTENTICA FASHIONF
            </h2>
            <p className="font-heading text-lg sm:text-xl text-primary-foreground/90 mb-6 max-w-xl drop-shadow">
              Atacado de calçados e acessórios femininos com os melhores preços para revenda
            </p>
            <Link to="/produtos" className="bg-accent text-accent-foreground font-heading font-bold text-sm px-8 py-3 rounded hover:opacity-90 transition uppercase tracking-wider">
              Ver Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Secondary banners */}
      <section className="container-shop py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { img: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=300&fit=crop", label: "LANÇAMENTOS", sub: "Nova Coleção" },
            { img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=300&fit=crop", label: "MAIS VENDIDOS", sub: "Tendências" },
            { img: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&h=300&fit=crop", label: "PROMOÇÕES", sub: "Até 40% OFF" },
          ].map((b, i) => (
            <Link to="/produtos" key={i} className="relative h-[160px] rounded overflow-hidden group">
              <img src={b.img} alt={b.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-foreground/40 flex flex-col items-center justify-center">
                <span className="font-heading font-black text-lg text-primary-foreground tracking-wider">{b.label}</span>
                <span className="text-sm text-primary-foreground/80">{b.sub}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORIES / DEPARTMENTS */}
      <section className="container-shop py-10">
        <h2 className="font-heading font-black text-xl sm:text-2xl text-center mb-8 uppercase tracking-wider">
          Navegue pelos nossos departamentos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link to={`/produtos?cat=${cat.slug}`} key={cat.slug} className="group text-center">
              <div className="aspect-square rounded overflow-hidden bg-muted mb-2">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <p className="font-heading font-semibold text-xs uppercase tracking-wider text-foreground group-hover:text-accent transition">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* LAUNCHES */}
      <section className="bg-secondary py-10">
        <div className="container-shop">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-center mb-8 uppercase tracking-wider">Lançamentos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {launches.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
          </div>
          <div className="text-center mt-8">
            <Link to="/produtos" className="inline-block bg-primary text-primary-foreground font-heading font-semibold text-sm px-8 py-2.5 rounded hover:bg-accent hover:text-accent-foreground transition uppercase tracking-wider">
              Ver todos os lançamentos
            </Link>
          </div>
        </div>
      </section>

      {/* POPULAR */}
      <section className="container-shop py-10">
        <h2 className="font-heading font-black text-xl sm:text-2xl text-center mb-8 uppercase tracking-wider">Produtos Mais Populares</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {popular.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
        </div>
        <div className="text-center mt-8">
          <Link to="/produtos" className="inline-block bg-primary text-primary-foreground font-heading font-semibold text-sm px-8 py-2.5 rounded hover:bg-accent hover:text-accent-foreground transition uppercase tracking-wider">
            Ver todos os produtos
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-12">
        <div className="container-shop text-center">
          <h2 className="font-heading font-black text-2xl text-primary-foreground mb-3">Compre no atacado com os melhores preços!</h2>
          <p className="text-primary-foreground/80 mb-6">Faça login para visualizar os preços e condições especiais para revenda.</p>
          <Link to="/login" className="inline-block bg-accent text-accent-foreground font-heading font-bold text-sm px-8 py-3 rounded hover:opacity-90 transition uppercase tracking-wider">
            Cadastre-se agora
          </Link>
        </div>
      </section>

      <Footer />

      {quickViewProduct && <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </div>
  );
};

export default Index;
