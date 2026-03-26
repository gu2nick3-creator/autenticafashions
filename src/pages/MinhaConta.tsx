import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Order } from "@/lib/api";
import { toast } from "sonner";

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
const formatDate = (value?: string) => value ? new Date(value).toLocaleString("pt-BR") : "-";

const tabs = [
  { id: "pedidos", label: "Pedidos", hint: "Acompanhe suas compras" },
  { id: "enderecos", label: "Endereços", hint: "Gerencie seus endereços" },
  { id: "perfil", label: "Perfil", hint: "Atualize seus dados" },
] as const;

type Tab = typeof tabs[number]["id"];

const MinhaConta = () => {
  const { user, isLoggedIn, addAddress, updateProfile, logout, loading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", cpf: user?.cpf || "" });
  const [addressForm, setAddressForm] = useState({ label: "", recipient: user?.name || "", zipCode: "", street: "", number: "", district: "", city: "", state: "", complement: "" });
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    void api.myOrders().then((res) => setOrders(res.orders)).catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    setProfileForm({ name: user?.name || "", cpf: user?.cpf || "" });
  }, [user?.name, user?.cpf]);

  const addresses = user?.addresses || [];
  const totalSpent = useMemo(() => orders.reduce((sum, order) => sum + (order.total || 0), 0), [orders]);

  if (loading) return <div className="min-h-screen" />;
  if (!isLoggedIn || user?.isAdmin) return <Navigate to="/login" />;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile(profileForm);
    if (!result.ok) return toast.error("Não foi possível atualizar.");
    toast.success("Dados atualizados.");
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addAddress(addressForm);
    if (!result.ok) return toast.error(result.message || "Não foi possível salvar o endereço.");
    await refreshUser();
    setAddressForm({ label: "", recipient: user?.name || "", zipCode: "", street: "", number: "", district: "", city: "", state: "", complement: "" });
    toast.success("Endereço adicionado.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      <section className="w-full border-b border-border bg-background">
        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-10 py-6 md:py-8">
          <div className="rounded-[28px] border border-border bg-card p-5 md:p-8 shadow-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div><p className="text-xs md:text-sm uppercase tracking-[0.28em] text-muted-foreground font-heading">Área do Cliente</p><h1 className="mt-2 text-3xl md:text-4xl font-heading font-black uppercase leading-none">Minha Conta</h1></div>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 min-w-full xl:min-w-[720px]"><Stat label="Pedidos" value={String(orders.length)} /><Stat label="Endereços" value={String(addresses.length)} /><Stat label="Em rastreio" value={String(orders.filter((o) => o.trackingCode).length)} /><Stat label="Total comprado" value={money(totalSpent)} /></div>
            </div>
            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-t border-border pt-6"><div><p className="font-semibold text-base md:text-lg">{user?.name}</p><p className="text-sm text-muted-foreground">{user?.email}</p></div><button onClick={() => void logout()} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-heading font-bold uppercase text-accent-foreground">Sair da conta</button></div>
          </div>
        </div>
      </section>
      <div className="flex-1 w-full"><div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-10 py-6 md:py-8"><div className="flex gap-3 overflow-x-auto pb-2">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`min-w-[180px] rounded-2xl border px-4 py-4 text-left transition ${activeTab === tab.id ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:bg-muted"}`}><p className="font-heading font-black uppercase text-sm">{tab.label}</p><p className={`mt-1 text-xs ${activeTab === tab.id ? "text-accent-foreground/80" : "text-muted-foreground"}`}>{tab.hint}</p></button>)}</div>
      <div className="mt-6 rounded-[28px] border border-border bg-card p-4 md:p-6 lg:p-8 shadow-sm min-h-[560px]">
        {activeTab === "pedidos" && <div>{orders.length === 0 ? <p className="text-muted-foreground">Nenhum pedido ainda.</p> : <div className="grid gap-4 xl:grid-cols-2">{orders.map((order) => <div key={order.id} className="rounded-3xl border border-border bg-background p-5"><div className="flex justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-heading">Pedido</p><p className="mt-1 text-lg font-heading font-black">{order.orderNumber || order.id}</p><p className="mt-2 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p></div><div className="rounded-full border border-border px-3 py-1.5 text-xs uppercase font-heading font-bold">{order.status}</div></div><div className="mt-5 grid sm:grid-cols-3 gap-3"><StatCard label="Itens" value={String(order.itemsCount)} /><StatCard label="Valor total" value={money(order.total)} /></div><div className="mt-5 rounded-2xl border border-border p-4"><p className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-heading">Entrega</p><p className="mt-2 text-sm leading-6 text-foreground">{order.address}</p>{order.trackingCode ? <p className="mt-3 text-sm"><strong>Rastreio:</strong> {order.trackingCode}</p> : null}</div></div>)}</div>}</div>}
        {activeTab === "enderecos" && <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6"><div><h2 className="font-heading font-black text-2xl uppercase">Seus endereços</h2><div className="mt-5 space-y-3">{addresses.map((address) => <div key={address.id} className="rounded-3xl border border-border bg-background p-5"><p className="font-heading font-black uppercase">{address.label}</p><p className="mt-2 text-sm text-muted-foreground">{address.recipient}<br />{address.street}, {address.number} - {address.district}<br />{address.city}/{address.state} • CEP {address.zipCode}</p></div>)}</div></div><form onSubmit={handleAddressSubmit} className="space-y-3"><h2 className="font-heading font-black text-2xl uppercase">Novo endereço</h2>{Object.entries(addressForm).map(([key, value]) => <input key={key} value={value} onChange={(e) => setAddressForm((current) => ({ ...current, [key]: e.target.value }))} placeholder={key} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />)}<button className="rounded-xl bg-accent px-4 py-3 text-sm font-heading font-bold uppercase text-accent-foreground">Salvar endereço</button></form></div>}
        {activeTab === "perfil" && <form onSubmit={handleProfileSave} className="max-w-xl space-y-4"><h2 className="font-heading font-black text-2xl uppercase">Seus dados</h2><input value={profileForm.name} onChange={(e) => setProfileForm((current) => ({ ...current, name: e.target.value }))} placeholder="Nome" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /><input value={profileForm.cpf} onChange={(e) => setProfileForm((current) => ({ ...current, cpf: e.target.value }))} placeholder="CPF" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /><button className="rounded-xl bg-accent px-4 py-3 text-sm font-heading font-bold uppercase text-accent-foreground">Salvar dados</button></form>}
      </div></div></div>
      <Footer />
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => <div className="rounded-2xl border border-border bg-secondary/60 p-4"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">{label}</p><p className="mt-2 text-2xl font-heading font-black">{value}</p></div>;
const StatCard = ({ label, value }: { label: string; value: string }) => <div className="rounded-2xl bg-secondary/60 border border-border p-4 sm:col-span-1"><p className="text-xs uppercase text-muted-foreground font-heading">{label}</p><p className="mt-2 font-heading font-black text-xl">{value}</p></div>;

export default MinhaConta;
