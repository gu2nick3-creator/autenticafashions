import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { api } from "@/api/client";
import { toast } from "sonner";
import { formatBRL } from "@/lib/product-pricing";

const emptyAddressForm = { label: "Casa", recipient: "", zipCode: "", street: "", number: "", district: "", city: "", state: "", complement: "" };

const Carrinho = () => {
  const { user, isLoggedIn, addAddress } = useAuth();
  const { items, removeFromCart, updateQty, clearCart } = useCart();
  const addresses = user?.addresses || [];
  const [addressMode, setAddressMode] = useState<"saved" | "new">(addresses.length ? "saved" : "new");
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || 0);
  const [submitting, setSubmitting] = useState(false);
  const [addressForm, setAddressForm] = useState({ ...emptyAddressForm, recipient: user?.name || "" });
  const navigate = useNavigate();
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.unitPrice || 0) * item.qty, 0), [items]);

  const resolveAddress = async () => {
    if (addressMode === "saved") {
      const address = addresses.find((item) => item.id === Number(selectedAddressId)) || addresses[0];
      if (!address) { toast.error("Selecione um endereço."); return null; }
      return address;
    }
    const required = [addressForm.label, addressForm.recipient, addressForm.zipCode, addressForm.street, addressForm.number, addressForm.district, addressForm.city, addressForm.state];
    if (required.some((field) => !field.trim())) { toast.error("Preencha todos os campos obrigatórios do endereço."); return null; }
    const result = await addAddress({ label: addressForm.label.trim(), recipient: addressForm.recipient.trim(), zipCode: addressForm.zipCode.trim(), street: addressForm.street.trim(), number: addressForm.number.trim(), district: addressForm.district.trim(), city: addressForm.city.trim(), state: addressForm.state.trim(), complement: addressForm.complement.trim() });
    if (!result.ok || !result.address) { toast.error(result.message || "Não foi possível salvar o endereço."); return null; }
    setSelectedAddressId(result.address.id);
    setAddressMode("saved");
    return result.address;
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) return toast.error("Faça login para finalizar o pedido.");
    if (!items.length) return toast.error("Seu carrinho está vazio.");
    const address = await resolveAddress();
    if (!address) return;
    setSubmitting(true);
    try {
      const data = await api.post<{ paymentUrl?: string; orderCode: string; paymentPending?: boolean }>("/checkout", { addressId: address.id, paymentMethod: "InfinitePay" });
      toast.success("Pedido criado com sucesso.");
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      await clearCart();
      navigate(`/checkout/retorno?order=${data.orderCode}&status=success`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1 grid place-items-center"><div className="text-center"><p className="mb-4">Faça login para acessar o carrinho.</p><Link to="/login" className="bg-accent text-accent-foreground px-5 py-3 rounded-xl">Entrar</Link></div></div><Footer /></div>;

  return <div className="min-h-screen flex flex-col bg-secondary/30"><Header /><main className="container-shop flex-1 py-8"><div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8"><section><p className="text-xs uppercase tracking-[0.28em] text-muted-foreground font-heading">Checkout</p><h1 className="mt-3 font-heading font-black text-3xl md:text-4xl uppercase leading-tight">Finalizar pedido</h1><p className="mt-3 text-sm md:text-base text-muted-foreground">Revise seus itens, escolha o endereço de entrega e conclua o pedido.</p><div className="mt-8 space-y-4">{items.length === 0 ? <div className="rounded-3xl border border-border bg-card p-8 text-center"><p className="text-muted-foreground">Seu carrinho está vazio.</p></div> : items.map((item) => <div key={`${item.productId}-${item.size}-${item.color}-${(item.selectedSizes || []).join(',')}`} className="rounded-3xl border border-border bg-card p-5"><div className="flex gap-4"><img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover border border-border" /><div className="flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-heading font-black text-base leading-6">{item.name}</p><div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em]"><span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground">{item.priceType === "normal" ? "Preço normal" : "Preço revenda"}</span><span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground">Cor {item.color}</span><span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground">{item.size}</span></div></div><button onClick={() => removeFromCart(item.productId, item.size, item.color)} className="text-muted-foreground hover:text-destructive transition"><Trash2 className="w-4 h-4" /></button></div>{item.priceType === "revenda" && item.selectedSizes?.length ? <div className="mt-4 rounded-2xl border border-border bg-secondary/60 p-4"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Tamanhos escolhidos no kit</p><div className="mt-3 flex flex-wrap gap-2">{item.selectedSizes.map((size, idx) => <span key={`${size}-${idx}`} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">Par {idx + 1}: {size}</span>)}</div></div> : null}<div className="mt-4 flex items-center justify-between"><div className="flex items-center gap-2"><button onClick={() => updateQty(item.productId, item.size, item.color, Math.max(1, item.qty - 1))} className="rounded-xl border px-3 py-1">-</button><span>{item.qty}</span><button onClick={() => updateQty(item.productId, item.size, item.color, item.qty + 1)} className="rounded-xl border px-3 py-1">+</button></div><strong>{formatBRL((item.unitPrice || 0) * item.qty)}</strong></div></div></div></div>)}</div></section><aside className="space-y-5"><div className="rounded-3xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Entrega</p><div className="mt-4 flex gap-2"><button onClick={() => setAddressMode("saved")} className={`rounded-xl px-4 py-2 text-sm border ${addressMode === "saved" ? "bg-primary text-primary-foreground" : "bg-background"}`}>Usar salvo</button><button onClick={() => setAddressMode("new")} className={`rounded-xl px-4 py-2 text-sm border ${addressMode === "new" ? "bg-primary text-primary-foreground" : "bg-background"}`}>Novo endereço</button></div>{addressMode === "saved" && addresses.length > 0 ? <select className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-3" value={selectedAddressId} onChange={(e) => setSelectedAddressId(Number(e.target.value))}>{addresses.map((address) => <option key={address.id} value={address.id}>{address.label} - {address.street}, {address.number}</option>)}</select> : <div className="mt-4 grid gap-3">{Object.entries(addressForm).map(([key, value]) => <input key={key} value={value} onChange={(e) => setAddressForm((current) => ({ ...current, [key]: e.target.value }))} placeholder={key} className="rounded-xl border border-border bg-background px-3 py-3 text-sm" />)}</div>}</div><div className="rounded-3xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Resumo</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span>Itens</span><span>{items.length}</span></div><div className="flex justify-between"><span>Total</span><strong>{formatBRL(subtotal)}</strong></div></div><button onClick={handleCheckout} disabled={submitting || items.length === 0} className="mt-6 w-full rounded-2xl bg-accent px-5 py-4 font-heading font-black uppercase text-accent-foreground disabled:opacity-60">{submitting ? "Processando..." : "Finalizar pedido"}</button><p className="mt-3 text-xs text-muted-foreground">O backend já está preparado para integração real com InfinitePay. Sem credenciais válidas, o pedido é criado localmente no backend para fluxo de testes.</p></div></aside></div></main><Footer /></div>;
};

export default Carrinho;
