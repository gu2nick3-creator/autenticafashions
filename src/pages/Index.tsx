import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import QuickView from "@/components/QuickView";
import { useCatalog } from "@/hooks/useCatalog";
import type { Product } from "@/types/api";

const Index = () => {
  const { products, categories } = useCatalog();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const launches = useMemo(() => products.filter((p) => p.isLaunch || p.isNew).slice(0, 8), [products]);
  const popular = useMemo(() => products.filter((p) => p.isPopular).slice(0, 8), [products]);
  const featured = launches.length ? launches : products.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <section className="w-full bg-primary"><div className="container-shop py-8 md:py-10"><div className="relative rounded-2xl overflow-hidden min-h-[320px] md:min-h-[420px] bg-black"><img src={featured[0]?.images?.[0] || "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1400&h=700&fit=crop"} alt="AUTENTICA FASHIONF" className="w-full h-full object-cover opacity-60 absolute inset-0" /><div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"><h2 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-primary-foreground mb-4 tracking-tight drop-shadow-lg">AUTENTICA FASHIONF</h2><p className="font-heading text-lg sm:text-xl text-primary-foreground/90 mb-6 max-w-xl drop-shadow">Atacado de calçados e acessórios femininos com os melhores preços para revenda</p><Link to="/produtos" className="bg-accent text-accent-foreground font-heading font-bold text-sm px-8 py-3 rounded hover:opacity-90 transition uppercase tracking-wider">Ver Produtos</Link></div></div></div></section>
      <section className="container-shop py-10"><h2 className="font-heading font-black text-xl sm:text-2xl text-center mb-8 uppercase tracking-wider">Navegue pelos nossos departamentos</h2><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{categories.map(cat => <Link to={`/produtos?cat=${cat.slug}`} key={cat.id} className="group text-center"><div className="aspect-square rounded overflow-hidden bg-muted mb-2">{cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">{cat.name}</div>}</div><p className="font-heading font-semibold text-xs uppercase tracking-wider text-foreground group-hover:text-accent transition">{cat.name}</p></Link>)}</div></section>
      <section className="bg-secondary py-10"><div className="container-shop"><h2 className="font-heading font-black text-xl sm:text-2xl text-center mb-8 uppercase tracking-wider">Lançamentos</h2><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{featured.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}</div></div></section>
      <section className="container-shop py-10"><h2 className="font-heading font-black text-xl sm:text-2xl text-center mb-8 uppercase tracking-wider">Produtos Mais Populares</h2><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{(popular.length ? popular : products.slice(0, 8)).map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}</div></section>
      <section className="bg-primary py-12"><div className="container-shop text-center"><h2 className="font-heading font-black text-2xl text-primary-foreground mb-3">Compre no atacado com os melhores preços!</h2><p className="text-primary-foreground/80 mb-6">Faça login para visualizar os preços e condições especiais para revenda.</p><Link to="/login" className="inline-block bg-accent text-accent-foreground font-heading font-bold text-sm px-8 py-3 rounded hover:opacity-90 transition uppercase tracking-wider">Cadastre-se agora</Link></div></section>
      <Footer />
      {quickViewProduct && <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </div>
  );
};

export default Index;
