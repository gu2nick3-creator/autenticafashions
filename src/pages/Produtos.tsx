import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import QuickView from "@/components/QuickView";
import { products, categories, type Product } from "@/data/products";

const Produtos = () => {
  const [params] = useSearchParams();
  const catFilter = params.get("cat") || "";
  const searchQuery = params.get("q") || "";
  const [selectedCat, setSelectedCat] = useState(catFilter);
  const [quickView, setQuickView] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let result = products;
    if (selectedCat) result = result.filter(p => p.categorySlug === selectedCat);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return result;
  }, [selectedCat, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container-shop py-8 flex-1">
        <h1 className="font-heading font-black text-2xl uppercase tracking-wider mb-6">Produtos</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="lg:w-56 flex-shrink-0">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider mb-3">Categorias</h3>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setSelectedCat("")} className={`text-sm w-full text-left py-1.5 px-2 rounded transition ${!selectedCat ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  Todas
                </button>
              </li>
              {categories.map(c => (
                <li key={c.slug}>
                  <button onClick={() => setSelectedCat(c.slug)} className={`text-sm w-full text-left py-1.5 px-2 rounded transition ${selectedCat === c.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {searchQuery && <p className="text-sm text-muted-foreground mb-4">Resultados para: <strong>"{searchQuery}"</strong></p>}
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Nenhum produto encontrado.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickView} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {quickView && <QuickView product={quickView} onClose={() => setQuickView(null)} />}
    </div>
  );
};

export default Produtos;
