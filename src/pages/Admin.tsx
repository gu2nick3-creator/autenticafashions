import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Users,
  Tag,
  DollarSign,
  Plus,
  Trash2,
  Pencil,
  X,
  Camera,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";

type Tab =
  | "faturamento"
  | "produtos"
  | "categorias"
  | "clientes"
  | "cupons"
  | "pedidos";

type ProductType = "roupas" | "sapatos";
type OrderStatus = "Em preparo" | "Enviado" | "Cancelado" | "Entregue";

type AdminProduct = {
  id: string;
  sku: string;
  name: string;
  images: string[];
  category: string;
  productType: ProductType;
  sizes: string[];
  colors: string[];
  normalPrice: number;
  resalePrice: number;
  createdAt: string;
};

type AdminCategory = {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
};

type AdminClient = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

type AdminCoupon = {
  id: string;
  code: string;
  discount: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
};

type AdminOrder = {
  id: string;
  clientName: string;
  clientEmail: string;
  address: string;
  status: OrderStatus;
  trackingCode: string;
  items: number;
  total: number;
  createdAt: string;
};

const CLOTHING_SIZES = ["PP", "P", "M", "G", "GG", "XG", "XGG"];

const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
  {
    id: "faturamento",
    label: "Faturamento",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    id: "produtos",
    label: "Produtos",
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: "categorias",
    label: "Categorias",
    icon: <LayoutGrid className="w-4 h-4" />,
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "cupons",
    label: "Cupons",
    icon: <Tag className="w-4 h-4" />,
  },
  {
    id: "pedidos",
    label: "Pedidos",
    icon: <ShoppingCart className="w-4 h-4" />,
  },
];

