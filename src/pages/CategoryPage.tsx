import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { Product, Category } from '@/types';
import { Sparkles } from 'lucide-react';

const CategoryPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);

  useEffect(() => {
    categoryService.getAll().then(cats => {
      const found = cats.find(c => c.id === id) || null;
      setCategory(found);
    }).catch(() => {});

    productService.getAll().then(prods => {
      // Filter will happen after category loads; for now store all
      setDisplayProducts(prods);
    }).catch(() => {});
  }, [id]);

  // Filter products by category name
  const filteredProducts = category
    ? displayProducts.filter(p => p.category === category.name)
    : displayProducts;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Category hero */}
      {category && (
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container">
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground">{category.name}</h1>
              <div className="w-12 h-0.5 gold-gradient mt-3"></div>
            </div>
          </div>
        </div>
      )}

      <div className="container py-8">
        {!category && (
          <div className="mb-8">
            <h1 className="font-display text-3xl font-semibold text-foreground">Todos os Produtos</h1>
            <div className="w-12 h-0.5 gold-gradient mt-3"></div>
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-cream border border-border rounded-sm">
            <Sparkles className="text-primary mx-auto mb-4" size={40} />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">Produtos em breve!</h2>
            <p className="text-sm text-muted-foreground">Estamos preparando novidades para esta categoria.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
