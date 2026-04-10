import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/admin';
import { ORDER_STATUS_LABELS, OrderStatus, Product, ProductColor, Category, Order, Coupon, User } from '@/types';
import {
  BarChart3, Package, Grid3X3, Users, Tag, ShoppingCart,
  Plus, Edit, Trash2, Eye, Camera, Upload, ChevronLeft, X
} from 'lucide-react';
import { toast } from 'sonner';

const adminTabs = [
  { id: 'faturamento', label: 'Faturamento', icon: BarChart3 },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'categorias', label: 'Categorias', icon: Grid3X3 },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'cupons', label: 'Cupons', icon: Tag },
  { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
];

const emptyProduct = {
  sku: '', name: '', description: '', category: '', subcategory: '',
  priceNormal: '', priceResale: '', stock: '',
  active: true, featured: false, isNew: false, isPopular: false,
  type: 'sapatos' as 'roupas' | 'sapatos',
  shoeSizes: '33,34,35,36,37,38,39',
  clothingSizes: [] as string[],
  colors: [] as ProductColor[],
  colorInput: '',
  images: [] as string[],
};

const AdminPanel = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('faturamento');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [clientsList, setClientsList] = useState<User[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({ ...emptyProduct });
  const [dashboard, setDashboard] = useState({ totalRevenue: 0, paidOrders: 0, pendingOrders: 0, totalOrders: 0 });

  // Category form
  const [categoryForm, setCategoryForm] = useState({ name: '', subcategory: '', image: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Coupon form
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', maxUses: '', usesPerClient: '', validUntil: '', type: 'percentage' as 'percentage' | 'value' });

  // Image upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadData();
    }
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" />;

  const loadData = () => {
    adminService.getDashboard().then(setDashboard).catch(() => {});
    adminService.getProducts().then(setProductsList).catch(() => {});
    adminService.getOrders().then(setOrdersList).catch(() => {});
    adminService.getCategories().then(setCategoriesList).catch(() => {});
    adminService.getCoupons().then(setCouponsList).catch(() => {});
    adminService.getCustomers().then(setClientsList).catch(() => {});
  };

  const resetProductForm = () => {
    setProductForm({ ...emptyProduct });
    setEditingProductId(null);
    setShowProductForm(false);
  };

  const handleEditProduct = (p: Product) => {
    setProductForm({
      sku: p.sku || '',
      name: p.name,
      description: p.description,
      category: p.category,
      subcategory: '',
      priceNormal: p.priceNormal.toString(),
      priceResale: p.priceResale.toString(),
      stock: p.stock.toString(),
      active: true,
      featured: p.featured || false,
      isNew: p.isNew || false,
      isPopular: p.isPopular || false,
      type: 'sapatos',
      shoeSizes: p.sizes?.join(',') || '33,34,35,36,37,38,39',
      clothingSizes: [],
      colors: p.colors || [],
      colorInput: '',
      images: p.images || [],
    });
    setEditingProductId(p.id);
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.priceNormal) {
      toast.error('Preencha nome e preço!');
      return;
    }
    const productData: Partial<Product> = {
      sku: productForm.sku,
      name: productForm.name,
      description: productForm.description,
      category: productForm.category,
      priceNormal: parseFloat(productForm.priceNormal) || 0,
      priceResale: parseFloat(productForm.priceResale) || 0,
      stock: parseInt(productForm.stock) || 0,
      featured: productForm.featured,
      isNew: productForm.isNew,
      isPopular: productForm.isPopular,
      active: productForm.active,
      type: productForm.type,
      colors: productForm.colors,
      sizes: productForm.type === 'roupas' ? productForm.clothingSizes : productForm.shoeSizes.split(',').map(s => s.trim()).filter(Boolean),
      images: productForm.images,
    };

    try {
      if (editingProductId) {
        const updated = await adminService.updateProduct(editingProductId, productData);
        setProductsList(prev => prev.map(p => p.id === editingProductId ? updated : p));
        toast.success('Produto atualizado!');
      } else {
        const created = await adminService.createProduct(productData);
        setProductsList(prev => [...prev, created]);
        toast.success('Produto criado!');
      }
      resetProductForm();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await adminService.deleteProduct(id);
      setProductsList(prev => prev.filter(p => p.id !== id));
      toast.success('Produto excluído!');
    } catch {
      toast.error('Erro ao excluir produto');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await adminService.uploadImage(file);
      setProductForm(prev => ({ ...prev, images: [...prev.images, url] }));
      toast.success('Imagem enviada!');
    } catch {
      toast.error('Erro ao enviar imagem');
    }
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { url } = await adminService.uploadImage(file);
      setCategoryForm(prev => ({ ...prev, image: url }));
      toast.success('Imagem da categoria enviada!');
    } catch {
      toast.error('Erro ao enviar imagem da categoria');
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', subcategory: '', image: '' });
    setEditingCategoryId(null);
    setShowAddCategory(false);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      name: category.name,
      subcategory: category.subcategories?.[0]?.name || '',
      image: category.image || '',
    });
    setEditingCategoryId(category.id);
    setShowAddCategory(true);
  };

  const addColor = () => {
    const c = productForm.colorInput.trim();
    if (c && !productForm.colors.some(pc => pc.name === c)) {
      setProductForm(prev => ({ ...prev, colors: [...prev.colors, { name: c, hex: '' }], colorInput: '' }));
    }
  };

  const removeColor = (colorName: string) => {
    setProductForm(prev => ({ ...prev, colors: prev.colors.filter(c => c.name !== colorName) }));
  };

  const toggleClothingSize = (size: string) => {
    setProductForm(prev => ({
      ...prev,
      clothingSizes: prev.clothingSizes.includes(size) ? prev.clothingSizes.filter(s => s !== size) : [...prev.clothingSizes, size],
    }));
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Status atualizado!');
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleTrackingSave = async (orderId: string, trackingCode: string, carrier: string) => {
    try {
      await adminService.updateOrderTracking(orderId, trackingCode, carrier);
      setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, trackingCode, carrier } : o));
      toast.success('Rastreio salvo!');
    } catch {
      toast.error('Erro ao salvar rastreio');
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      toast.error('Preencha o nome');
      return;
    }

    const payload: Partial<Category> = {
      name: categoryForm.name,
      image: categoryForm.image,
      subcategories: categoryForm.subcategory ? [{ id: '', name: categoryForm.subcategory }] : [],
    };

    try {
      if (editingCategoryId) {
        const updated = await adminService.updateCategory(editingCategoryId, payload);
        setCategoriesList(prev => prev.map(category => category.id === editingCategoryId ? updated : category));
        toast.success('Categoria atualizada!');
      } else {
        const created = await adminService.createCategory(payload);
        setCategoriesList(prev => [...prev, created]);
        toast.success('Categoria criada!');
      }

      resetCategoryForm();
    } catch {
      toast.error(editingCategoryId ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await adminService.deleteCategory(id);
      setCategoriesList(prev => prev.filter(c => c.id !== id));
      toast.success('Categoria excluída!');
    } catch {
      toast.error('Erro ao excluir categoria');
    }
  };

  const handleSaveCoupon = async () => {
    if (!couponForm.code) { toast.error('Preencha o código'); return; }
    try {
      const created = await adminService.createCoupon({
        code: couponForm.code.toUpperCase(),
        type: couponForm.type,
        discount: parseFloat(couponForm.discount) || 0,
        maxUses: parseInt(couponForm.maxUses) || 100,
        usesPerClient: parseInt(couponForm.usesPerClient) || 1,
        validUntil: couponForm.validUntil,
        active: true,
        currentUses: 0,
      });
      setCouponsList(prev => [...prev, created]);
      setCouponForm({ code: '', discount: '', maxUses: '', usesPerClient: '', validUntil: '', type: 'percentage' });
      setShowAddCoupon(false);
      toast.success('Cupom criado!');
    } catch {
      toast.error('Erro ao criar cupom');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      await adminService.deleteCoupon(id);
      setCouponsList(prev => prev.filter(c => c.id !== id));
      toast.success('Cupom excluído!');
    } catch {
      toast.error('Erro ao excluir cupom');
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-display text-xl font-semibold gold-text">AUTENTICA</a>
            <span className="text-xs text-muted-foreground tracking-wider">PAINEL ADMIN</span>
          </div>
          <a href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ChevronLeft size={16} /> Voltar ao site
          </a>
        </div>
      </div>

      <div className="container py-6">
        {/* Tab nav */}
        <div className="flex flex-wrap gap-2 mb-6">
          {adminTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-sm transition-all ${activeTab === tab.id ? 'gold-gradient text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Faturamento */}
        {activeTab === 'faturamento' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">Faturamento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Faturamento Total', value: `R$ ${dashboard.totalRevenue.toFixed(2)}`, color: 'gold-gradient text-primary-foreground' },
                { label: 'Pedidos Pagos', value: dashboard.paidOrders.toString(), color: 'bg-card border border-border text-foreground' },
                { label: 'Pedidos Pendentes', value: dashboard.pendingOrders.toString(), color: 'bg-card border border-border text-foreground' },
                { label: 'Total de Pedidos', value: dashboard.totalOrders.toString(), color: 'bg-card border border-border text-foreground' },
              ].map((card, i) => (
                <div key={i} className={`${card.color} rounded-sm p-6`}>
                  <p className="text-xs tracking-wider opacity-80 mb-1">{card.label}</p>
                  <p className="text-2xl font-semibold">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Produtos */}
        {activeTab === 'produtos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-foreground">Produtos</h2>
              <button onClick={() => { resetProductForm(); setShowProductForm(true); }} className="flex items-center gap-2 gold-gradient text-primary-foreground px-4 py-2 text-sm font-medium">
                <Plus size={16} /> Adicionar Produto
              </button>
            </div>

            {showProductForm && (
              <div className="bg-card border border-border rounded-sm p-6 space-y-4">
                <h3 className="font-display text-lg font-medium text-foreground">
                  {editingProductId ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'sku', label: 'SKU' },
                    { key: 'name', label: 'Nome do Produto' },
                    { key: 'category', label: 'Categoria' },
                    { key: 'subcategory', label: 'Subcategoria' },
                    { key: 'priceNormal', label: 'Preço Normal' },
                    { key: 'priceResale', label: 'Preço Revenda' },
                    { key: 'stock', label: 'Estoque' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-medium text-foreground tracking-wide">{f.label}</label>
                      <input
                        value={(productForm as any)[f.key]}
                        onChange={e => setProductForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full mt-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground tracking-wide">Descrição</label>
                  <textarea
                    value={productForm.description}
                    onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full mt-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary h-20 resize-none"
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: 'active', label: 'Ativo' },
                    { key: 'featured', label: 'Destaque' },
                    { key: 'isNew', label: 'Lançamento' },
                    { key: 'isPopular', label: 'Popular' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={(productForm as any)[key]}
                        onChange={e => setProductForm(prev => ({ ...prev, [key]: e.target.checked }))}
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {/* Product type */}
                <div>
                  <label className="text-xs font-medium text-foreground tracking-wide mb-2 block">Tipo de Produto</label>
                  <div className="flex gap-3">
                    <button onClick={() => setProductForm(prev => ({ ...prev, type: 'roupas' }))} className={`px-4 py-2 text-sm border rounded-sm ${productForm.type === 'roupas' ? 'border-primary bg-cream text-primary' : 'border-border text-muted-foreground'}`}>Roupas</button>
                    <button onClick={() => setProductForm(prev => ({ ...prev, type: 'sapatos' }))} className={`px-4 py-2 text-sm border rounded-sm ${productForm.type === 'sapatos' ? 'border-primary bg-cream text-primary' : 'border-border text-muted-foreground'}`}>Sapatos</button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="text-xs font-medium text-foreground tracking-wide mb-2 block">Tamanhos</label>
                  {productForm.type === 'roupas' ? (
                    {cat.image && (
                    <div className="mb-3">
                      <img src={cat.image} alt={cat.name} className="w-24 h-32 object-cover border border-border rounded-sm" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                      {['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG'].map(s => (
                        <label key={s} className={`flex items-center gap-1 text-sm border rounded-sm px-3 py-1.5 cursor-pointer transition-colors ${productForm.clothingSizes.includes(s) ? 'border-primary bg-cream text-primary' : 'border-border text-foreground hover:border-primary'}`}>
                          <input type="checkbox" className="accent-primary" checked={productForm.clothingSizes.includes(s)} onChange={() => toggleClothingSize(s)} /> {s}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      value={productForm.shoeSizes}
                      onChange={e => setProductForm(prev => ({ ...prev, shoeSizes: e.target.value }))}
                      className="w-full border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary"
                      placeholder="33,34,35,36,37,38,39,40"
                    />
                  )}
                </div>

                {/* Colors - manual input */}
                <div>
                  <label className="text-xs font-medium text-foreground tracking-wide mb-2 block">Cores</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      value={productForm.colorInput}
                      onChange={e => setProductForm(prev => ({ ...prev, colorInput: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
                      className="flex-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary"
                      placeholder="Digite o nome da cor e pressione Enter ou clique +"
                    />
                    <button onClick={addColor} className="gold-gradient text-primary-foreground px-4 py-2 text-sm font-medium">
                      <Plus size={16} />
                    </button>
                  </div>
                  {productForm.colors.length > 0 && (
                    {cat.image && (
                    <div className="mb-3">
                      <img src={cat.image} alt={cat.name} className="w-24 h-32 object-cover border border-border rounded-sm" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                      {productForm.colors.map(c => (
                        <span key={c.name} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-cream border border-border rounded-sm text-foreground">
                          {c.name}
                          <button onClick={() => removeColor(c.name)} className="text-muted-foreground hover:text-destructive ml-1"><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Images */}
                <div>
                  <label className="text-xs font-medium text-foreground tracking-wide mb-2 block">Imagens</label>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <div className="flex gap-3">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 border border-border rounded-sm px-4 py-3 text-sm text-muted-foreground hover:border-primary transition-colors">
                      <Upload size={18} /> Selecionar Arquivo
                    </button>
                    <button onClick={() => { if (fileInputRef.current) { fileInputRef.current.capture = 'environment'; fileInputRef.current.click(); } }} className="flex items-center gap-2 border border-border rounded-sm px-4 py-3 text-sm text-muted-foreground hover:border-primary transition-colors md:hidden">
                      <Camera size={18} /> Tirar Foto
                    </button>
                  </div>
                  {productForm.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {productForm.images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 border border-border rounded-sm overflow-hidden">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setProductForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))} className="absolute top-0 right-0 bg-destructive text-white p-0.5"><X size={10} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveProduct} className="gold-gradient text-primary-foreground px-6 py-2 text-sm font-medium">
                    {editingProductId ? 'ATUALIZAR PRODUTO' : 'SALVAR PRODUTO'}
                  </button>
                  <button onClick={resetProductForm} className="border border-border text-foreground px-6 py-2 text-sm">CANCELAR</button>
                </div>
              </div>
            )}

            {/* Product list */}
            <div className="bg-card border border-border rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide">SKU</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide">Nome</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide hidden md:table-cell">Categoria</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide">Normal</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide">Revenda</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide">Estoque</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsList.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">Nenhum produto cadastrado.</td></tr>
                    )}
                    {productsList.map(p => (
                      <tr key={p.id} className="border-t border-border hover:bg-cream/50">
                        <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.category}</td>
                        <td className="px-4 py-3">R$ {p.priceNormal.toFixed(2)}</td>
                        <td className="px-4 py-3 text-primary">R$ {p.priceResale.toFixed(2)}</td>
                        <td className="px-4 py-3">{p.stock}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => handleEditProduct(p)} className="text-muted-foreground hover:text-primary" title="Editar"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="text-muted-foreground hover:text-destructive" title="Excluir"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Categorias */}
        {activeTab === 'categorias' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-foreground">Categorias</h2>
              <button onClick={() => { if (showAddCategory) { resetCategoryForm(); } else { setShowAddCategory(true); } }} className="flex items-center gap-2 gold-gradient text-primary-foreground px-4 py-2 text-sm font-medium">
                <Plus size={16} /> Nova Categoria
              </button>
            </div>

            {showAddCategory && (
              <div className="bg-card border border-border rounded-sm p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-foreground tracking-wide">Nome da Categoria</label>
                    <input value={categoryForm.name} onChange={e => setCategoryForm(p => ({ ...p, name: e.target.value }))} className="w-full mt-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground tracking-wide">Subcategoria (opcional)</label>
                    <input value={categoryForm.subcategory} onChange={e => setCategoryForm(p => ({ ...p, subcategory: e.target.value }))} className="w-full mt-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground tracking-wide mb-2 block">Imagem da Categoria</label>
                  <input type="file" ref={categoryFileInputRef} onChange={handleCategoryImageUpload} accept="image/*" className="hidden" />
                  <button onClick={() => categoryFileInputRef.current?.click()} className="flex items-center gap-2 border border-border rounded-sm px-4 py-3 text-sm text-muted-foreground hover:border-primary transition-colors">
                    <Upload size={18} /> Selecionar Imagem
                  </button>
                  {categoryForm.image && (
                    <div className="mt-3">
                      <img src={categoryForm.image} alt="Preview da categoria" className="w-28 h-36 object-cover border border-border rounded-sm" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSaveCategory} className="gold-gradient text-primary-foreground px-6 py-2 text-sm font-medium">
                    {editingCategoryId ? 'ATUALIZAR' : 'SALVAR'}
                  </button>
                  <button onClick={resetCategoryForm} className="border border-border text-foreground px-6 py-2 text-sm">CANCELAR</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoriesList.map(cat => (
                <div key={cat.id} className="bg-card border border-border rounded-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-base font-medium text-foreground">{cat.name}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditCategory(cat)} className="text-muted-foreground hover:text-primary"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {cat.image && (
                    <div className="mb-3">
                      <img src={cat.image} alt={cat.name} className="w-24 h-32 object-cover border border-border rounded-sm" />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {cat.subcategories.map(sub => (
                      <span key={sub.id} className="text-xs px-3 py-1 bg-cream border border-border rounded-sm text-muted-foreground flex items-center gap-1">
                        {sub.name}
                        <button className="text-muted-foreground hover:text-destructive"><Trash2 size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clientes */}
        {activeTab === 'clientes' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">Clientes</h2>
            <div className="bg-card border border-border rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide">Nome</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide">E-mail</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide hidden md:table-cell">Telefone</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide hidden md:table-cell">Cadastro</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsList.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">Nenhum cliente cadastrado.</td></tr>
                    )}
                    {clientsList.map(c => (
                      <tr key={c.id} className="border-t border-border hover:bg-cream/50">
                        <td className="px-4 py-3 text-foreground font-medium">{c.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.phone}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.createdAt}</td>
                        <td className="px-4 py-3">
                          <button className="text-muted-foreground hover:text-primary"><Eye size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Cupons */}
        {activeTab === 'cupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-foreground">Cupons</h2>
              <button onClick={() => setShowAddCoupon(!showAddCoupon)} className="flex items-center gap-2 gold-gradient text-primary-foreground px-4 py-2 text-sm font-medium">
                <Plus size={16} /> Novo Cupom
              </button>
            </div>

            {showAddCoupon && (
              <div className="bg-card border border-border rounded-sm p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: 'code', label: 'Código', placeholder: 'CODIGO10' },
                    { key: 'discount', label: 'Valor do Desconto', placeholder: '10' },
                    { key: 'maxUses', label: 'Usos Máximos', placeholder: '100' },
                    { key: 'usesPerClient', label: 'Usos por Cliente', placeholder: '1' },
                    { key: 'validUntil', label: 'Validade', placeholder: '2025-12-31', type: 'date' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-medium text-foreground tracking-wide">{f.label}</label>
                      <input
                        type={(f as any).type || 'text'}
                        value={(couponForm as any)[f.key]}
                        onChange={e => setCouponForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full mt-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary"
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-foreground tracking-wide">Tipo</label>
                    <select value={couponForm.type} onChange={e => setCouponForm(prev => ({ ...prev, type: e.target.value as 'percentage' | 'value' }))} className="w-full mt-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary">
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="value">Valor (R$)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSaveCoupon} className="gold-gradient text-primary-foreground px-6 py-2 text-sm font-medium">SALVAR</button>
                  <button onClick={() => setShowAddCoupon(false)} className="border border-border text-foreground px-6 py-2 text-sm">CANCELAR</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {couponsList.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2">Nenhum cupom cadastrado.</p>
              )}
              {couponsList.map(c => (
                <div key={c.id} className="bg-card border border-border rounded-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-primary tracking-wider">{c.code}</span>
                    <span className={`text-xs px-2 py-1 rounded-sm ${c.active ? 'gold-gradient text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{c.active ? 'Ativo' : 'Inativo'}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Desconto: {c.type === 'percentage' ? `${c.discount}%` : `R$ ${c.discount.toFixed(2)}`}</p>
                    <p>Usos: {c.currentUses}/{c.maxUses} • Limite/cliente: {c.usesPerClient}</p>
                    <p>Validade: {c.validUntil}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleEditCategory(cat)} className="text-muted-foreground hover:text-primary"><Edit size={14} /></button>
                    <button onClick={() => handleDeleteCoupon(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedidos */}
        {activeTab === 'pedidos' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">Pedidos</h2>
            {ordersList.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum pedido realizado.</p>
            )}
            <div className="space-y-4">
              {ordersList.map(order => (
                <OrderCard key={order.id} order={order} onStatusChange={handleOrderStatusChange} onTrackingSave={handleTrackingSave} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OrderCard = ({ order, onStatusChange, onTrackingSave }: { order: any; onStatusChange: (id: string, s: OrderStatus) => void; onTrackingSave: (id: string, t: string, c: string) => void }) => {
  const [tracking, setTracking] = useState(order.trackingCode || '');
  const [carrier, setCarrier] = useState(order.carrier || '');

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-sm font-medium text-foreground">{order.id}</span>
          <span className="text-xs text-muted-foreground ml-3">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
        <select
          value={order.status}
          className="text-xs border border-border rounded-sm px-3 py-1.5 bg-background focus:outline-none focus:border-primary"
          onChange={e => onStatusChange(order.id, e.target.value as OrderStatus)}
        >
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Cliente</p>
          <p className="text-foreground font-medium">{order.customerName}</p>
          <p className="text-muted-foreground">{order.customerEmail}</p>
          <p className="text-muted-foreground">{order.customerPhone}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Endereço</p>
          <p className="text-foreground">{order.address.street}, {order.address.number}</p>
          <p className="text-muted-foreground">{order.address.city}/{order.address.state}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Valor</p>
          <p className="text-foreground font-semibold text-lg">R$ {order.total.toFixed(2)}</p>
          <p className="text-xs text-primary">{order.priceType === 'resale' ? 'Revenda' : 'Normal'}</p>
        </div>
      </div>
      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Itens do Pedido</p>
          <div className="space-y-1">
            {order.items.map((item: any, idx: number) => (
              <p key={idx} className="text-sm text-foreground">
                {item.quantity}x {item.product.name} — R$ {(item.priceType === 'resale' ? item.product.priceResale : item.product.priceNormal).toFixed(2)}
              </p>
            ))}
          </div>
        </div>
      )}
      {/* Tracking */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Rastreio</p>
        <div className="flex flex-wrap gap-2">
          <input
            value={tracking}
            onChange={e => setTracking(e.target.value)}
            className="flex-1 min-w-[150px] border border-border rounded-sm py-1.5 px-3 text-sm bg-background focus:outline-none focus:border-primary"
            placeholder="Código de rastreio"
          />
          <input
            value={carrier}
            onChange={e => setCarrier(e.target.value)}
            className="w-36 border border-border rounded-sm py-1.5 px-3 text-sm bg-background focus:outline-none focus:border-primary"
            placeholder="Transportadora"
          />
          <button onClick={() => onTrackingSave(order.id, tracking, carrier)} className="gold-gradient text-primary-foreground px-4 py-1.5 text-sm font-medium">SALVAR</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
