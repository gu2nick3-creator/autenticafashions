import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Camera,
  DollarSign,
  LayoutGrid,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api, type Category, type Coupon, type Order, type Product, type User } from "@/lib/api";

type Tab = "faturamento" | "produtos" | "categorias" | "clientes" | "cupons" | "pedidos";
type ProductType = "roupas" | "sapatos";
type ColorRow = { id: string; name: string; hex: string };
type TabConfig = { id: Tab; label: string; icon: ReactNode };
type ProductFormState = {
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  productType: ProductType;
  clothingSizes: string[];
  shoeSizes: string;
  colors: ColorRow[];
  normalPrice: string;
  resalePrice: string;
};
type CouponFormState = {
  code: string;
  discountValue: string;
  durationDays: string;
  usageLimit: string;
};
type OrderDrafts = Record<string, { status: string; trackingCode: string }>;

const tabs: ReadonlyArray<TabConfig> = [
  { id: "faturamento", label: "Faturamento", icon: <DollarSign className="h-4 w-4" /> },
  { id: "produtos", label: "Produtos", icon: <Package className="h-4 w-4" /> },
  { id: "categorias", label: "Categorias", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "clientes", label: "Clientes", icon: <Users className="h-4 w-4" /> },
  { id: "cupons", label: "Cupons", icon: <Tag className="h-4 w-4" /> },
  { id: "pedidos", label: "Pedidos", icon: <ShoppingCart className="h-4 w-4" /> },
] as const;

const clothingSizeOptions = ["PP", "P", "M", "G", "GG", "XG", "XGG"];
const orderStatusOptions = ["Em preparo", "Enviado", "Saiu para entrega", "Entregue", "Cancelado"];

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const createInitialProductForm = (): ProductFormState => ({
  sku: "",
  name: "",
  description: "",
  categoryId: "",
  productType: "sapatos",
  clothingSizes: [],
  shoeSizes: "34,35,36,37,38",
  colors: [{ id: crypto.randomUUID(), name: "Preto", hex: "#111111" }],
  normalPrice: "",
  resalePrice: "",
});

const createInitialCouponForm = (): CouponFormState => ({
  code: "",
  discountValue: "",
  durationDays: "30",
  usageLimit: "100",
});

