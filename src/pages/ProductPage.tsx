import { useParams, Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { Lock, ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { Product, Category } from '@/types';

const ProductPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceType, setPriceType] = useState<'normal' | 'resale'>('normal');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeDistribution, setSizeDistribution] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [productData, categoriesData] = await Promise.all([
          productService.getById(id),
          categoryService.getAll(),
        ]);

        setProduct(productData);
        setCategories(categoriesData);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="font-display text-2xl text-foreground">Produto não encontrado</h1>
        </div>
        <Footer />
      </div>
    );
  }

  const matchedCategory = categories.find(
    (cat) => cat.name?.trim().toLowerCase() === product.category?.trim().toLowerCase()
  );

  const totalPairs = Object.values(sizeDistribution).reduce((a, b) => a + b, 0);

  const updateSize = (size: string, delta: number) => {
    setSizeDistribution((prev) => {
      const current = prev[size] || 0;
      const nextValue = current + delta;

      if (nextValue < 0) return prev;

      if (nextValue > 2) {
        toast.error(`No máximo 2 pares no tamanho ${size}`);
        return prev;
      }

      const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);

      if (delta > 0 && currentTotal >= 10) {
        toast.error('Você só pode selecionar 10 pares para revenda');
        return prev;
      }

      const newDist = { ...prev, [size]: nextValue };

      if (nextValue === 0) {
        delete newDist[size];
      }

      return newDist;
    });
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) return;

    if (priceType === 'normal') {
      if (!selectedSize) {
        toast.error('Selecione um tamanho');
        return;
      }

      addItem({
        product,
        priceType: 'normal',
        quantity: 1,
        selectedColor,
        sizeDistribution: { [selectedSize]: 1 },
      });
    } else {
      if (totalPairs !== 10) {
        toast.error('Selecione exatamente 10 pares para revenda');
        return;
      }

      addItem({
        product,
        priceType: 'resale',
        quantity: 10,
        selectedColor,
        sizeDistribution,
      });
    }

    toast.success('Produto adicionado ao carrinho!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <p className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>{' '}
          /{' '}
          {matchedCategory ? (
            <Link to={`/categoria/${matchedCategory.id}`} className="hover:text-primary">
              {product.category}
            </Link>
          ) : (
            <span>{product.category}</span>
          )}{' '}
          / {product.name}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-cream rounded-sm overflow-hidden border border-border flex items-center justify-center">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <span className="text-xs tracking-wider text-primary font-medium">{product.category}</span>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mt-2 mb-4">
              {product.name}
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>
            <p className="text-xs text-muted-foreground mb-6">SKU: {product.sku}</p>

            {!isAuthenticated ? (
              <div className="bg-cream border border-border rounded-sm p-6 text-center">
                <Lock className="text-primary mx-auto mb-3" size={32} />
                <p className="font-display text-lg text-foreground mb-2">Preços exclusivos</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça login ou registre-se para visualizar os preços
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/login" className="gold-gradient text-primary-foreground px-6 py-2 text-sm font-medium">
                    ENTRAR
                  </Link>
                  <Link to="/cadastro" className="border border-primary text-primary px-6 py-2 text-sm font-medium">
                    CADASTRAR
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Tipo de compra:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setPriceType('normal');
                        setSizeDistribution({});
                      }}
                      className={`p-4 border rounded-sm text-center transition-all ${
                        priceType === 'normal'
                          ? 'border-primary gold-shadow bg-cream'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">Preço Normal</p>
                      <p className="text-lg font-semibold text-primary mt-1">
                        R$ {product.priceNormal.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">1 par</p>
                    </button>

                    <button
                      onClick={() => {
                        setPriceType('resale');
                        setSelectedSize('');
                      }}
                      className={`p-4 border rounded-sm text-center transition-all ${
                        priceType === 'resale'
                          ? 'border-primary gold-shadow bg-cream'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">Preço Revenda</p>
                      <p className="text-lg font-semibold text-primary mt-1">
                        R$ {product.priceResale.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">por par (mín. 10)</p>
                    </button>
                  </div>
                </div>

                {product.colors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Cor:</p>
                    <div className="flex gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === c.name ? 'border-primary scale-110' : 'border-border'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {priceType === 'normal' && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Tamanho:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-[48px] py-2 px-3 border rounded-sm text-sm transition-all ${
                            selectedSize === s
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border text-foreground hover:border-primary'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {priceType === 'resale' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">
                        Distribuição de tamanhos (máx. 2 pares por número):
                      </p>
                      <p className={`text-sm font-semibold ${totalPairs === 10 ? 'text-primary' : 'text-destructive'}`}>
                        {totalPairs}/10 pares
                      </p>
                    </div>

                    <div className="space-y-2 bg-cream p-4 rounded-sm border border-border">
                      {product.sizes.map((s) => (
                        <div key={s} className="flex items-center justify-between">
                          <span className="text-sm text-foreground w-16">{s}</span>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateSize(s, -1)}
                              className="w-8 h-8 border border-border rounded-sm flex items-center justify-center hover:border-primary transition-colors"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center text-sm font-medium">{sizeDistribution[s] || 0}</span>

                            <button
                              onClick={() => updateSize(s, 1)}
                              disabled={totalPairs >= 10 || (sizeDistribution[s] || 0) >= 2}
                              className="w-8 h-8 border border-border rounded-sm flex items-center justify-center hover:border-primary transition-colors disabled:opacity-30"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPairs === 10 && (
                      <p className="text-xs text-primary flex items-center gap-1 mt-2">
                        <Check size={14} /> Distribuição completa!
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={priceType === 'resale' && totalPairs !== 10}
                  className="w-full gold-gradient text-primary-foreground py-3 font-medium text-sm tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <ShoppingBag size={18} />
                  ADICIONAR AO CARRINHO
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
