import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Trash2, MapPin, CreditCard, PlusCircle, ShieldCheck, Truck, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth, type Address } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { createInfinitePayCheckout, infinitePayHandle } from "@/lib/infinitepay";
import { savePendingCheckout } from "@/lib/order-storage";

type Client = {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  addresses?: Address[];
};

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const emptyAddressForm = {
  label: "",
  recipient: "",
  zipCode: "",
  street: "",
  number: "",
  district: "",
  city: "",
  state: "",
  complement: "",
};

const Carrinho = () => {
  const { items, removeFromCart, updateQty } = useCart();
  const { isLoggedIn, user, addAddress } = useAuth();
  const currentUser = readJson<Client[]>("af_clients", []).find((item) => item.id === user?.id);
  const addresses = currentUser?.addresses || user?.addresses || [];
  const [addressMode, setAddressMode] = useState<"saved" | "new">(addresses.length ? "saved" : "new");
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || "");
  const [submitting, setSubmitting] = useState(false);
  const [addressForm, setAddressForm] = useState({ ...emptyAddressForm, recipient: user?.name || "" });

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * item.qty, 0), [items]);
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-secondary/40">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Faça login para acessar seu checkout</p>
          <Link to="/login" className="bg-accent text-accent-foreground font-heading font-bold text-sm px-6 py-2.5 rounded uppercase">
            Fazer Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const resolveAddress = async () => {
    if (addressMode === "saved") {
      const address = addresses.find((item) => item.id === selectedAddressId) || addresses[0];
      if (!address) {
        toast.error("Escolha um endereço salvo ou cadastre um novo.");
        return null;
      }
      return address;
    }

    const required = [addressForm.label, addressForm.recipient, addressForm.zipCode, addressForm.street, addressForm.number, addressForm.district, addressForm.city, addressForm.state];
    if (required.some((field) => !field.trim())) {
      toast.error("Preencha todos os campos obrigatórios do novo endereço.");
      return null;
    }

    const result = addAddress({
      label: addressForm.label.trim(),
      recipient: addressForm.recipient.trim(),
      zipCode: addressForm.zipCode.trim(),
      street: addressForm.street.trim(),
      number: addressForm.number.trim(),
      district: addressForm.district.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      complement: addressForm.complement.trim(),
    });

    if (!result.ok || !result.address) {
      toast.error(result.message || "Não foi possível salvar o endereço.");
      return null;
    }

    setSelectedAddressId(result.address.id);
    setAddressMode("saved");
    return result.address;
  };

  const finalizeOrder = async () => {
    if (!currentUser) {
      toast.error("Usuário não encontrado.");
      return;
    }
    if (!items.length) {
      toast.error("Seu carrinho está vazio.");
      return;
    }

    const address = await resolveAddress();
    if (!address) return;

    const orderId = `PED-${Date.now()}`;
    const pendingOrder = {
      id: orderId,
      customerId: currentUser.id,
      clientName: currentUser.name,
      clientEmail: currentUser.email,
      cpf: currentUser.cpf,
      address: `${address.street}, ${address.number} - ${address.district} - ${address.city}/${address.state}`,
      addressData: address,
      status: "Em preparo",
      trackingCode: "",
      items: totalItems,
      total,
      createdAt: new Date().toISOString(),
      paymentMethod: "InfinitePay",
      paymentStatus: "Aguardando pagamento",
      lineItems: items,
    };

    try {
      setSubmitting(true);
      savePendingCheckout(pendingOrder);
      const payloadItems = items.map((item) => ({
        quantity: item.qty,
        price: Math.round(Number(item.unitPrice || 0) * 100),
        description: item.priceType === "revenda"
          ? `${item.name} • Kit revenda 10 pares • ${item.selectedSizes?.join(", ")} • ${item.color}`
          : `${item.name} • Tam ${item.size} • Cor ${item.color} • Preço normal`,
      }));

      const redirectUrl = `${window.location.origin}/checkout/retorno`;
      const response = await createInfinitePayCheckout({
        orderNsu: orderId,
        redirectUrl,
        items: payloadItems,
        customer: { name: currentUser.name, email: currentUser.email },
        address: {
          cep: address.zipCode.replace(/\D/g, ""),
          street: address.street,
          neighborhood: address.district,
          number: address.number,
          complement: address.complement,
        },
      });

      if (!response.url) throw new Error("A InfinitePay não retornou o link do checkout.");
      window.location.href = response.url;
    } catch (error) {
      setSubmitting(false);
      toast.error(error instanceof Error ? error.message : "Não foi possível iniciar o checkout.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/40">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border bg-background">
          <div className="container-shop py-8 md:py-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground font-heading">Checkout</p>
                <h1 className="mt-3 font-heading font-black text-3xl md:text-4xl uppercase leading-tight">Finalizar pedido</h1>
                <p className="mt-3 text-sm md:text-base text-muted-foreground">Revise seus itens, escolha o endereço de entrega e conclua o pagamento com segurança pela InfinitePay.</p>
              </div>
              <div className="rounded-[28px] border border-border bg-card px-5 py-4 shadow-sm min-w-[280px]">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-heading">Resumo</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Itens no carrinho</span>
                  <span className="font-heading font-black text-base">{totalItems}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pagamento</span>
                  <span className="font-semibold text-foreground">InfinitePay</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm uppercase tracking-[0.18em] text-muted-foreground font-heading">Total</span>
                  <span className="font-heading font-black text-2xl text-accent">{money(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container-shop py-8 md:py-10">
          {items.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-border bg-card px-6 py-16 text-center">
              <p className="font-heading font-black text-2xl uppercase">Seu carrinho está vazio</p>
              <p className="text-muted-foreground mt-2">Adicione produtos ao carrinho para continuar.</p>
              <Link to="/produtos" className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3 text-sm font-heading font-bold uppercase text-primary-foreground">
                Ver produtos
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="space-y-6">
                <div className="rounded-[32px] border border-border bg-card p-5 md:p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <div>
                      <h2 className="font-heading font-black text-xl uppercase">Seus produtos</h2>
                      <p className="text-sm text-muted-foreground">Confira tamanhos, cores e tipo de preço antes de pagar.</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {items.map((item, i) => (
                      <div key={`${item.productId}-${item.size}-${item.color}-${i}`} className="rounded-[28px] border border-border bg-background p-4 md:p-5">
                        <div className="flex gap-4">
                          <img src={item.image} alt={item.name} className="h-24 w-24 rounded-2xl object-cover bg-muted" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-heading font-black text-base leading-6">{item.name}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em]">
                                  <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground">{item.priceType === "normal" ? "Preço normal" : "Preço revenda"}</span>
                                  <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground">Cor {item.color}</span>
                                  {item.priceType === "normal" ? (
                                    <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground">Tam {item.size}</span>
                                  ) : (
                                    <span className="rounded-full bg-accent/10 px-3 py-1 text-accent">Kit 10 pares</span>
                                  )}
                                </div>
                              </div>
                              <button onClick={() => removeFromCart(item.productId, item.size, item.color)} className="text-muted-foreground hover:text-destructive transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {item.priceType === "revenda" && item.selectedSizes?.length ? (
                              <div className="mt-4 rounded-2xl border border-border bg-secondary/60 p-4">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Tamanhos escolhidos no kit</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {item.selectedSizes.map((size, idx) => (
                                    <span key={`${size}-${idx}`} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">Par {idx + 1}: {size}</span>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              {item.priceType === "normal" ? (
                                <div className="flex items-center border border-border rounded-2xl bg-card">
                                  <button onClick={() => updateQty(item.productId, item.size, item.color, Math.max(1, item.qty - 1))} className="px-3 py-2 hover:bg-muted text-sm">-</button>
                                  <span className="px-4 text-sm font-semibold">{item.qty}</span>
                                  <button onClick={() => updateQty(item.productId, item.size, item.color, item.qty + 1)} className="px-3 py-2 hover:bg-muted text-sm">+</button>
                                </div>
                              ) : (
                                <div className="rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm font-medium text-accent">1 kit revenda = 10 pares</div>
                              )}
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">Subtotal</p>
                                <p className="mt-1 text-lg font-heading font-black">{money(Number(item.unitPrice || 0) * item.qty)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-border bg-card p-5 md:p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <div>
                      <h2 className="font-heading font-black text-xl uppercase">Endereço de entrega</h2>
                      <p className="text-sm text-muted-foreground">Escolha um endereço salvo ou cadastre um novo neste checkout.</p>
                    </div>
                  </div>

                  <div className="mt-5 grid md:grid-cols-2 gap-3">
                    <button onClick={() => setAddressMode("saved")} className={`rounded-[24px] border p-4 text-left transition ${addressMode === "saved" ? "border-accent bg-accent/5" : "border-border hover:border-accent"}`}>
                      <p className="font-heading font-black uppercase text-sm">Usar endereço salvo</p>
                      <p className="text-xs text-muted-foreground mt-1">Escolha entre os endereços já cadastrados.</p>
                    </button>
                    <button onClick={() => setAddressMode("new")} className={`rounded-[24px] border p-4 text-left transition ${addressMode === "new" ? "border-accent bg-accent/5" : "border-border hover:border-accent"}`}>
                      <p className="font-heading font-black uppercase text-sm">Adicionar novo endereço</p>
                      <p className="text-xs text-muted-foreground mt-1">Salva o endereço e já usa neste pedido.</p>
                    </button>
                  </div>

                  <div className="mt-5">
                    {addressMode === "saved" ? (
                      <div className="space-y-3">
                        {addresses.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">Você ainda não tem endereço salvo. Cadastre um novo endereço para continuar.</div>
                        ) : (
                          addresses.map((address) => (
                            <button key={address.id} onClick={() => setSelectedAddressId(address.id)} className={`w-full rounded-[24px] border p-4 text-left transition ${selectedAddressId === address.id ? "border-accent bg-accent/5" : "border-border hover:border-accent"}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-heading font-black uppercase text-sm">{address.label}</p>
                                  <p className="mt-2 text-sm text-muted-foreground leading-6">{address.recipient}<br />{address.street}, {address.number} - {address.district} - {address.city}/{address.state}<br />CEP {address.zipCode}</p>
                                </div>
                                {selectedAddressId === address.id ? <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-heading font-bold uppercase text-accent-foreground">Selecionado</span> : null}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {([
                          ["label", "Apelido do endereço"],
                          ["recipient", "Nome do recebedor"],
                          ["zipCode", "CEP"],
                          ["street", "Rua"],
                          ["number", "Número"],
                          ["district", "Bairro"],
                          ["city", "Cidade"],
                          ["state", "Estado"],
                        ] as const).map(([key, label]) => (
                          <label key={key} className="block text-sm">
                            <span className="mb-1.5 block text-xs uppercase font-heading font-bold text-muted-foreground">{label}</span>
                            <input value={addressForm[key]} onChange={(e) => setAddressForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-accent" />
                          </label>
                        ))}
                        <label className="block text-sm md:col-span-2">
                          <span className="mb-1.5 block text-xs uppercase font-heading font-bold text-muted-foreground">Complemento</span>
                          <input value={addressForm.complement} onChange={(e) => setAddressForm((current) => ({ ...current, complement: e.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-accent" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <aside className="xl:sticky xl:top-24 h-fit space-y-6">
                <div className="rounded-[32px] border border-border bg-card p-5 md:p-6 shadow-sm overflow-hidden relative">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <h2 className="font-heading font-black text-xl uppercase">Resumo do pagamento</h2>
                      <p className="text-sm text-muted-foreground">Pagamento somente pela InfinitePay.</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-border bg-background p-4 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 mt-0.5" />
                      <div>
                        <p className="font-heading font-black uppercase text-sm">Pagamento protegido</p>
                        <p className="mt-1 text-sm text-muted-foreground">Você será redirecionado para o checkout seguro da InfinitePay.</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-background p-4 flex items-start gap-3">
                      <Truck className="w-5 h-5 mt-0.5" />
                      <div>
                        <p className="font-heading font-black uppercase text-sm">Pedido automático</p>
                        <p className="mt-1 text-sm text-muted-foreground">Após o pagamento confirmado, o pedido aparece no painel admin e na sua área do cliente.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-accent/20 bg-accent/5 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Itens no carrinho</span>
                      <span className="font-semibold">{totalItems}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Kits revenda</span>
                      <span className="font-semibold">{resaleKits}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Forma de pagamento</span>
                      <span className="font-semibold">InfinitePay ({infinitePayHandle})</span>
                    </div>
                    <div className="mt-4 border-t border-border pt-4 flex items-center justify-between">
                      <span className="font-heading font-black uppercase">Total</span>
                      <span className="font-heading font-black text-2xl">{money(total)}</span>
                    </div>
                  </div>

                  <button onClick={finalizeOrder} disabled={submitting} className="mt-5 w-full rounded-[24px] bg-accent px-6 py-4 text-sm font-heading font-black uppercase tracking-[0.2em] text-accent-foreground disabled:opacity-60">
                    {submitting ? "Abrindo InfinitePay..." : "Pagar com InfinitePay"}
                  </button>

                  <Link to="/minha-conta" className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent">
                    <PlusCircle className="w-4 h-4" /> Gerenciar endereços em Minha Conta
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Carrinho;
