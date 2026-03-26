import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ChevronLeft, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { formatBRL, getProductPrices } from "@/lib/product-pricing";
import { getResolvedProductData } from "@/lib/product-details";
import { api, type Product } from "@/lib/api";

const RESALE_SLOTS = 10;

const ProdutoDetalhe = () => {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [mainImage, setMainImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [priceType, setPriceType] = useState<"normal" | "revenda">("normal");
  const [resaleSizes, setResaleSizes] = useState<string[]>(Array(RESALE_SLOTS).fill(""));

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const res = await api.getProduct(id);
        setProduct(res.product);
        const all = await api.getProducts();
        setRelated(all.products.filter((p) => p.categorySlug === res.product.categorySlug && p.id !== res.product.id).slice(0, 4));
      } catch {
        setProduct(null);
      }
    })();
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  if (!product) return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center"><p>Produto não encontrado.</p></div><Footer /></div>;

  const prices = getProductPrices(product);
  const resolved = getResolvedProductData(product);
  const sizes = resolved.sizes;
  const colors = resolved.colors;
  const inWish = isInWishlist(product.id);
  const resaleReady = useMemo(() => resaleSizes.every((item) => item), [resaleSizes]);
  const resaleSummary = useMemo(() => Object.entries(resaleSizes.filter(Boolean).reduce<Record<string, number>>((acc, size) => { acc[size] = (acc[size] || 0) + 1; return acc; }, {})).map(([size, amount]) => `${amount}x ${size}`).join(" • "), [resaleSizes]);

  const handleAdd = async () => {
    if (!isLoggedIn) return toast.error("Faça login para comprar!");
    if (!selectedColor) return toast.error("Selecione a cor do produto!");
    if (priceType === "normal" && !selectedSize) return toast.error("Selecione o tamanho!");
    if (priceType === "revenda" && !resaleReady) return toast.error("Escolha os 10 tamanhos do kit revenda.");
    try {
      const unitPrice = priceType === "normal" ? prices.normalPrice : prices.resalePrice;
      await addToCart({ productId: product.id, name: product.name, image: product.images[0], size: priceType === "normal" ? selectedSize : "Kit revenda (10 pares)", color: selectedColor, qty: priceType === "normal" ? qty : 1, unitPrice, priceType, selectedSizes: priceType === "revenda" ? resaleSizes : undefined, isResaleKit: priceType === "revenda" });
      toast.success(priceType === "revenda" ? "Kit revenda adicionado ao carrinho!" : "Produto adicionado ao carrinho!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao adicionar no carrinho.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <div className="container-shop py-6 md:py-8 flex-1">
        <Link to="/produtos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-4"><ChevronLeft className="w-4 h-4" /> Voltar para produtos</Link>
        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8 xl:gap-10">
          <div className="space-y-3">
            <div className="aspect-square bg-card border border-border rounded-[28px] overflow-hidden shadow-sm"><img src={product.images[mainImage] || product.images[0]} alt={product.name} className="w-full h-full object-cover" /></div>
            <div className="grid grid-cols-4 gap-3">{product.images.map((img, i) => <button key={i} onClick={() => setMainImage(i)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition ${mainImage === i ? "border-accent shadow-md" : "border-border"}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>)}</div>
          </div>
          <div className="rounded-[32px] border border-border bg-card p-5 md:p-7 xl:p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-xs uppercase tracking-[0.28em] text-muted-foreground mb-2">{product.category}</p><h1 className="font-heading font-black text-2xl md:text-3xl leading-tight">{product.name}</h1></div>
              <button onClick={() => void toggleWishlist(product.id)} className={`w-12 h-12 border rounded-2xl flex items-center justify-center transition ${inWish ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}><Heart className="w-5 h-5" fill={inWish ? "currentColor" : "none"} /></button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setPriceType("normal")} className={`rounded-2xl border px-4 py-4 text-left transition ${priceType === "normal" ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-background hover:border-accent"}`}><div className="flex items-center justify-between gap-2"><p className="text-[11px] uppercase tracking-[0.18em]">Normal</p>{priceType === "normal" ? <Check className="w-4 h-4" /> : null}</div><p className="mt-2 font-heading font-black text-2xl leading-none">{formatBRL(prices.normalPrice)}</p></button>
              <button onClick={() => setPriceType("revenda")} className={`rounded-2xl border px-4 py-4 text-left transition ${priceType === "revenda" ? "border-accent bg-accent text-accent-foreground shadow-sm" : "border-border bg-background hover:border-accent"}`}><div className="flex items-center justify-between gap-2"><p className="text-[11px] uppercase tracking-[0.18em]">Revenda</p><span className="rounded-full px-2.5 py-1 text-[10px] font-heading font-bold uppercase bg-accent-foreground/15">10 pares</span></div><p className="mt-2 font-heading font-black text-2xl leading-none">{formatBRL(prices.resalePrice)}</p></button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground leading-7">{product.description}</p>
            <div className="mt-6"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cor</p><div className="mt-3 flex flex-wrap gap-3">{colors.map((color) => <button key={color.name} onClick={() => setSelectedColor(color.name)} className={`rounded-full border px-3 py-2 text-sm ${selectedColor === color.name ? "border-accent" : "border-border"}`}><span className="inline-block w-4 h-4 rounded-full border mr-2 align-middle" style={{ backgroundColor: color.hex }} />{color.name}</button>)}</div></div>
            {priceType === "normal" ? <div className="mt-6"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tamanho</p><div className="mt-3 flex flex-wrap gap-2">{sizes.map((size) => <button key={size} onClick={() => setSelectedSize(size)} className={`rounded-xl border px-4 py-2 text-sm ${selectedSize === size ? "border-accent bg-accent/5" : "border-border"}`}>{size}</button>)}</div><div className="mt-4 flex items-center border border-border rounded-2xl w-fit"><button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2">-</button><span className="px-4">{qty}</span><button onClick={() => setQty((q) => q + 1)} className="px-3 py-2">+</button></div></div> : <div className="mt-6"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Escolha os 10 tamanhos do kit</p><div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">{resaleSizes.map((value, index) => <select key={index} value={value} onChange={(e) => setResaleSizes((current) => current.map((item, itemIndex) => itemIndex === index ? e.target.value : item))} className="rounded-xl border border-border bg-background px-3 py-2 text-sm"><option value="">Par {index + 1}</option>{sizes.map((size) => <option key={size} value={size}>{size}</option>)}</select>)}</div>{resaleSummary ? <p className="mt-3 text-sm text-muted-foreground">{resaleSummary}</p> : null}</div>}
            <button onClick={() => void handleAdd()} className="mt-8 w-full rounded-2xl bg-accent px-6 py-4 text-sm font-heading font-black uppercase text-accent-foreground">Adicionar ao carrinho</button>
          </div>
        </div>
        {related.length > 0 ? <section className="mt-12"><h2 className="font-heading font-black text-2xl uppercase mb-6">Relacionados</h2><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section> : null}
      </div>
      <Footer />
    </div>
  );
};

export default ProdutoDetalhe;
