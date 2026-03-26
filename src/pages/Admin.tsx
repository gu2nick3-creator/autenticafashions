import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutGrid, Package, ShoppingCart, Users, Tag, DollarSign, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, type Category, type Coupon, type Order, type Product, type User } from "@/lib/api";

type Tab = "faturamento" | "produtos" | "categorias" | "clientes" | "cupons" | "pedidos";
const tabs = [
  { id: "faturamento", label: "Faturamento", icon: <DollarSign className="w-4 h-4" /> },
  { id: "produtos", label: "Produtos", icon: <Package className="w-4 h-4" /> },
  { id: "categorias", label: "Categorias", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "clientes", label: "Clientes", icon: <Users className="w-4 h-4" /> },
  { id: "cupons", label: "Cupons", icon: <Tag className="w-4 h-4" /> },
  { id: "pedidos", label: "Pedidos", icon: <ShoppingCart className="w-4 h-4" /> },
] as const;

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const Admin = () => {
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("faturamento");
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productForm, setProductForm] = useState({ sku: "", name: "", description: "", categoryId: "", productType: "sapatos", sizes: "34,35,36,37,38", colors: "Preto:#111111,Branco:#FFFFFF", normalPrice: "", resalePrice: "", images: "" });
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState("");
  const [couponForm, setCouponForm] = useState({ code: "", discountValue: "", expiresAt: "", usageLimit: "" });

  const loadAll = async () => {
    try {
      const [sum, prods, cats, cli, cps, ord] = await Promise.all([api.adminDashboard(), api.adminProducts(), api.adminCategories(), api.adminClients(), api.adminCoupons(), api.adminOrders()]);
      setSummary(sum.summary);
      setProducts(prods.products);
      setCategories(cats.categories);
      setClients(cli.clients);
      setCoupons(cps.coupons);
      setOrders(ord.orders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao carregar painel.");
    }
  };

  useEffect(() => { void loadAll(); }, []);
  const faturamento = useMemo(() => orders.reduce((acc, order) => acc + order.total, 0), [orders]);
  if (!isLoggedIn || !user?.isAdmin) return <Navigate to="/login" />;

  const saveProduct = async () => {
    try {
      await api.saveAdminProduct({
        sku: productForm.sku,
        name: productForm.name,
        description: productForm.description,
        categoryId: productForm.categoryId,
        productType: productForm.productType,
        sizes: productForm.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: productForm.colors.split(",").map((entry) => { const [name, hex] = entry.split(":"); return { name: name.trim(), hex: (hex || "#cccccc").trim() }; }),
        images: productForm.images.split(",").map((s) => s.trim()).filter(Boolean),
        normalPrice: Number(productForm.normalPrice),
        resalePrice: Number(productForm.resalePrice),
        status: true,
      });
      toast.success("Produto salvo.");
      setProductForm({ sku: "", name: "", description: "", categoryId: "", productType: "sapatos", sizes: "34,35,36,37,38", colors: "Preto:#111111,Branco:#FFFFFF", normalPrice: "", resalePrice: "", images: "" });
      await loadAll();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Falha ao salvar produto."); }
  };

  return <div className="min-h-screen bg-secondary/30 p-4 md:p-8"><div className="max-w-7xl mx-auto"><div className="rounded-3xl border border-border bg-card p-4 md:p-6"><div className="flex flex-wrap gap-3">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`rounded-2xl border px-4 py-3 text-sm font-heading font-bold uppercase flex items-center gap-2 ${activeTab === tab.id ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background"}`}>{tab.icon}{tab.label}</button>)}</div>
  {activeTab === "faturamento" && <div className="mt-6 grid md:grid-cols-3 gap-4"><Card label="Faturamento" value={money(faturamento)} /><Card label="Produtos" value={String(summary.products || products.length)} /><Card label="Pedidos" value={String(summary.orders || orders.length)} /></div>}
  {activeTab === "produtos" && <div className="mt-6 grid xl:grid-cols-[0.9fr_1.1fr] gap-6"><div className="space-y-3"><h2 className="font-heading font-black text-2xl uppercase">Novo produto</h2>{Object.entries(productForm).map(([key, value]) => key === 'productType' ? <select key={key} value={value} onChange={(e) => setProductForm((c) => ({ ...c, [key]: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"><option value="sapatos">Sapatos</option><option value="roupas">Roupas</option></select> : key === 'categoryId' ? <select key={key} value={value} onChange={(e) => setProductForm((c) => ({ ...c, [key]: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"><option value="">Selecione a categoria</option>{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select> : <input key={key} value={value} onChange={(e) => setProductForm((c) => ({ ...c, [key]: e.target.value }))} placeholder={key} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />)}<button onClick={() => void saveProduct()} className="rounded-xl bg-accent px-4 py-3 text-sm font-heading font-bold uppercase text-accent-foreground">Salvar produto</button></div><div><h2 className="font-heading font-black text-2xl uppercase mb-4">Produtos cadastrados</h2><div className="space-y-3">{products.map((product) => <div key={product.id} className="rounded-2xl border border-border bg-background p-4 flex items-center justify-between gap-4"><div><p className="font-heading font-black">{product.name}</p><p className="text-sm text-muted-foreground">{product.category} • {money(product.normalPrice)}</p></div><button onClick={() => void api.deleteAdminProduct(product.id).then(loadAll)}><Trash2 className="w-5 h-5" /></button></div>)}</div></div></div>}
  {activeTab === "categorias" && <div className="mt-6 grid md:grid-cols-2 gap-6"><div className="space-y-3"><h2 className="font-heading font-black text-xl uppercase">Nova categoria</h2><input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Nome da categoria" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /><button onClick={() => void api.createCategory({ name: categoryName }).then(loadAll)} className="rounded-xl bg-accent px-4 py-3 text-sm font-heading font-bold uppercase text-accent-foreground">Criar categoria</button><h2 className="font-heading font-black text-xl uppercase pt-6">Nova subcategoria</h2><select value={subcategoryCategoryId} onChange={(e) => setSubcategoryCategoryId(e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"><option value="">Escolha a categoria</option>{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select><input value={subcategoryName} onChange={(e) => setSubcategoryName(e.target.value)} placeholder="Nome da subcategoria" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /><button onClick={() => void api.createSubcategory({ categoryId: subcategoryCategoryId, name: subcategoryName }).then(loadAll)} className="rounded-xl border border-border px-4 py-3 text-sm font-heading font-bold uppercase">Criar subcategoria</button></div><div className="space-y-3">{categories.map((cat) => <div key={cat.id} className="rounded-2xl border border-border bg-background p-4"><div className="flex items-center justify-between"><p className="font-heading font-black">{cat.name}</p><button onClick={() => void api.deleteCategory(cat.id).then(loadAll)}><Trash2 className="w-5 h-5" /></button></div><div className="mt-2 flex flex-wrap gap-2">{cat.subcategories?.map((sub) => <span key={sub.id} className="rounded-full border border-border px-3 py-1 text-xs">{sub.name}</span>)}</div></div>)}</div></div>}
  {activeTab === "clientes" && <div className="mt-6 space-y-3">{clients.map((client) => <div key={client.id} className="rounded-2xl border border-border bg-background p-4"><p className="font-heading font-black">{client.name}</p><p className="text-sm text-muted-foreground">{client.email}</p></div>)}</div>}
  {activeTab === "cupons" && <div className="mt-6 grid md:grid-cols-[0.7fr_1.3fr] gap-6"><div className="space-y-3"><input value={couponForm.code} onChange={(e) => setCouponForm((c) => ({ ...c, code: e.target.value }))} placeholder="Código" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /><input value={couponForm.discountValue} onChange={(e) => setCouponForm((c) => ({ ...c, discountValue: e.target.value }))} placeholder="Desconto (%)" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /><input type="datetime-local" value={couponForm.expiresAt} onChange={(e) => setCouponForm((c) => ({ ...c, expiresAt: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /><input value={couponForm.usageLimit} onChange={(e) => setCouponForm((c) => ({ ...c, usageLimit: e.target.value }))} placeholder="Limite de uso" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /><button onClick={() => void api.saveAdminCoupon({ code: couponForm.code, discountType: 'percent', discountValue: Number(couponForm.discountValue), expiresAt: couponForm.expiresAt || null, usageLimit: couponForm.usageLimit || null, isActive: true }).then(loadAll)} className="rounded-xl bg-accent px-4 py-3 text-sm font-heading font-bold uppercase text-accent-foreground">Salvar cupom</button></div><div className="space-y-3">{coupons.map((coupon) => <div key={coupon.id} className="rounded-2xl border border-border bg-background p-4 flex items-center justify-between"><div><p className="font-heading font-black">{coupon.code}</p><p className="text-sm text-muted-foreground">{coupon.discountValue}% • usado {coupon.usedCount || 0}x</p></div><button onClick={() => void api.deleteAdminCoupon(coupon.id).then(loadAll)}><Trash2 className="w-5 h-5" /></button></div>)}</div></div>}
  {activeTab === "pedidos" && <div className="mt-6 space-y-3">{orders.map((order) => <div key={order.id} className="rounded-2xl border border-border bg-background p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-heading font-black">{order.orderNumber || order.id}</p><p className="text-sm text-muted-foreground">{order.clientName} • {order.clientEmail}</p></div><div className="flex items-center gap-2"><select value={order.status} onChange={(e) => void api.updateAdminOrder(order.id, { status: e.target.value }).then(loadAll)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm"><option>Em preparo</option><option>Enviado</option><option>Cancelado</option><option>Entregue</option></select></div></div><p className="mt-3 text-sm text-muted-foreground">{money(order.total)} • {order.address}</p></div>)}</div>}
  </div></div></div>;
};

const Card = ({ label, value }: { label: string; value: string }) => <div className="rounded-3xl border border-border bg-background p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">{label}</p><p className="mt-3 font-heading font-black text-2xl">{value}</p></div>;

export default Admin;
