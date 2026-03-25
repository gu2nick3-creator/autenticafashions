import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Tab = "pedidos" | "enderecos" | "rastreio" | "dados";
type Order = {
  id: string;
  customerId?: string;
  clientName: string;
  clientEmail: string;
  address: string;
  status: string;
  trackingCode: string;
  items: number;
  total: number;
  createdAt: string;
};

const tabs: { id: Tab; label: string; hint: string }[] = [
  { id: "pedidos", label: "Pedidos", hint: "Histórico completo" },
  { id: "enderecos", label: "Endereços", hint: "Seus locais salvos" },
  { id: "rastreio", label: "Rastreio", hint: "Status da entrega" },
  { id: "dados", label: "Dados", hint: "Informações da conta" },
];

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString("pt-BR") : "-");

const getStatusLabel = (status?: string) => {
  if (!status) return "Aguardando atualização";
  return status;
};

const MinhaConta = () => {
  const { user, isLoggedIn, addAddress, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", cpf: user?.cpf || "" });
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipient: user?.name || "",
    zipCode: "",
    street: "",
    number: "",
    district: "",
    city: "",
    state: "",
    complement: "",
  });

  const orders = useMemo(() => {
    const all = readJson<Order[]>("af_orders", []);
    return all.filter(
      (order) => order.customerId === user?.id || order.clientEmail?.toLowerCase() === user?.email?.toLowerCase(),
    );
  }, [user?.id, user?.email]);

  const addresses = user?.addresses || [];
  const trackingOrders = orders.filter((order) => order.status || order.trackingCode);
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  if (!isLoggedIn || user?.isAdmin) return <Navigate to="/login" />;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.cpf) {
      toast.error("Preencha nome e CPF.");
      return;
    }
    updateProfile(profileForm);
    toast.success("Dados atualizados.");
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addressForm.label ||
      !addressForm.recipient ||
      !addressForm.zipCode ||
      !addressForm.street ||
      !addressForm.number ||
      !addressForm.district ||
      !addressForm.city ||
      !addressForm.state
    ) {
      toast.error("Preencha os dados principais do endereço.");
      return;
    }
    const result = addAddress(addressForm);
    if (!result.ok) {
      toast.error(result.message || "Não foi possível salvar o endereço.");
      return;
    }
    setAddressForm({
      label: "",
      recipient: user?.name || "",
      zipCode: "",
      street: "",
      number: "",
      district: "",
      city: "",
      state: "",
      complement: "",
    });
    toast.success("Endereço adicionado.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />

      <section className="w-full border-b border-border bg-background">
        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-10 py-6 md:py-8">
          <div className="rounded-[28px] border border-border bg-card p-5 md:p-8 shadow-sm">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs md:text-sm uppercase tracking-[0.28em] text-muted-foreground font-heading">
                  Área do Cliente
                </p>
                <h1 className="mt-2 text-3xl md:text-4xl font-heading font-black uppercase leading-none">
                  Minha Conta
                </h1>
                <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
                  Acompanhe seus pedidos, confira rastreio, gerencie endereços e mantenha seus dados sempre atualizados.
                </p>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 min-w-full xl:min-w-[720px]">
                <div className="rounded-2xl border border-border bg-secondary/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Pedidos</p>
                  <p className="mt-2 text-2xl font-heading font-black">{orders.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Endereços</p>
                  <p className="mt-2 text-2xl font-heading font-black">{addresses.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Em rastreio</p>
                  <p className="mt-2 text-2xl font-heading font-black">{trackingOrders.length}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Total comprado</p>
                  <p className="mt-2 text-lg md:text-2xl font-heading font-black">{money(totalSpent)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-t border-border pt-6">
              <div>
                <p className="font-semibold text-base md:text-lg">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab("pedidos")}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-heading font-bold uppercase hover:bg-muted transition"
                >
                  Ver pedidos
                </button>
                <button
                  onClick={logout}
                  className="rounded-xl bg-accent px-4 py-2.5 text-sm font-heading font-bold uppercase text-accent-foreground hover:opacity-90 transition"
                >
                  Sair da conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1 w-full">
        <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-10 py-6 md:py-8">
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-w-[180px] rounded-2xl border px-4 py-4 text-left transition ${
                  activeTab === tab.id
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <p className="font-heading font-black uppercase text-sm">{tab.label}</p>
                <p className={`mt-1 text-xs ${activeTab === tab.id ? "text-accent-foreground/80" : "text-muted-foreground"}`}>
                  {tab.hint}
                </p>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-border bg-card p-4 md:p-6 lg:p-8 shadow-sm min-h-[560px]">
            {activeTab === "pedidos" && (
              <div>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
                  <div>
                    <h2 className="font-heading font-black text-2xl uppercase">Seus pedidos</h2>
                    <p className="text-sm text-muted-foreground mt-1">Veja tudo o que você já comprou na loja.</p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-secondary/50 px-6 py-16 text-center">
                    <p className="font-heading font-black text-xl uppercase">Nenhum pedido ainda</p>
                    <p className="text-muted-foreground mt-2">Assim que você finalizar uma compra, ela aparece aqui.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-3xl border border-border bg-background p-5 md:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-heading">Pedido</p>
                            <p className="mt-1 text-lg font-heading font-black">{order.id}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="rounded-full border border-border px-3 py-1.5 text-xs uppercase font-heading font-bold">
                            {getStatusLabel(order.status)}
                          </div>
                        </div>

                        <div className="mt-5 grid sm:grid-cols-3 gap-3">
                          <div className="rounded-2xl bg-secondary/60 border border-border p-4">
                            <p className="text-xs uppercase text-muted-foreground font-heading">Itens</p>
                            <p className="mt-2 font-heading font-black text-xl">{order.items}</p>
                          </div>
                          <div className="rounded-2xl bg-secondary/60 border border-border p-4 sm:col-span-2">
                            <p className="text-xs uppercase text-muted-foreground font-heading">Valor total</p>
                            <p className="mt-2 font-heading font-black text-xl">{money(order.total)}</p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-border p-4">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-heading">Endereço de entrega</p>
                          <p className="mt-2 text-sm leading-6 text-foreground">{order.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "enderecos" && (
              <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
                <div>
                  <h2 className="font-heading font-black text-2xl uppercase">Seus endereços</h2>
                  <p className="text-sm text-muted-foreground mt-1 mb-6">Cadastre mais de um endereço para usar no checkout.</p>

                  {addresses.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-secondary/50 px-6 py-14 text-center">
                      <p className="font-heading font-black text-xl uppercase">Nenhum endereço salvo</p>
                      <p className="text-muted-foreground mt-2">Adicione um endereço no formulário ao lado.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="rounded-3xl border border-border bg-background p-5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-heading font-black uppercase text-base">{address.label}</p>
                            <span className="rounded-full bg-secondary px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                              Salvo
                            </span>
                          </div>
                          <div className="mt-4 space-y-1.5 text-sm text-muted-foreground leading-6">
                            <p className="text-foreground font-medium">{address.recipient}</p>
                            <p>{address.street}, {address.number}</p>
                            <p>{address.district}</p>
                            <p>{address.city}/{address.state}</p>
                            <p>CEP {address.zipCode}</p>
                            {address.complement && <p>Compl.: {address.complement}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleAddressSubmit} className="rounded-3xl border border-border bg-background p-5 md:p-6 space-y-4 h-fit sticky top-24">
                  <div>
                    <h3 className="font-heading font-black text-xl uppercase">Adicionar endereço</h3>
                    <p className="text-sm text-muted-foreground mt-1">Preencha os dados para salvar um novo endereço.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      ["label", "Apelido"],
                      ["recipient", "Nome do recebedor"],
                      ["zipCode", "CEP"],
                      ["street", "Rua"],
                      ["number", "Número"],
                      ["district", "Bairro"],
                      ["city", "Cidade"],
                      ["state", "Estado"],
                    ].map(([key, label]) => (
                      <input
                        key={key}
                        placeholder={label}
                        value={(addressForm as Record<string, string>)[key]}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full border border-border rounded-2xl px-4 py-3 text-sm bg-card"
                      />
                    ))}
                  </div>

                  <input
                    placeholder="Complemento"
                    value={addressForm.complement}
                    onChange={(e) => setAddressForm((prev) => ({ ...prev, complement: e.target.value }))}
                    className="w-full border border-border rounded-2xl px-4 py-3 text-sm bg-card"
                  />

                  <button className="w-full rounded-2xl bg-accent text-accent-foreground font-heading font-black text-sm py-3.5 uppercase">
                    Salvar endereço
                  </button>
                </form>
              </div>
            )}

            {activeTab === "rastreio" && (
              <div>
                <h2 className="font-heading font-black text-2xl uppercase">Rastreio dos pedidos</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-6">Aqui aparece o status definido pelo painel administrativo.</p>

                {trackingOrders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-secondary/50 px-6 py-16 text-center">
                    <p className="font-heading font-black text-xl uppercase">Nenhuma atualização ainda</p>
                    <p className="text-muted-foreground mt-2">Quando um pedido for atualizado, o rastreio aparece aqui.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trackingOrders.map((order) => (
                      <div key={order.id} className="rounded-3xl border border-border bg-background p-5 md:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-heading">Pedido</p>
                            <p className="mt-1 text-lg font-heading font-black">{order.id}</p>
                          </div>
                          <div className="rounded-full border border-border px-4 py-2 text-sm font-heading font-bold uppercase w-fit">
                            {getStatusLabel(order.status)}
                          </div>
                        </div>

                        <div className="mt-5 grid md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-border bg-secondary/60 p-4">
                            <p className="text-xs uppercase text-muted-foreground font-heading">Código de rastreio</p>
                            <p className="mt-2 text-base md:text-lg font-heading font-black break-all">
                              {order.trackingCode || "Ainda não informado"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-border bg-secondary/60 p-4">
                            <p className="text-xs uppercase text-muted-foreground font-heading">Entrega</p>
                            <p className="mt-2 text-sm leading-6">{order.address}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "dados" && (
              <div className="grid xl:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
                <div className="rounded-3xl border border-border bg-background p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground font-heading">Perfil</p>
                  <h2 className="mt-2 font-heading font-black text-2xl uppercase">Seus dados</h2>
                  <div className="mt-6 space-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Nome</p>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">E-mail</p>
                      <p className="font-medium break-all">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CPF</p>
                      <p className="font-medium">{user?.cpf || "-"}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="rounded-3xl border border-border bg-background p-6 space-y-4">
                  <div>
                    <h3 className="font-heading font-black text-xl uppercase">Atualizar informações</h3>
                    <p className="text-sm text-muted-foreground mt-1">Edite seus dados cadastrais quando precisar.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-heading uppercase mb-2">Nome completo</label>
                    <input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-border rounded-2xl px-4 py-3 text-sm bg-card"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-heading uppercase mb-2">CPF</label>
                    <input
                      value={profileForm.cpf}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, cpf: e.target.value }))}
                      className="w-full border border-border rounded-2xl px-4 py-3 text-sm bg-card"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-heading uppercase mb-2">E-mail</label>
                    <input value={user?.email || ""} disabled className="w-full border border-border rounded-2xl px-4 py-3 text-sm bg-muted" />
                  </div>
                  <button className="rounded-2xl bg-accent text-accent-foreground font-heading font-black text-sm px-6 py-3.5 uppercase">
                    Salvar dados
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MinhaConta;
