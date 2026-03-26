import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import QuickView from "@/components/QuickView";
import { api, type Category, type Product } from "@/lib/api";

const heroImages = [
  "/images/hero-vitrine-1.png",
  "/images/hero-vitrine-2.png",
  "/images/hero-vitrine-3.png",
];

const Index = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    void (async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([api.getProducts(), api.getCategories()]);
        setProducts(productsRes.products);
        setCategories(categoriesRes.categories);
      } catch {
        setProducts([]);
        setCategories([]);
      }
    })();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroImages.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  const launches = products.filter((p) => p.isLaunch).slice(0, 8);
  const popular = products.filter((p) => p.isPopular).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="relative w-full">
        <div className="relative h-[320px] sm:h-[420px] lg:h-[500px] overflow-hidden bg-primary">
          {heroImages.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`Banner vitrine ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${heroIndex === index ? "opacity-60" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex flex-col items-start justify-center text-left px-6 sm:px-10 lg:px-16">
            <h2 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-primary-foreground mb-4 tracking-tight drop-shadow-lg max-w-4xl">AUTENTICA FASHIONF</h2>
            <p className="font-heading text-lg sm:text-xl text-primary-foreground/90 mb-6 max-w-2xl drop-shadow">Atacado de calçados e acessórios femininos com os melhores preços para revenda</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/produtos" className="bg-accent text-accent-foreground font-heading font-bold text-sm px-8 py-3 rounded hover:opacity-90 transition uppercase tracking-wider text-center">Ver Produtos</Link>
              <a href="https://wa.me/5583999618968" target="_blank" rel="noreferrer" className="bg-green-600 text-white font-heading font-bold text-sm px-8 py-3 rounded hover:opacity-90 transition uppercase tracking-wider text-center">Falar no WhatsApp</a>
            </div>
            <div className="flex gap-2 mt-5">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Ir para slide ${index + 1}`}
                  onClick={() => setHeroIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${heroIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/60"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="container-shop py-10">
        <h2 className="font-heading font-black text-xl sm:text-2xl text-center mb-8 uppercase tracking-wider">Navegue pelos nossos departamentos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link to={`/produtos?cat=${cat.slug}`} key={cat.id} className="group text-center">
              <div className="aspect-square rounded overflow-hidden bg-muted mb-2">
                <img src={cat.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <p className="font-heading font-semibold text-xs uppercase tracking-wider text-foreground group-hover:text-accent transition">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-secondary py-10">
        <div className="container-shop">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-center mb-8 uppercase tracking-wider">Lançamentos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{launches.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}</div>
        </div>
      </section>
      <section className="container-shop py-10">
        <h2 className="font-heading font-black text-xl sm:text-2xl text-center mb-8 uppercase tracking-wider">Produtos Mais Populares</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{popular.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}</div>
      </section>
      <Footer />
      {quickViewProduct && <QuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </div>
  );
};

export default Index;