const Admin = () => {
  const { user, isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("faturamento");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  const [newCategory, setNewCategory] = useState("");
  const [subCategoryInputs, setSubCategoryInputs] = useState<Record<string, string>>({});
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount: "",
    expiresAt: addDays(7),
    usageLimit: "",
  });

  const [form, setForm] = useState({
    sku: "",
    name: "",
    images: [] as string[],
    category: "",
    productType: "sapatos" as ProductType,
    shoeSizesText: "34,35,36,37,38",
    colorsText: "Preto, Branco",
    normalPrice: "",
    resalePrice: "",
    clothingSizes: [...CLOTHING_SIZES],
  });

  useEffect(() => {
    setProducts([]);
    setCategories([]);
    setClients([]);
    setCoupons([]);
    setOrders([]);
  }, []);

  const faturamento = useMemo(
    () => orders.reduce((acc, order) => acc + order.total, 0),
    [orders]
  );

  if (!isLoggedIn || !user?.isAdmin) return <Navigate to="/login" />;

  const resetProductForm = () => {
    setEditingProductId(null);
    setForm({
      sku: "",
      name: "",
      images: [],
      category: categories[0]?.name || "",
      productType: "sapatos",
      shoeSizesText: "34,35,36,37,38",
      colorsText: "Preto, Branco",
      normalPrice: "",
      resalePrice: "",
      clothingSizes: [...CLOTHING_SIZES],
    });
  };

  const openCreateProductModal = () => {
    resetProductForm();
    setShowProductModal(true);
  };

  const openEditProductModal = (product: AdminProduct) => {
    setEditingProductId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      images: Array.isArray(product.images) ? product.images : [],
      category: product.category,
      productType: product.productType,
      shoeSizesText:
        product.productType === "sapatos" ? product.sizes.join(",") : "34,35,36,37,38",
      colorsText: product.colors.join(", "),
      normalPrice: String(product.normalPrice),
      resalePrice: String(product.resalePrice),
      clothingSizes:
        product.productType === "roupas" ? product.sizes : [...CLOTHING_SIZES],
    });
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    resetProductForm();
  };

  const handleImageFiles = (files?: FileList | null) => {
    if (!files || !files.length) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        if (!result) return;

        setForm((current) => ({
          ...current,
          images: [...current.images, result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, i) => i !== index),
    }));
  };

  const saveProduct = () => {
    if (!form.sku || !form.name || !form.category || !form.normalPrice || !form.resalePrice) {
      toast.error("Preencha os dados principais do produto.");
      return;
    }

    const sizes =
      form.productType === "roupas"
        ? form.clothingSizes
        : form.shoeSizesText
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

    const colors = form.colorsText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const nextProduct: AdminProduct = {
      id: editingProductId || `prod-admin-${Date.now()}`,
      sku: form.sku,
      name: form.name,
      images:
        form.images.length > 0
          ? form.images
          : [
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
            ],
      category: form.category,
      productType: form.productType,
      sizes,
      colors,
      normalPrice: Number(form.normalPrice),
      resalePrice: Number(form.resalePrice),
      createdAt: editingProductId
        ? products.find((item) => item.id === editingProductId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    if (editingProductId) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProductId ? nextProduct : product
        )
      );
      toast.success("Produto atualizado com sucesso.");
    } else {
      setProducts((current) => [nextProduct, ...current]);
      toast.success("Produto adicionado com sucesso.");
    }

    closeProductModal();
  };

  const deleteProduct = (id: string) => {
    setProducts((current) => current.filter((product) => product.id !== id));
    toast.success("Produto excluído.");
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setCategories((current) => [
      { id: `cat-${Date.now()}`, name: newCategory.trim(), subcategories: [] },
      ...current,
    ]);
    setNewCategory("");
    toast.success("Categoria criada.");
  };

  const deleteCategory = (id: string) => {
    setCategories((current) => current.filter((category) => category.id !== id));
    toast.success("Categoria excluída.");
  };

  const addSubcategory = (categoryId: string) => {
    const value = subCategoryInputs[categoryId]?.trim();
    if (!value) return;

    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subcategories: [
                ...category.subcategories,
                { id: `sub-${Date.now()}`, name: value },
              ],
            }
          : category
      )
    );

    setSubCategoryInputs((current) => ({ ...current, [categoryId]: "" }));
    toast.success("Subcategoria criada.");
  };

  const deleteSubcategory = (categoryId: string, subId: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subcategories: category.subcategories.filter((sub) => sub.id !== subId),
            }
          : category
      )
    );
    toast.success("Subcategoria excluída.");
  };

  const addCoupon = () => {
    if (!couponForm.code || !couponForm.discount || !couponForm.expiresAt || !couponForm.usageLimit) {
      toast.error("Preencha todos os dados do cupom.");
      return;
    }

    const nextCoupon: AdminCoupon = {
      id: `cup-${Date.now()}`,
      code: couponForm.code.trim().toUpperCase(),
      discount: Number(couponForm.discount),
      expiresAt: couponForm.expiresAt,
      usageLimit: Number(couponForm.usageLimit),
      usedCount: 0,
    };

    setCoupons((current) => [nextCoupon, ...current]);
    setCouponForm({
      code: "",
      discount: "",
      expiresAt: addDays(7),
      usageLimit: "",
    });
    toast.success("Cupom criado.");
  };

  const deleteCoupon = (id: string) => {
    setCoupons((current) => current.filter((coupon) => coupon.id !== id));
    toast.success("Cupom excluído.");
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status } : order))
    );
  };

  const updateTracking = (id: string, trackingCode: string) => {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, trackingCode } : order))
    );
  };

  return (
    <div className="min-h-screen flex bg-secondary">
      <aside className="w-72 bg-primary text-primary-foreground flex-shrink-0 min-h-screen hidden md:block">
        <div className="p-5 border-b border-primary-foreground/10">
          <h2 className="font-heading font-black text-sm">
            AUTENTICA <span className="text-accent">FASHIONF</span>
          </h2>
          <p className="text-[11px] opacity-70 mt-1">Painel Administrativo</p>
        </div>

        <nav className="p-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-heading transition mb-1 ${
                activeTab === tab.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-primary-foreground/10"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-black text-2xl uppercase">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie sua loja, clientes, pedidos e cupons.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`md:hidden px-3 py-2 rounded text-xs border ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <a href="/" className="text-sm text-accent hover:underline px-3 py-2">
              ← Voltar à loja
            </a>
          </div>
        </div>

        {activeTab === "faturamento" && (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Faturamento total" value={money(faturamento)} />
            <MetricCard title="Pedidos" value={String(orders.length)} />
            <MetricCard title="Produtos" value={String(products.length)} />
            <MetricCard title="Clientes" value={String(clients.length)} />

            <div className="md:col-span-2 xl:col-span-4 bg-card border border-border rounded-xl p-5">
              <h3 className="font-heading font-bold mb-3">Resumo rápido</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <InfoBox
                  label="Ticket médio"
                  value={orders.length ? money(faturamento / orders.length) : money(0)}
                />
                <InfoBox
                  label="Pedidos enviados"
                  value={String(
                    orders.filter((order) => order.status === "Enviado").length
                  )}
                />
                <InfoBox
                  label="Pedidos em preparo"
                  value={String(
                    orders.filter((order) => order.status === "Em preparo").length
                  )}
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === "produtos" && (
          <section className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-muted-foreground">
                {products.length} produtos cadastrados
              </p>
              <button
                type="button"
                onClick={openCreateProductModal}
                className="bg-accent text-accent-foreground text-xs font-heading font-bold px-4 py-2 rounded uppercase"
              >
                + Adicionar Produtos
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[860px]">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left px-4 py-3 text-xs uppercase">Produto</th>
                    <th className="text-left px-4 py-3 text-xs uppercase">SKU</th>
                    <th className="text-left px-4 py-3 text-xs uppercase">Categoria</th>
                    <th className="text-left px-4 py-3 text-xs uppercase">Tamanhos</th>
                    <th className="text-left px-4 py-3 text-xs uppercase">Cores</th>
                    <th className="text-left px-4 py-3 text-xs uppercase">Preço normal</th>
                    <th className="text-left px-4 py-3 text-xs uppercase">Preço revenda</th>
                    <th className="text-left px-4 py-3 text-xs uppercase">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {products.length ? (
                    products.map((product) => (
                      <tr key={product.id} className="border-t border-border align-top">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images?.[0] || "https://via.placeholder.com/150"}
                              alt={product.name}
                              className="w-14 h-14 rounded object-cover border border-border"
                            />
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-xs text-muted-foreground uppercase">
                                {product.productType}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {product.images?.length || 0} foto(s)
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{product.sku}</td>
                        <td className="px-4 py-3">{product.category}</td>
                        <td className="px-4 py-3 text-xs">{product.sizes.join(", ")}</td>
                        <td className="px-4 py-3 text-xs">{product.colors.join(", ")}</td>
                        <td className="px-4 py-3">{money(product.normalPrice)}</td>
                        <td className="px-4 py-3">{money(product.resalePrice)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProductModal(product)}
                              className="text-accent"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(product.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                        Nenhum produto cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "categorias" && (
          <section className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4 flex flex-wrap gap-3">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nova categoria"
                className="flex-1 min-w-[220px] border border-border rounded px-3 py-2 bg-background"
              />
              <button
                type="button"
                onClick={addCategory}
                className="bg-accent text-accent-foreground px-4 py-2 rounded text-sm font-semibold"
              >
                Criar nova categoria
              </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.subcategories.length} subcategorias
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCategory(category.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <input
                      value={subCategoryInputs[category.id] || ""}
                      onChange={(e) =>
                        setSubCategoryInputs((current) => ({
                          ...current,
                          [category.id]: e.target.value,
                        }))
                      }
                      placeholder="Nova subcategoria"
                      className="flex-1 border border-border rounded px-3 py-2 bg-background text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => addSubcategory(category.id)}
                      className="bg-primary text-primary-foreground rounded px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {category.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between border border-border rounded px-3 py-2 text-sm"
                      >
                        <span>{sub.name}</span>
                        <button
                          type="button"
                          onClick={() => deleteSubcategory(category.id, sub.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "clientes" && (
          <section className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <p className="text-sm text-muted-foreground">
                Todos os logins criados de clientes aparecem aqui.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left px-4 py-3 text-xs uppercase">Nome</th>
                    <th className="text-left px-4 py-3 text-xs uppercase">E-mail</th>
                    <th className="text-left px-4 py-3 text-xs uppercase">Cadastro</th>
                  </tr>
                </thead>

                <tbody>
                  {clients.length ? (
                    clients.map((client) => (
                      <tr key={client.id} className="border-t border-border">
                        <td className="px-4 py-3">{client.name}</td>
                        <td className="px-4 py-3">{client.email}</td>
                        <td className="px-4 py-3">{formatDate(client.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                        Nenhum cliente cadastrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "cupons" && (
          <section className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4 grid md:grid-cols-4 gap-3">
              <input
                value={couponForm.code}
                onChange={(e) =>
                  setCouponForm((current) => ({ ...current, code: e.target.value }))
                }
                placeholder="Código do cupom"
                className="border border-border rounded px-3 py-2 bg-background"
              />
              <input
                value={couponForm.discount}
                onChange={(e) =>
                  setCouponForm((current) => ({ ...current, discount: e.target.value }))
                }
                placeholder="Desconto %"
                type="number"
                className="border border-border rounded px-3 py-2 bg-background"
              />
              <input
                value={couponForm.expiresAt}
                onChange={(e) =>
                  setCouponForm((current) => ({ ...current, expiresAt: e.target.value }))
                }
                type="date"
                className="border border-border rounded px-3 py-2 bg-background"
              />
              <input
                value={couponForm.usageLimit}
                onChange={(e) =>
                  setCouponForm((current) => ({ ...current, usageLimit: e.target.value }))
                }
                placeholder="Qtd. de usos"
                type="number"
                className="border border-border rounded px-3 py-2 bg-background"
              />

              <div className="md:col-span-4">
                <button
                  type="button"
                  onClick={addCoupon}
                  className="bg-accent text-accent-foreground px-4 py-2 rounded text-sm font-semibold"
                >
                  Criar cupom
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading font-bold text-lg">{coupon.code}</h3>
                      <p className="text-sm text-muted-foreground">
                        {coupon.discount}% de desconto
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCoupon(coupon.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 text-sm space-y-1 text-muted-foreground">
                    <p>Duração: até {formatDate(coupon.expiresAt)}</p>
                    <p>Limite de uso: {coupon.usageLimit}</p>
                    <p>Usado: {coupon.usedCount}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "pedidos" && (
          <section className="space-y-4">
            {orders.length ? (
              orders.map((order) => (
                <div key={order.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex flex-wrap gap-3 items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg">{order.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.clientName} · {order.clientEmail}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.address}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">{money(order.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.items} itens · {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-semibold mb-2">
                        Status do pedido
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="w-full border border-border rounded px-3 py-2 bg-background"
                      >
                        <option>Em preparo</option>
                        <option>Enviado</option>
                        <option>Cancelado</option>
                        <option>Entregue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-semibold mb-2">
                        Código de rastreio
                      </label>
                      <input
                        value={order.trackingCode}
                        onChange={(e) => updateTracking(order.id, e.target.value)}
                        placeholder="Digite o código de rastreio"
                        className="w-full border border-border rounded px-3 py-2 bg-background"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground">
                Nenhum pedido encontrado ainda.
              </div>
            )}
          </section>
        )}
      </main>

      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-heading font-black text-lg uppercase">
                {editingProductId ? "Editar Produto" : "Adicionar Produto"}
              </h2>
              <button type="button" onClick={closeProductModal}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 grid md:grid-cols-2 gap-4">
              <Field label="SKU">
                <input
                  value={form.sku}
                  onChange={(e) => setForm((current) => ({ ...current, sku: e.target.value }))}
                  className="input-admin"
                />
              </Field>

              <Field label="Nome do produto">
                <input
                  value={form.name}
                  onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  className="input-admin"
                />
              </Field>

              <Field label="Selecionar categoria">
                <select
                  value={form.category}
                  onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
                  className="input-admin"
                >
                  <option value="">Selecione</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tipo">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, productType: "roupas" }))}
                    className={`px-4 py-2 rounded border ${
                      form.productType === "roupas"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border"
                    }`}
                  >
                    Roupas
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, productType: "sapatos" }))}
                    className={`px-4 py-2 rounded border ${
                      form.productType === "sapatos"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border"
                    }`}
                  >
                    Sapatos
                  </button>
                </div>
              </Field>

              <div className="md:col-span-2">
                <label className="block text-xs font-heading font-semibold uppercase mb-2">
                  Adicionar imagens
                </label>

                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="border border-dashed border-border rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition">
                    <ImagePlus className="w-5 h-5" />
                    <div>
                      <p className="font-semibold text-sm">Selecionar da galeria</p>
                      <p className="text-xs text-muted-foreground">
                        Escolha uma ou mais imagens
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageFiles(e.target.files)}
                    />
                  </label>

                  <label className="border border-dashed border-border rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition md:hidden">
                    <Camera className="w-5 h-5" />
                    <div>
                      <p className="font-semibold text-sm">Tirar foto agora</p>
                      <p className="text-xs text-muted-foreground">Opção liberada no mobile</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageFiles(e.target.files)}
                    />
                  </label>
                </div>

                {form.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {form.images.map((img, index) => (
                      <div
                        key={`${img}-${index}`}
                        className="relative rounded-lg overflow-hidden border border-border"
                      >
                        <img
                          src={img}
                          alt={`Prévia ${index + 1}`}
                          className="w-full h-28 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {form.productType === "roupas" ? (
                <Field label="Tamanhos disponíveis">
                  <div className="flex flex-wrap gap-2">
                    {CLOTHING_SIZES.map((size) => {
                      const checked = form.clothingSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              clothingSizes: checked
                                ? current.clothingSizes.filter((item) => item !== size)
                                : [...current.clothingSizes, size],
                            }))
                          }
                          className={`px-3 py-2 rounded border text-sm ${
                            checked
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              ) : (
                <Field label="Tamanhos dos sapatos">
                  <input
                    value={form.shoeSizesText}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, shoeSizesText: e.target.value }))
                    }
                    placeholder="Ex: 34,35,36,37,38"
                    className="input-admin"
                  />
                </Field>
              )}

              <Field label="Cores disponíveis">
                <input
                  value={form.colorsText}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, colorsText: e.target.value }))
                  }
                  placeholder="Ex: Preto, Branco, Nude"
                  className="input-admin"
                />
              </Field>

              <Field label="Preço normal">
                <input
                  value={form.normalPrice}
                  type="number"
                  onChange={(e) =>
                    setForm((current) => ({ ...current, normalPrice: e.target.value }))
                  }
                  className="input-admin"
                />
              </Field>

              <Field label="Preço revenda">
                <input
                  value={form.resalePrice}
                  type="number"
                  onChange={(e) =>
                    setForm((current) => ({ ...current, resalePrice: e.target.value }))
                  }
                  className="input-admin"
                />
              </Field>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={closeProductModal}
                className="px-4 py-2 rounded border border-border"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveProduct}
                className="px-4 py-2 rounded bg-accent text-accent-foreground font-semibold"
              >
                {editingProductId ? "Salvar alterações" : "Salvar produto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-card border border-border rounded-xl p-5">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="font-heading font-black text-3xl mt-2">{value}</p>
  </div>
);

const InfoBox = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border p-4 bg-background">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-semibold text-lg mt-1">{value}</p>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-heading font-semibold uppercase mb-2">
      {label}
    </label>
    {children}
  </div>
);

function addDays(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
};

export default Admin;
