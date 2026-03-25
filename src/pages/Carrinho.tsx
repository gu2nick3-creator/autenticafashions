import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Trash2, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { api, type Address, type Coupon } from "@/lib/api";

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
const emptyAddressForm = { label: "", recipient: "", zipCode: "", street: "", number: "", district: "", city: "", state: "", complement: "" };

const Carrinho = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQty, clearCart } = useCart();
  const { isLoggedIn, user, addAddress } = useAuth();
  const addresses = user?.addresses || [];
  const [addressMode, setAddressMode] = useState<"saved" | "new">(addresses.length ? "saved" : "new");
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || "");
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [addressForm, setAddressForm] = useState({ ...emptyAddressForm, recipient: user?.name || "" });

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * item.qty, 0), [items]);
  const discount = useMemo(() => {
    if (!coupon) return 0;
    return coupon.discountType === "percent" ? subtotal * (coupon.discountValue / 100) : coupon.discountValue;
  }, [coupon, subtotal]);
  const total = Math.max(0, subtotal - discount);

  if (!isLoggedIn) return <div className="min-h-screen flex flex-col bg-secondary/40"><Header /><div className="flex-1 flex flex-col items-center justify-center py-12"><p className="text-muted-foreground mb-4">Faça login para acessar seu checkout</p><Link to="/login" className="bg-accent text-accent-foreground font-heading font-bold text-sm px-6 py-2.5 rounded uppercase">Fazer Login</Link></div><Footer /></div>;

  const resolveAddress = async (): Promise<Address | null> => {
    if (addressMode === "saved") {
      const address = addresses.find((item) => item.id === selectedAddressId) || addresses[0];
      return address || null;
    }
    const result = await addAddress(addressForm);
    return result.address || null;
  };

  const applyCoupon = async () => {
    try {
      const res = await api.validateCoupon(couponCode);
      setCoupon(res.coupon);
      toast.success("Cupom aplicado.");
    } catch (error) {
      setCoupon(null);
      toast.error(error instanceof Error ? error.message : "Cupom inválido.");
    }
  };

  const finalizeOrder = async () => {
    if (!items.length) return toast.error("Seu carrinho está vazio.");
    const address = await resolveAddress();
    if (!address) return toast.error("Selecione ou cadastre um endereço.");
    setSubmitting(true);
    try {
      await api.createOrder({ addressId: address.id, items, subtotal, discount, total, couponCode: coupon?.code, paymentMethod: "InfinitePay (preparado)", paymentStatus: "Pendente" });
      await clearCart();
      toast.success("Pedido criado com sucesso.");
      navigate("/minha-conta");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/40">
      <Header />
      <main className="container-shop flex-1 py-8">
        <h1 className="font-heading font-black text-2xl uppercase mb-6">Carrinho</h1>
        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="space-y-4">
            {items.length === 0 ? <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center"><p className="font-heading font-black text-xl uppercase">Seu carrinho está vazio</p></div> : items.map((item) => <div key={`${item.id}-${item.productId}-${item.size}-${item.color}`} className="rounded-[28px] border border-border bg-card p-5"><div className="flex gap-4"><img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover" /><div className="flex-1"><div className="flex justify-between gap-4"><div><p className="font-heading font-black text-lg">{item.name}</p><p className="text-sm text-muted-foreground">{item.color} • {item.size}</p>{item.selectedSizes?.length ? <p className="text-sm text-muted-foreground mt-2">Kit: {item.selectedSizes.join(", ")}</p> : null}</div><button onClick={() => void removeFromCart(item.productId, item.size, item.color)}><Trash2 className="w-5 h-5" /></button></div><div className="mt-4 flex items-center justify-between gap-3">{item.priceType === "normal" ? <div className="flex items-center border border-border rounded-2xl"><button onClick={() => void updateQty(item.productId, item.size, item.color, Math.max(1, item.qty - 1))} className="px-3 py-2">-</button><span className="px-4">{item.qty}</span><button onClick={() => void updateQty(item.productId, item.size, item.color, item.qty + 1)} className="px-3 py-2">+</button></div> : <div className="rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm">1 kit revenda = 10 pares</div>}<strong>{money(Number(item.unitPrice || 0) * item.qty)}</strong></div></div></div></div>)}
          </div>
          <div className="rounded-[32px] border border-border bg-card p-5 md:p-6 shadow-sm h-fit">
            <div className="flex items-center gap-3"><MapPin className="w-5 h-5" /><div><h2 className="font-heading font-black text-xl uppercase">Entrega e resumo</h2><p className="text-sm text-muted-foreground">Selecione um endereço e finalize.</p></div></div>
            <div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => setAddressMode("saved")} className={`rounded-2xl border p-3 text-sm ${addressMode === "saved" ? "border-accent bg-accent/5" : "border-border"}`}>Endereço salvo</button><button onClick={() => setAddressMode("new")} className={`rounded-2xl border p-3 text-sm ${addressMode === "new" ? "border-accent bg-accent/5" : "border-border"}`}>Novo endereço</button></div>
            {addressMode === "saved" ? <div className="mt-4 space-y-3">{addresses.map((address) => <button key={address.id} onClick={() => setSelectedAddressId(address.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedAddressId === address.id ? "border-accent bg-accent/5" : "border-border"}`}><p className="font-heading font-black uppercase text-sm">{address.label}</p><p className="mt-2 text-sm text-muted-foreground">{address.street}, {address.number} - {address.city}/{address.state}</p></button>)}</div> : <div className="mt-4 grid gap-3">{Object.entries(addressForm).map(([key, value]) => <input key={key} value={value} onChange={(e) => setAddressForm((current) => ({ ...current, [key]: e.target.value }))} placeholder={key} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />)}</div>}
            <div className="mt-4 flex gap-2"><input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Cupom" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm" /><button onClick={() => void applyCoupon()} className="rounded-xl border border-border px-4 py-2 text-sm">Aplicar</button></div>
            <div className="mt-6 space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between"><span>Desconto</span><span>- {money(discount)}</span></div><div className="flex justify-between font-heading font-black text-lg"><span>Total</span><span>{money(total)}</span></div></div>
            <button disabled={submitting || items.length === 0} onClick={() => void finalizeOrder()} className="mt-6 w-full rounded-2xl bg-accent px-6 py-4 text-sm font-heading font-black uppercase text-accent-foreground disabled:opacity-50">{submitting ? "Finalizando..." : "Finalizar pedido"}</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Carrinho;