const Admin = () => {
  const { user, isLoggedIn } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<Tab>("faturamento");
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productForm, setProductForm] = useState<ProductFormState>(createInitialProductForm());
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState("");
  const [couponForm, setCouponForm] = useState<CouponFormState>(createInitialCouponForm());
  const [orderDrafts, setOrderDrafts] = useState<OrderDrafts>({});

  const loadAll = async () => {
    try {
      const [sum, prods, cats, cli, cps, ord] = await Promise.all([
        api.adminDashboard(),
        api.adminProducts(),
        api.adminCategories(),
        api.adminClients(),
        api.adminCoupons(),
        api.adminOrders(),
      ]);

      setSummary(sum.summary || {});
      setProducts(Array.isArray(prods.products) ? prods.products : []);
      setCategories(Array.isArray(cats.categories) ? cats.categories : []);
      setClients(Array.isArray(cli.clients) ? cli.clients : []);
      setCoupons(Array.isArray(cps.coupons) ? cps.coupons : []);
      setOrders(Array.isArray(ord.orders) ? ord.orders : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao carregar painel.");
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    const nextDrafts = orders.reduce<OrderDrafts>((acc, order) => {
      acc[order.id] = {
        status: order.status || "Em preparo",
        trackingCode: order.trackingCode || "",
      };
      return acc;
    }, {});
    setOrderDrafts(nextDrafts);
  }, [orders]);

  const faturamento = useMemo(() => orders.reduce((acc, order) => acc + order.total, 0), [orders]);
  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => {
      const haystack = [product.name, product.sku, product.category, product.subcategory].join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [products, productSearch]);

  if (!isLoggedIn || !user?.isAdmin) {
    return <Navigate to="/login" />;
  }

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setProductForm(createInitialProductForm());
    setUploadedImageUrls([]);
  };

  const handleToggleClothingSize = (size: string) => {
    setProductForm((current) => ({
      ...current,
      clothingSizes: current.clothingSizes.includes(size)
        ? current.clothingSizes.filter((item) => item !== size)
        : [...current.clothingSizes, size],
    }));
  };

  const handleColorChange = (id: string, field: "name" | "hex", value: string) => {
    setProductForm((current) => ({
      ...current,
      colors: current.colors.map((color) => (color.id === id ? { ...color, [field]: value } : color)),
    }));
  };

  const addColorRow = () => {
    setProductForm((current) => ({
      ...current,
      colors: [...current.colors, { id: crypto.randomUUID(), name: "", hex: "#cccccc" }],
    }));
  };

  const removeColorRow = (id: string) => {
    setProductForm((current) => ({
      ...current,
      colors: current.colors.length === 1 ? current.colors : current.colors.filter((color) => color.id !== id),
    }));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setUploadingImages(true);
      const response = await api.uploadImages(Array.from(files));
      const urls = Array.isArray(response.files) ? response.files.map((file) => file.url).filter(Boolean) : [];
      setUploadedImageUrls((current) => [...current, ...urls]);
      toast.success(urls.length > 1 ? "Imagens enviadas." : "Imagem enviada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar imagem.");
    } finally {
      setUploadingImages(false);
    }
  };

  const saveProduct = async () => {
    const parsedNormalPrice = Number(productForm.normalPrice.replace(",", "."));
    const parsedResalePrice = Number(productForm.resalePrice.replace(",", "."));
    const sizes =
      productForm.productType === "roupas"
        ? productForm.clothingSizes
        : productForm.shoeSizes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

    if (!productForm.sku || !productForm.name || !productForm.categoryId) {
      toast.error("Preencha SKU, nome e categoria.");
      return;
    }

    if (sizes.length === 0) {
      toast.error("Selecione ao menos um tamanho.");
      return;
    }

    if (uploadedImageUrls.length === 0) {
      toast.error("Adicione pelo menos uma imagem do produto.");
      return;
    }

    try {
      setIsSavingProduct(true);
      await api.saveAdminProduct({
        sku: productForm.sku,
        name: productForm.name,
        description: productForm.description,
        categoryId: productForm.categoryId,
        productType: productForm.productType,
        sizes,
        colors: productForm.colors
          .filter((color) => color.name.trim())
          .map((color) => ({ name: color.name.trim(), hex: color.hex || "#cccccc" })),
        images: uploadedImageUrls,
        normalPrice: Number.isFinite(parsedNormalPrice) ? parsedNormalPrice : 0,
        resalePrice: Number.isFinite(parsedResalePrice) ? parsedResalePrice : 0,
        status: true,
      });
      toast.success("Produto salvo com sucesso.");
      closeProductModal();
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar produto.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Digite o nome da categoria.");
      return;
    }
    try {
      await api.createCategory({ name: categoryName.trim() });
      toast.success("Categoria criada.");
      setCategoryName("");
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar categoria.");
    }
  };

  const handleCreateSubcategory = async () => {
    if (!subcategoryCategoryId || !subcategoryName.trim()) {
      toast.error("Selecione a categoria e informe a subcategoria.");
      return;
    }
    try {
      await api.createSubcategory({ categoryId: subcategoryCategoryId, name: subcategoryName.trim() });
      toast.success("Subcategoria criada.");
      setSubcategoryCategoryId("");
      setSubcategoryName("");
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao criar subcategoria.");
    }
  };

  const handleSaveCoupon = async () => {
    if (!couponForm.code.trim() || !couponForm.discountValue.trim()) {
      toast.error("Preencha código e desconto.");
      return;
    }
    const durationDays = Number(couponForm.durationDays || 0);
    const expiresAt = durationDays > 0 ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString() : null;

    try {
      await api.saveAdminCoupon({
        code: couponForm.code.trim().toUpperCase(),
        discountType: "percent",
        discountValue: Number(couponForm.discountValue),
        expiresAt,
        usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null,
        isActive: true,
      });
      toast.success("Cupom salvo.");
      setCouponForm(createInitialCouponForm());
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao salvar cupom.");
    }
  };

  const handleSaveOrder = async (id: string) => {
    const draft = orderDrafts[id];
    if (!draft) return;
    try {
      await api.updateAdminOrder(id, {
        status: draft.status,
        trackingCode: draft.trackingCode.trim() || null,
      });
      toast.success("Pedido atualizado.");
      await loadAll();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao atualizar pedido.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1ee] px-4 py-5 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_25px_60px_-35px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 border-b border-black/5 bg-[linear-gradient(135deg,#ffffff_0%,#f3ede7_100%)] px-5 py-6 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex rounded-full border border-[#c9baa9] bg-[#f8f3ee] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7e6652]">
                  Painel admin fashion
                </span>
                <h1 className="mt-3 font-heading text-3xl font-black uppercase tracking-tight text-[#1f1a17] md:text-4xl">
                  Gestão completa da loja
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[#6c6259] md:text-base">
                  Controle produtos, categorias, clientes, cupons e pedidos em uma operação 100% conectada à API e ao banco.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MetricCard label="Faturamento" value={money(faturamento)} />
                <MetricCard label="Produtos" value={String(summary.products || products.length)} />
                <MetricCard label="Clientes" value={String(summary.clients || clients.length)} />
                <MetricCard label="Pedidos" value={String(summary.orders || orders.length)} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-heading font-bold uppercase transition ${
                    activeTab === tab.id
                      ? "bg-[#6f6257] text-white shadow-lg"
                      : "border border-[#e8ddd2] bg-white text-[#312923] hover:border-[#c9baa9]"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 md:p-8">
            {activeTab === "faturamento" && (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <Panel title="Visão financeira" description="Acompanhe o total vendido e o desempenho dos pedidos.">
                  <div className="grid gap-4 md:grid-cols-3">
                    <StatBox label="Total faturado" value={money(faturamento)} />
                    <StatBox label="Ticket médio" value={money(orders.length ? faturamento / orders.length : 0)} />
                    <StatBox label="Pedidos ativos" value={String(orders.filter((order) => order.status !== "Cancelado").length)} />
                  </div>
                  <div className="mt-6 space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="rounded-2xl border border-[#ede4dc] bg-[#faf7f4] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-heading text-lg font-black uppercase text-[#201915]">{order.orderNumber || order.id}</p>
                            <p className="text-sm text-[#756a62]">{order.clientName || "Cliente"} • {order.paymentStatus || "Pagamento pendente"}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-[#6f6257]">{order.status}</span>
                        </div>
                        <p className="mt-3 text-sm text-[#4f463f]">{money(order.total)}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
                <Panel title="Resumo rápido" description="Dados principais do painel em tempo real.">
                  <div className="space-y-3">
                    <SummaryRow label="Cupons ativos" value={String(coupons.filter((coupon) => coupon.isActive !== false).length)} />
                    <SummaryRow label="Categorias" value={String(categories.length)} />
                    <SummaryRow label="Produtos em catálogo" value={String(products.length)} />
                    <SummaryRow label="Clientes cadastrados" value={String(clients.length)} />
                  </div>
                </Panel>
              </div>
            )}

            {activeTab === "produtos" && (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-heading text-2xl font-black uppercase text-[#1f1a17]">Produtos</h2>
                    <p className="text-sm text-[#72675e]">Cadastre produtos com imagens, cores, tamanhos e preços de revenda.</p>
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="flex items-center gap-2 rounded-2xl border border-[#e9ddd2] bg-[#faf8f6] px-3 py-2">
                      <Search className="h-4 w-4 text-[#7a6d62]" />
                      <input
                        value={productSearch}
                        onChange={(event) => setProductSearch(event.target.value)}
                        placeholder="Buscar por SKU, nome ou categoria"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-[#9b8f85] md:w-72"
                      />
                    </div>
                    <button
                      onClick={() => setIsProductModalOpen(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6f6257] px-5 py-3 text-sm font-heading font-bold uppercase text-white shadow-lg transition hover:opacity-95"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar produto
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="rounded-[26px] border border-[#ece2d7] bg-[#fffdfb] p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-heading text-xl font-black uppercase text-[#1f1a17]">{product.name}</p>
                          <p className="mt-1 text-sm text-[#776c64]">
                            SKU {product.sku || "—"} • {product.category}
                          </p>
                        </div>
                        <button
                          onClick={() => void api.deleteAdminProduct(product.id).then(loadAll)}
                          className="rounded-full border border-[#eadfd5] p-2 text-[#5c5149] transition hover:bg-[#f5efea]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr]">
                        <div className="overflow-hidden rounded-2xl bg-[#f6f0eb]">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full min-h-[120px] items-center justify-center text-xs uppercase text-[#8a7f76]">Sem imagem</div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {(product.colors || []).map((color) => (
                              <span key={`${product.id}-${color.name}`} className="inline-flex items-center gap-2 rounded-full bg-[#f7f2ed] px-3 py-1 text-xs font-medium text-[#4c433d]">
                                <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                                {color.name}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-[#6c6259]">Tamanhos: {(product.sizes || []).join(", ") || "Não informado"}</p>
                          <div className="flex flex-wrap gap-3 text-sm font-semibold text-[#2d2520]">
                            <span>Normal {money(product.normalPrice)}</span>
                            <span>Revenda {money(product.resalePrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "categorias" && (
              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <Panel title="Criar categorias" description="Adicione categorias e subcategorias para organizar o catálogo.">
                  <div className="space-y-4">
                    <Field label="Nova categoria">
                      <input
                        value={categoryName}
                        onChange={(event) => setCategoryName(event.target.value)}
                        placeholder="Ex.: Sandálias Premium"
                        className="admin-input"
                      />
                    </Field>
                    <button onClick={() => void handleCreateCategory()} className="admin-primary-button">Criar categoria</button>

                    <div className="h-px bg-[#ece2d9]" />

                    <Field label="Categoria para subcategoria">
                      <select value={subcategoryCategoryId} onChange={(event) => setSubcategoryCategoryId(event.target.value)} className="admin-input">
                        <option value="">Selecione uma categoria</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Nova subcategoria">
                      <input
                        value={subcategoryName}
                        onChange={(event) => setSubcategoryName(event.target.value)}
                        placeholder="Ex.: Anabela"
                        className="admin-input"
                      />
                    </Field>
                    <button onClick={() => void handleCreateSubcategory()} className="admin-secondary-button">Criar subcategoria</button>
                  </div>
                </Panel>

                <Panel title="Estrutura do catálogo" description="Gerencie e exclua categorias e subcategorias.">
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div key={category.id} className="rounded-[26px] border border-[#ede3db] bg-[#fcfaf8] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-heading text-xl font-black uppercase text-[#1f1a17]">{category.name}</p>
                            <p className="text-sm text-[#756a62]">/{category.slug}</p>
                          </div>
                          <button
                            onClick={() => void api.deleteCategory(category.id).then(loadAll)}
                            className="rounded-full border border-[#eadfd5] p-2 text-[#5c5149] transition hover:bg-[#f5efea]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(category.subcategories || []).map((subcategory) => (
                            <span key={subcategory.id} className="inline-flex items-center gap-2 rounded-full border border-[#eadfd5] bg-white px-3 py-2 text-xs font-medium text-[#4b433e]">
                              {subcategory.name}
                              <button onClick={() => void api.deleteSubcategory(subcategory.id).then(loadAll)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            )}

            {activeTab === "clientes" && (
              <Panel title="Clientes cadastrados" description="Todos os logins e contas criadas aparecem nesta aba.">
                <div className="grid gap-4 lg:grid-cols-2">
                  {clients.map((client) => (
                    <div key={client.id} className="rounded-[24px] border border-[#ece2d7] bg-[#fffdfa] p-5">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-[#f5eee8] p-3 text-[#6f6257]">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-heading text-lg font-black uppercase text-[#1f1a17]">{client.name}</p>
                          <p className="text-sm text-[#70665d]">{client.email}</p>
                          {client.cpf ? <p className="mt-1 text-sm text-[#8a7c72]">CPF {client.cpf}</p> : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {activeTab === "cupons" && (
              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <Panel title="Criar cupom" description="Defina desconto, duração e limite de uso.">
                  <div className="space-y-4">
                    <Field label="Código do cupom">
                      <input value={couponForm.code} onChange={(event) => setCouponForm((current) => ({ ...current, code: event.target.value }))} placeholder="Ex.: VIP15" className="admin-input" />
                    </Field>
                    <Field label="Desconto (%)">
                      <input value={couponForm.discountValue} onChange={(event) => setCouponForm((current) => ({ ...current, discountValue: event.target.value }))} placeholder="15" className="admin-input" />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Duração (dias)">
                        <input value={couponForm.durationDays} onChange={(event) => setCouponForm((current) => ({ ...current, durationDays: event.target.value }))} placeholder="30" className="admin-input" />
                      </Field>
                      <Field label="Limite de uso">
                        <input value={couponForm.usageLimit} onChange={(event) => setCouponForm((current) => ({ ...current, usageLimit: event.target.value }))} placeholder="100" className="admin-input" />
                      </Field>
                    </div>
                    <button onClick={() => void handleSaveCoupon()} className="admin-primary-button">Salvar cupom</button>
                  </div>
                </Panel>

                <Panel title="Cupons cadastrados" description="Veja utilização e remova cupons quando precisar.">
                  <div className="space-y-4">
                    {coupons.map((coupon) => (
                      <div key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#ece3db] bg-[#fffdfa] p-5">
                        <div>
                          <p className="font-heading text-xl font-black uppercase text-[#1f1a17]">{coupon.code}</p>
                          <p className="text-sm text-[#71665e]">
                            {coupon.discountValue}% • limite {coupon.usageLimit ?? "ilimitado"} • usado {coupon.usedCount || 0}x
                          </p>
                        </div>
                        <button onClick={() => void api.deleteAdminCoupon(coupon.id).then(loadAll)} className="rounded-full border border-[#eadfd5] p-2 text-[#5c5149] transition hover:bg-[#f5efea]">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            )}

            {activeTab === "pedidos" && (
              <Panel title="Pedidos" description="Gerencie status, rastreio e acompanhe as informações de cada compra.">
                <div className="space-y-4">
                  {orders.map((order) => {
                    const draft = orderDrafts[order.id] || { status: order.status || "Em preparo", trackingCode: order.trackingCode || "" };
                    return (
                      <div key={order.id} className="rounded-[26px] border border-[#ece2d7] bg-[#fffdfa] p-5">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-3">
                            <div>
                              <p className="font-heading text-xl font-black uppercase text-[#1f1a17]">{order.orderNumber || order.id}</p>
                              <p className="text-sm text-[#71665d]">{order.clientName || "Cliente"} • {order.clientEmail || "Sem e-mail"}</p>
                            </div>
                            <div className="grid gap-2 text-sm text-[#544b45]">
                              <p><strong>Endereço:</strong> {order.address}</p>
                              <p><strong>Total:</strong> {money(order.total)}</p>
                              <p><strong>Pagamento:</strong> {order.paymentMethod || "A definir"} • {order.paymentStatus || "Pendente"}</p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7268]">Status do pedido</label>
                              <select
                                value={draft.status}
                                onChange={(event) =>
                                  setOrderDrafts((current) => ({
                                    ...current,
                                    [order.id]: { ...draft, status: event.target.value },
                                  }))
                                }
                                className="admin-input"
                              >
                                {orderStatusOptions.map((status) => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7268]">Código de rastreio</label>
                              <input
                                value={draft.trackingCode}
                                onChange={(event) =>
                                  setOrderDrafts((current) => ({
                                    ...current,
                                    [order.id]: { ...draft, trackingCode: event.target.value },
                                  }))
                                }
                                placeholder="Ex.: BR123456789"
                                className="admin-input"
                              />
                            </div>
                            <button onClick={() => void handleSaveOrder(order.id)} className="admin-primary-button sm:col-span-2">
                              <Truck className="h-4 w-4" />
                              Salvar status e rastreio
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}
          </div>
        </section>
      </div>

      {isProductModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#ede3d9] bg-white/95 px-5 py-5 backdrop-blur md:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8a7869]">Adicionar produto</p>
                <h3 className="mt-2 font-heading text-3xl font-black uppercase text-[#1f1a17]">Novo produto fashion</h3>
                <p className="mt-2 text-sm text-[#71665e]">Cadastre o produto com fotos, categoria, tipo, tamanhos, cores e preços.</p>
              </div>
              <button onClick={closeProductModal} className="rounded-full border border-[#eadfd5] p-2 text-[#5e534b]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-8 px-5 py-6 md:grid-cols-[1.1fr_0.9fr] md:px-8">
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="SKU">
                    <input value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} placeholder="Ex.: SAND-001" className="admin-input" />
                  </Field>
                  <Field label="Categoria">
                    <select value={productForm.categoryId} onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))} className="admin-input">
                      <option value="">Selecione a categoria</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Nome do produto">
                  <input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do produto" className="admin-input" />
                </Field>

                <Field label="Descrição">
                  <textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} placeholder="Descreva o produto" className="admin-textarea" />
                </Field>

                <Field label="Tipo do produto">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["sapatos", "roupas"] as ProductType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProductForm((current) => ({ ...current, productType: type, clothingSizes: type === "sapatos" ? [] : current.clothingSizes }))}
                        className={`rounded-2xl border px-4 py-3 text-sm font-heading font-bold uppercase transition ${
                          productForm.productType === type
                            ? "border-[#6f6257] bg-[#6f6257] text-white"
                            : "border-[#e8ddd2] bg-[#faf7f4] text-[#473d37]"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </Field>

                {productForm.productType === "roupas" ? (
                  <Field label="Tamanhos disponíveis">
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {clothingSizeOptions.map((size) => {
                        const active = productForm.clothingSizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleToggleClothingSize(size)}
                            className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                              active ? "border-[#6f6257] bg-[#6f6257] text-white" : "border-[#eadfd5] bg-[#faf7f4] text-[#473d37]"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                ) : (
                  <Field label="Tamanhos disponíveis">
                    <input value={productForm.shoeSizes} onChange={(event) => setProductForm((current) => ({ ...current, shoeSizes: event.target.value }))} placeholder="34,35,36,37,38" className="admin-input" />
                  </Field>
                )}

                <Field label="Cores disponíveis">
                  <div className="space-y-3 rounded-[26px] border border-[#ece2d9] bg-[#faf7f4] p-4">
                    {productForm.colors.map((color) => (
                      <div key={color.id} className="grid gap-3 sm:grid-cols-[1fr_120px_auto]">
                        <input value={color.name} onChange={(event) => handleColorChange(color.id, "name", event.target.value)} placeholder="Nome da cor" className="admin-input" />
                        <input value={color.hex} onChange={(event) => handleColorChange(color.id, "hex", event.target.value)} type="color" className="h-[52px] w-full rounded-2xl border border-[#e7dbd0] bg-white p-2" />
                        <button type="button" onClick={() => removeColorRow(color.id)} className="rounded-2xl border border-[#eadfd5] px-4 py-3 text-sm font-semibold text-[#534842]">
                          Remover
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addColorRow} className="admin-secondary-button">
                      <Plus className="h-4 w-4" />
                      Adicionar cor
                    </button>
                  </div>
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Preço normal">
                    <input value={productForm.normalPrice} onChange={(event) => setProductForm((current) => ({ ...current, normalPrice: event.target.value }))} placeholder="199.90" className="admin-input" />
                  </Field>
                  <Field label="Preço revenda">
                    <input value={productForm.resalePrice} onChange={(event) => setProductForm((current) => ({ ...current, resalePrice: event.target.value }))} placeholder="139.90" className="admin-input" />
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <Panel title="Imagens do produto" description="Envie arquivos da galeria e, no celular, fotografe na hora.">
                  <div className="space-y-4">
                    <label className="block rounded-[26px] border border-dashed border-[#d9caba] bg-[#faf7f4] p-5 text-center">
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(event) => void handleImageUpload(event.target.files)} />
                      <Package className="mx-auto h-7 w-7 text-[#6f6257]" />
                      <p className="mt-3 font-heading text-sm font-bold uppercase text-[#1f1a17]">Selecionar imagens da galeria</p>
                      <p className="mt-1 text-sm text-[#756a62]">Escolha uma ou mais fotos do produto</p>
                    </label>

                    {isMobile ? (
                      <label className="block rounded-[26px] border border-dashed border-[#d9caba] bg-white p-5 text-center">
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => void handleImageUpload(event.target.files)} />
                        <Camera className="mx-auto h-7 w-7 text-[#6f6257]" />
                        <p className="mt-3 font-heading text-sm font-bold uppercase text-[#1f1a17]">Tirar foto agora</p>
                        <p className="mt-1 text-sm text-[#756a62]">Disponível somente na versão mobile</p>
                      </label>
                    ) : null}

                    {uploadingImages ? <p className="text-sm text-[#7a6d62]">Enviando imagens...</p> : null}
                  </div>
                </Panel>

                <Panel title="Pré-visualização" description="Confira as fotos que já foram enviadas para o produto.">
                  <div className="grid grid-cols-2 gap-3">
                    {uploadedImageUrls.length > 0 ? (
                      uploadedImageUrls.map((url) => (
                        <div key={url} className="overflow-hidden rounded-[22px] border border-[#eadfd5] bg-[#faf7f4]">
                          <img src={url} alt="Produto" className="h-36 w-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 rounded-[22px] border border-dashed border-[#e3d7cb] bg-[#faf7f4] p-6 text-center text-sm text-[#85776c]">
                        As imagens enviadas aparecerão aqui.
                      </div>
                    )}
                  </div>
                </Panel>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[#ede3d9] bg-white px-5 py-5 md:flex-row md:justify-end md:px-8">
              <button onClick={closeProductModal} className="admin-secondary-button">Cancelar</button>
              <button onClick={() => void saveProduct()} disabled={isSavingProduct || uploadingImages} className="admin-primary-button disabled:opacity-60">
                <Plus className="h-4 w-4" />
                {isSavingProduct ? "Salvando..." : "Salvar produto"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Panel = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <section className="rounded-[30px] border border-[#ece2d7] bg-white p-5 shadow-sm md:p-6">
    <div className="mb-5">
      <h3 className="font-heading text-2xl font-black uppercase text-[#1f1a17]">{title}</h3>
      <p className="mt-2 text-sm text-[#71665e]">{description}</p>
    </div>
    {children}
  </section>
);

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[24px] border border-white/60 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8d7f73]">{label}</p>
    <p className="mt-2 font-heading text-xl font-black text-[#1f1a17]">{value}</p>
  </div>
);

const StatBox = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[24px] bg-[#faf7f4] p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7d72]">{label}</p>
    <p className="mt-3 font-heading text-2xl font-black text-[#1f1a17]">{value}</p>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-2xl bg-[#faf7f4] px-4 py-4 text-sm text-[#493f38]">
    <span>{label}</span>
    <strong className="font-heading text-base text-[#1f1a17]">{value}</strong>
  </div>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#7d7268]">{label}</span>
    {children}
  </label>
);

export default Admin;
