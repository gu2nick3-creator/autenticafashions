import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orders';
import { ORDER_STATUS_LABELS, Order } from '@/types';
import { User, Package, Truck, MapPin, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const tabs = [
  { id: 'dados', label: 'Meus Dados', icon: User },
  { id: 'pedidos', label: 'Pedidos', icon: Package },
  { id: 'rastreio', label: 'Rastreio', icon: Truck },
  { id: 'enderecos', label: 'Endereços', icon: MapPin },
];

const ClientPanel = () => {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dados');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', cpfCnpj: user?.cpfCnpj || '' });
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    orderService.getMyOrders().then(setOrders).catch(() => {});
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" />;

  const handleSave = async () => {
    try {
      await updateUser(form);
      setEditMode(false);
      toast.success('Dados atualizados!');
    } catch {
      toast.error('Erro ao atualizar dados');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Minha Conta</h1>
            <div className="w-12 h-0.5 gold-gradient mt-3"></div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <LogOut size={16} /> Sair
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="md:col-span-1">
            <div className="bg-card border border-border rounded-sm overflow-hidden">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${activeTab === tab.id ? 'bg-cream text-primary font-medium border-l-2 border-primary' : 'text-muted-foreground hover:bg-cream/50'}`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3 bg-card border border-border rounded-sm p-6">
            {activeTab === 'dados' && (
              <div>
                <h2 className="font-display text-xl font-medium text-foreground mb-6">Dados Pessoais</h2>
                {editMode ? (
                  <div className="space-y-4 max-w-md">
                    {[
                      { key: 'name', label: 'Nome', value: form.name },
                      { key: 'phone', label: 'Telefone', value: form.phone },
                      { key: 'cpfCnpj', label: 'CPF/CNPJ', value: form.cpfCnpj },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs font-medium text-foreground tracking-wide">{f.label}</label>
                        <input value={f.value} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full mt-1 border border-border rounded-sm py-2 px-3 text-sm bg-background focus:outline-none focus:border-primary" />
                      </div>
                    ))}
                    <div className="flex gap-3">
                      <button onClick={handleSave} className="gold-gradient text-primary-foreground px-6 py-2 text-sm font-medium">SALVAR</button>
                      <button onClick={() => setEditMode(false)} className="border border-border text-foreground px-6 py-2 text-sm">CANCELAR</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm"><span className="text-muted-foreground">Nome:</span> <span className="text-foreground font-medium">{user?.name}</span></div>
                    <div className="text-sm"><span className="text-muted-foreground">E-mail:</span> <span className="text-foreground font-medium">{user?.email}</span></div>
                    <div className="text-sm"><span className="text-muted-foreground">Telefone:</span> <span className="text-foreground font-medium">{user?.phone || '—'}</span></div>
                    <div className="text-sm"><span className="text-muted-foreground">CPF/CNPJ:</span> <span className="text-foreground font-medium">{user?.cpfCnpj || '—'}</span></div>
                    <button onClick={() => setEditMode(true)} className="mt-4 border border-primary text-primary px-6 py-2 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all">EDITAR DADOS</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pedidos' && (
              <div>
                <h2 className="font-display text-xl font-medium text-foreground mb-6">Meus Pedidos</h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum pedido realizado.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border border-border rounded-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{order.id}</span>
                          <span className="text-xs px-3 py-1 gold-gradient text-primary-foreground rounded-sm">{ORDER_STATUS_LABELS[order.status]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Data: {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                          <p>Total: R$ {order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rastreio' && (
              <div>
                <h2 className="font-display text-xl font-medium text-foreground mb-6">Rastreio</h2>
                {orders.filter(o => o.trackingCode).map(order => (
                  <div key={order.id} className="border border-border rounded-sm p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{order.id}</span>
                      <span className="text-xs px-3 py-1 gold-gradient text-primary-foreground rounded-sm">{ORDER_STATUS_LABELS[order.status]}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Código: <span className="text-foreground font-medium">{order.trackingCode}</span></p>
                      <p>Transportadora: <span className="text-foreground">{order.carrier}</span></p>
                    </div>
                  </div>
                ))}
                {orders.filter(o => o.trackingCode).length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum rastreio disponível.</p>
                )}
              </div>
            )}

            {activeTab === 'enderecos' && (
              <div>
                <h2 className="font-display text-xl font-medium text-foreground mb-6">Endereços Salvos</h2>
                {user?.address?.street ? (
                  <div className="border border-border rounded-sm p-4">
                    <p className="text-sm text-foreground">{user.address.street}, {user.address.number}</p>
                    <p className="text-sm text-muted-foreground">{user.address.neighborhood} - {user.address.city}/{user.address.state}</p>
                    <p className="text-sm text-muted-foreground">{user.address.zip}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClientPanel;
