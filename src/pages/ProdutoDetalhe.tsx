import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ChevronLeft, Check, PackageCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { formatBRL, getProductPrices } from "@/lib/product-pricing";
import { getResolvedProductData } from "@/lib/product-details";

const RESALE_SLOTS = 10;

const ProdutoDetalhe = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const { isLoggedIn } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [mainImage, setMainImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [priceType, setPriceType] = useState<"normal" | "revenda">("normal");
  const [resaleSizes, setResaleSizes] = useState<string[]>(Array(RESALE_SLOTS).fill(""));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Produto não encontrado.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const prices = getProductPrices(product);
  const resolved = getResolvedProductData(product);
  const sizes = resolved.sizes;
  const colors = resolved.colors;
  const related = products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);
  const inWish = isInWishlist(product.id);

  const resaleReady = useMemo(() => resaleSizes.every((item) => item), [resaleSizes]);
  const resaleSummary = useMemo(() => {
    const counts = resaleSizes.filter(Boolean).reduce<Record<string, number>>((acc, size) => {
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([size, amount]) => `${amount}x ${size}`)
      .join(" • ");
  }, [resaleSizes]);

  const handleResaleSizeChange = (index: number, value: string) => {
    setResaleSizes((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const handleAdd = () => {
    if (!isLoggedIn) {
      toast.error("Faça login para comprar!");
      return;
    }

    if (!selectedColor) {
      toast.error("Selecione a cor do produto!");
      return;
    }

    if (priceType === "normal" && !selectedSize) {
      toast.error("Selecione o tamanho!");
      return;
    }

    if (priceType === "revenda" && !resaleReady) {
      toast.error("Escolha os 10 tamanhos do kit revenda.");
      return;
    }

    const unitPrice = priceType === "normal" ? prices.normalPrice : prices.resalePrice;
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      size: priceType === "normal" ? selectedSize : "Kit revenda (10 pares)",
      color: selectedColor,
      qty: priceType === "normal" ? qty : 1,
      unitPrice,
      priceType,
      selectedSizes: priceType === "revenda" ? resaleSizes : undefined,
      isResaleKit: priceType === "revenda",
    });
    toast.success(priceType === "revenda" ? "Kit revenda adicionado ao carrinho!" : "Produto adicionado ao carrinho!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <div className="container-shop py-6 md:py-8 flex-1">
        <Link to="/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-4">
          <ChevronLeft className="w-4 h-4" /> Voltar para produtos
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8 xl:gap-10">
          <div className="space-y-3">
            <div className="aspect-square bg-card border border-border rounded-[28px] overflow-hidden shadow-sm">
              <img src={product.images[mainImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition ${mainImage === i ? "border-accent shadow-md" : "border-border"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-card p-5 md:p-7 xl:p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground mb-2">{product.category}</p>
                <h1 className="font-heading font-black text-2xl md:text-3xl leading-tight">{product.name}</h1>
              </div>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-12 h-12 border rounded-2xl flex items-center justify-center transition ${inWish ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}
              >
                <Heart className="w-5 h-5" fill={inWish ? "currentColor" : "none"} />
              </button>
            </div>

            {product.discount && (
              <span className="mt-4 inline-flex bg-shop-sale text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">-{product.discount}% OFF</span>
            )}

            {isLoggedIn ? (
              <div className="mt-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPriceType("normal")}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${priceType === "normal" ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-background hover:border-accent"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.18em]">Normal</p>
                      {priceType === "normal" ? <Check className="w-4 h-4" /> : null}
                    </div>
                    <p className="mt-2 font-heading font-black text-2xl leading-none">{formatBRL(prices.normalPrice)}</p>
                    <p className={`mt-2 text-xs ${priceType === "normal" ? "text-primary-foreground/85" : "text-muted-foreground"}`}>1 par por item.</p>
                  </button>
                  <button
                    onClick={() => setPriceType("revenda")}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${priceType === "revenda" ? "border-accent bg-accent text-accent-foreground shadow-sm" : "border-border bg-background hover:border-accent"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.18em]">Revenda</p>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-heading font-bold uppercase ${priceType === "revenda" ? "bg-accent-foreground/15 text-accent-foreground" : "bg-accent/10 text-accent"}`}>10 pares</span>
                    </div>
                    <p className="mt-2 font-heading font-black text-2xl leading-none">{formatBRL(prices.resalePrice)}</p>
                    <p className={`mt-2 text-xs ${priceType === "revenda" ? "text-accent-foreground/85" : "text-muted-foreground"}`}>Monte o kit antes de comprar.</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-border bg-shop-price-hidden px-5 py-4">
                <p className="text-sm text-muted-foreground">Faça login ou registre-se para visualizar preços, cores e tamanhos.</p>
                <Link to="/login" className="mt-2 inline-flex text-accent font-semibold text-sm hover:underline">Fazer login →</Link>
              </div>
            )}

            {isLoggedIn ? (
            <>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-heading font-semibold text-sm mb-3 uppercase tracking-[0.2em]">Cor disponível</h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((c) => (
                      <button
                        key={`${c.name}-${c.hex}`}
                        onClick={() => setSelectedColor(c.name)}
                        className={`relative h-11 min-w-11 rounded-full border-2 px-3 transition ${selectedColor === c.name ? "border-accent scale-105 shadow-md" : "border-border"}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {selectedColor === c.name ? <Check className="w-4 h-4 text-white drop-shadow mx-auto" /> : null}
                      </button>
                    ))}
                  </div>
                  {selectedColor ? <p className="text-xs text-muted-foreground mt-2">Cor escolhida: {selectedColor}</p> : null}
                </div>

                {priceType === "normal" ? (
                  <div>
                    <h3 className="font-heading font-semibold text-sm mb-3 uppercase tracking-[0.2em]">Escolha o tamanho</h3>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-12 h-12 px-3 border rounded-2xl text-sm font-semibold transition ${selectedSize === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-accent bg-background"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-accent/20 bg-accent/5 p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-heading font-black text-lg uppercase flex items-center gap-2"><PackageCheck className="w-5 h-5" /> Monte os 10 pares</h3>
                        <p className="text-sm text-muted-foreground mt-1">Selecione o tamanho de cada um dos 10 pares do kit revenda.</p>
                      </div>
                      <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-heading font-bold uppercase text-accent-foreground">{resaleSizes.filter(Boolean).length}/10</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {resaleSizes.map((currentSize, index) => (
                        <label key={index} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Par {index + 1}</span>
                          <select
                            value={currentSize}
                            onChange={(e) => handleResaleSizeChange(index, e.target.value)}
                            className="w-full bg-transparent outline-none"
                          >
                            <option value="">Selecione o tamanho</option>
                            {sizes.map((size) => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Resumo do kit</p>
                      <p className="mt-2 text-sm font-medium">{resaleSummary || "Selecione os tamanhos para montar o kit de 10 pares."}</p>
                    </div>
                  </div>
                )}

                {priceType === "normal" ? (
                  <div>
                    <h3 className="font-heading font-semibold text-sm mb-3 uppercase tracking-[0.2em]">Quantidade</h3>
                    <div className="flex items-center border border-border rounded-2xl w-fit bg-background">
                      <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:bg-muted transition">-</button>
                      <span className="px-5 py-3 font-semibold text-sm">{qty}</span>
                      <button onClick={() => setQty(qty + 1)} className="px-4 py-3 hover:bg-muted transition">+</button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                    O preço de revenda corresponde a <strong className="text-foreground">1 kit com 10 pares</strong>.
                  </div>
                )}
              </div>

              <div className="mt-7 flex gap-3">
                <button onClick={handleAdd} className="flex-1 rounded-2xl bg-accent text-accent-foreground font-heading font-black text-sm py-4 hover:opacity-90 transition uppercase tracking-[0.24em]">
                  {priceType === "revenda" ? "Adicionar kit revenda" : "Adicionar ao carrinho"}
                </button>
              </div>

              <div className="mt-7 border-t border-border pt-5">
                <h3 className="font-heading font-semibold text-sm mb-2 uppercase tracking-[0.2em]">Descrição</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            </>
          ) : (
            <div className="mt-6 border-t border-border pt-5">
              <h3 className="font-heading font-semibold text-sm mb-2 uppercase tracking-[0.2em]">Descrição</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-heading font-black text-xl uppercase tracking-wider mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProdutoDetalhe;
