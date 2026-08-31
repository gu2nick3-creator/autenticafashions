import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ProductCard';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { Product, Category } from '@/types';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import bannerRevenda from '@/assets/banner-revenda.png';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showcaseApi, setShowcaseApi] = useState<CarouselApi>();

  useEffect(() => {
    productService.getAll().then(setProducts).catch(() => {});
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  const newProducts = products.filter(p => p.isNew);
  const popularProducts = products.filter(p => p.isPopular);
  const featuredProducts = products.filter(p => p.featured);

  useEffect(() => {
    if (!showcaseApi) return;
    const timer = setInterval(() => {
      showcaseApi.scrollNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [showcaseApi]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Vitrine de Produtos - hero full-screen */}
      <section className="relative w-full overflow-hidden">
        {products.length > 0 ? (
          <Carousel setApi={setShowcaseApi} opts={{ align: 'start', loop: true }} className="w-full">
            <CarouselContent className="ml-0">
              {products.map(p => (
                <CarouselItem key={p.id} className="basis-full pl-0">
                  <Link to={`/produto/${p.id}`} className="relative block w-full h-[70vh] md:h-[88vh] min-h-[440px]">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,0%)]/70 via-[hsl(0,0%,0%)]/10 to-[hsl(0,0%,0%)]/20"></div>
                    <div className="absolute inset-0 flex flex-col items-start justify-end p-6 pb-14 md:p-16 md:pb-20">
                      <p className="text-white/80 text-xs md:text-sm tracking-widest uppercase mb-2" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>
                        {p.category}
                      </p>
                      <h2
                        className="font-display text-3xl md:text-6xl font-semibold leading-tight mb-5 max-w-xl text-white"
                        style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
                      >
                        {p.name}
                      </h2>
                      <span className="gold-gradient text-primary-foreground px-10 py-3.5 font-medium text-sm tracking-widest inline-block">
                        VER PRODUTO
                      </span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="w-full h-[70vh] md:h-[88vh] min-h-[440px] flex items-center justify-center bg-cream">
            <p className="text-muted-foreground text-sm">Nenhum produto disponível no momento.</p>
          </div>
        )}

        {products.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Produto anterior"
              onClick={() => showcaseApi?.scrollPrev()}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              aria-label="Próximo produto"
              onClick={() => showcaseApi?.scrollNext()}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </section>

      {/* Info bar */}
      <section className="gold-gradient py-4">
        <div className="container flex flex-wrap items-center justify-center gap-6 md:gap-12 text-primary-foreground text-xs md:text-sm tracking-wide">
          <span>✦ LANÇAMENTOS SEMANAIS</span>
          <span>✦ ENVIO PARA TODO BRASIL</span>
          <span>✦ ATACADO E VAREJO</span>
          <span>✦ ATÉ 6X SEM JUROS</span>
          <span>✦ PAGAMENTO SEGURO</span>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            Navegue por <span className="gold-text">Departamentos</span>
          </h2>
          <div className="w-16 h-0.5 gold-gradient mx-auto mt-4"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map(cat => (
            <Link key={cat.id} to={`/categoria/${cat.id}`} className="group relative rounded-sm overflow-hidden aspect-[4/5] border border-border hover:border-primary hover:gold-shadow transition-all duration-300">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" loading="lazy" width={800} height={1000} />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                <h3 className="font-display text-lg md:text-xl font-semibold text-foreground">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="container py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                <Sparkles className="inline text-primary mr-2" size={24} />
                Lançamentos
              </h2>
              <div className="w-12 h-0.5 gold-gradient mt-3"></div>
            </div>
            <Link to="/produtos" className="flex items-center gap-1 text-sm text-primary hover:text-gold-dark transition-colors font-medium">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Featured */}
      {featuredProducts.length > 0 && (
        <section className="bg-cream py-12">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                  <Sparkles className="inline text-primary mr-2" size={24} />
                  Destaques
                </h2>
                <div className="w-12 h-0.5 gold-gradient mt-3"></div>
              </div>
              <Link to="/produtos" className="flex items-center gap-1 text-sm text-primary hover:text-gold-dark transition-colors font-medium">
                Ver todos <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Popular */}
      {popularProducts.length > 0 && (
        <section className="container py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                <TrendingUp className="inline text-primary mr-2" size={24} />
                Mais Populares
              </h2>
              <div className="w-12 h-0.5 gold-gradient mt-3"></div>
            </div>
            <Link to="/produtos" className="flex items-center gap-1 text-sm text-primary hover:text-gold-dark transition-colors font-medium">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {popularProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* All products catalog when no categorized products */}
      {products.length === 0 && (
        <section className="container py-16">
          <div className="text-center bg-cream border border-border rounded-sm p-12">
            <Sparkles className="text-primary mx-auto mb-4" size={40} />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">Em breve, novos produtos!</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Estamos preparando uma coleção exclusiva para você. Cadastre-se para ser a primeira a saber dos lançamentos.
            </p>
            <Link to="/cadastro" className="inline-block mt-6 gold-gradient text-primary-foreground px-8 py-3 font-medium text-sm tracking-wider hover:opacity-90 transition-opacity">
              CADASTRAR AGORA
            </Link>
          </div>
        </section>
      )}

      {/* Full catalog when products exist but none categorized */}
      {products.length > 0 && newProducts.length === 0 && featuredProducts.length === 0 && popularProducts.length === 0 && (
        <section className="container py-12">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
              Nossos <span className="gold-text">Produtos</span>
            </h2>
            <div className="w-12 h-0.5 gold-gradient mx-auto mt-3"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Banner Revenda */}
      <section className="container py-12">
        <Link to="/revenda" className="block overflow-hidden rounded-sm border border-border hover:border-primary hover:gold-shadow transition-all duration-300 max-w-2xl mx-auto">
          <img src={bannerRevenda} alt="Seja Revendedora Autentica Fashionf" className="w-full h-auto object-cover" loading="lazy" />
        </Link>
      </section>

      {/* CTA */}
      <section className="gold-gradient py-16">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary-foreground mb-4">
            Seja uma Revendedora Autentica
          </h2>
          <p className="text-primary-foreground/80 text-base mb-8 max-w-lg mx-auto">
            Cadastre-se e tenha acesso a preços exclusivos de atacado. Revenda moda feminina de qualidade.
          </p>
          <Link to="/cadastro" className="inline-block bg-card text-primary px-10 py-3 font-medium text-sm tracking-wider hover:bg-background transition-colors">
            CRIAR CONTA GRÁTIS
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
