import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/api/client";
import { toast } from "sonner";
import type { Order } from "@/types/api";

type Tab = "pedidos" | "enderecos" | "rastreio" | "dados";
const tabs: { id: Tab; label: string; hint: string }[] = [
  { id: "pedidos", label: "Pedidos", hint: "Histórico completo" },
  { id: "enderecos", label: "Endereços", hint: "Seus locais salvos" },
  { id: "rastreio", label: "Rastreio", hint: "Status da entrega" },
  { id: "dados", label: "Dados", hint: "Atualize seu perfil" },
];

const MinhaConta = () => {
  const { user, isLoggedIn, updateProfile, addAddress, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [orders, setOrders] = useState<Order[]>([]);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", cpf: user?.cpf || "" });
  const [addressForm, setAddressForm] = useState({ label: "Casa", recipient: user?.name || "", zipCode: "", street: "", number: "", district: "", city: "", state: "", complement: "" });

  useEffect(() => { setProfileForm({ name: user?.name || "", cpf: user?.cpf || "" }); }, [user]);
  useEffect(() => { if (isLoggedIn) api.get<Order[]>("/account/orders").then(setOrders).catch(() => setOrders([])); }, [isLoggedIn]);
  if (!isLoggedIn) return <Navigate to="/login" />;
  const addresses = user?.addresses || [];

  const handleSaveProfile = async () => {
    const result = await updateProfile(profileForm);
    if (!result.ok) return toast.error(result.message || "Não foi possível atualizar os dados.");
    toast.success("Dados atualizados com sucesso.");
  };

  const handleAddAddress = async () => {
    if (!addressForm.label || !addressForm.recipient || !addressForm.zipCode || !addressForm.street || !addressForm.number || !addressForm.district || !addressForm.city || !addressForm.state) return toast.error("Preencha os campos obrigatórios do endereço.");
    const result = await addAddress(addressForm);
    if (!result.ok) return toast.error(result.message || "Não foi possível salvar o endereço.");
    toast.success("Endereço salvo com sucesso.");
    setAddressForm({ label: "Casa", recipient: user?.name || "", zipCode: "", street: "", number: "", district: "", city: "", state: "", complement: "" });
    await refreshUser();
  };

  return <div className="min-h-screen flex flex-col bg-secondary/30"><Header /><main className="container-shop flex-1 py-8"><div className="rounded-[32px] border border-border bg-card p-6 md:p-8 shadow-sm"><div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"><div><p className="text-xs uppercase tracking-[0.28em] text-muted-foreground font-heading">Área do cliente</p><h1 className="mt-3 font-heading font-black text-3xl md:text-4xl uppercase">Minha conta</h1><p className="mt-3 text-muted-foreground leading-7">Acompanhe seus pedidos, confira rastreio, gerencie endereços e mantenha seus dados sempre atualizados.</p></div><div className="grid grid-cols-2 gap-4 min-w-[260px]"><Stat label="Pedidos" value={String(orders.length)} /><Stat label="Endereços" value={String(addresses.length)} /></div></div><div className="mt-8 grid lg:grid-cols-[260px_1fr] gap-6"><div className="space-y-3">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full rounded-2xl border p-4 text-left transition ${activeTab === tab.id ? "border-accent bg-accent/10" : "border-border bg-background"}`}><p className="font-heading font-black uppercase text-base">{tab.label}</p><p className="mt-1 text-sm text-muted-foreground">{tab.hint}</p></button>)}</div><div className="rounded-3xl border border-border bg-background p-5 md:p-6">{activeTab === "pedidos" && <div><h2 className="font-heading font-black text-2xl uppercase">Seus pedidos</h2><div className="mt-6 space-y-4">{orders.length === 0 ? <p className="text-muted-foreground">Nenhum pedido ainda.</p> : orders.map((order) => <div key={order.id} className="rounded-3xl border border-border p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Pedido {order.code}</p><p className="font-heading font-black text-xl uppercase mt-2">{order.status}</p></div><div className="text-right"><p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString("pt-BR")}</p><p className="font-black text-lg">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total)}</p></div></div><p className="mt-3 text-sm text-muted-foreground">{order.address}</p>{order.orderItems?.length ? <div className="mt-4 space-y-2">{order.orderItems.map((item, idx) => <div key={idx} className="flex items-center justify-between text-sm"><span>{item.name} • {item.color} • {item.size}</span><strong>{item.qty}x</strong></div>)}</div> : null}</div>)}</div></div>}{activeTab === "enderecos" && <div><h2 className="font-heading font-black text-2xl uppercase">Endereços</h2><div className="mt-6 grid md:grid-cols-2 gap-4">{addresses.map((address) => <div key={address.id} className="rounded-3xl border border-border bg-background p-5"><p className="font-heading font-black uppercase text-base">{address.label}</p><div className="mt-3 text-sm text-muted-foreground leading-6"><p className="text-foreground font-medium">{address.recipient}</p><p>{address.street}, {address.number}</p><p>{address.district}</p><p>{address.city}/{address.state}</p><p>CEP {address.zipCode}</p>{address.complement && <p>Compl.: {address.complement}</p>}</div></div>)}</div><div className="mt-8 grid md:grid-cols-2 gap-3">{Object.entries(addressForm).map(([key, value]) => <input key={key} value={value} onChange={(e) => setAddressForm((current) => ({ ...current, [key]: e.target.value }))} placeholder={key} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm" />)}</div><button onClick={handleAddAddress} className="mt-5 rounded-2xl bg-accent px-5 py-3 text-sm font-heading font-black uppercase text-accent-foreground">Salvar endereço</button></div>}{activeTab === "rastreio" && <div><h2 className="font-heading font-black text-2xl uppercase">Rastreio dos pedidos</h2><div className="mt-6 space-y-4">{orders.filter((item) => item.trackingCode).length === 0 ? <p className="text-muted-foreground">Quando um pedido for atualizado, o rastreio aparece aqui.</p> : orders.filter((item) => item.trackingCode).map((order) => <div key={order.id} className="rounded-3xl border border-border p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Código de rastreio</p><p className="mt-2 font-heading font-black text-xl">{order.trackingCode}</p><p className="mt-2 text-sm leading-6">{order.address}</p></div>)}</div></div>}{activeTab === "dados" && <div><h2 className="font-heading font-black text-2xl uppercase">Seus dados</h2><div className="mt-6 grid gap-3 max-w-xl"><input value={profileForm.name} onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))} placeholder="Nome completo" className="rounded-2xl border border-border bg-card px-4 py-3 text-sm" /><input value={profileForm.cpf} onChange={(e) => setProfileForm((current) => ({ ...current, cpf: e.target.value }))} placeholder="CPF" className="rounded-2xl border border-border bg-card px-4 py-3 text-sm" /><input value={user?.email || ""} disabled className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm" /><button onClick={handleSaveProfile} className="rounded-2xl bg-accent px-5 py-3 text-sm font-heading font-black uppercase text-accent-foreground">Salvar alterações</button></div></div>}</div></div></div></main><Footer /></div>;
};

const Stat = ({ label, value }: { label: string; value: string }) => <div className="rounded-3xl border border-border bg-background p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">{label}</p><p className="mt-2 text-2xl font-heading font-black">{value}</p></div>;

export default MinhaConta;
