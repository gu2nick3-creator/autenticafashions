import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', cpfCnpj: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Preencha os campos obrigatórios'); return; }
    if (form.password !== form.confirmPassword) { toast.error('As senhas não conferem'); return; }
    setLoading(true);
    try {
      const success = await register({ name: form.name, email: form.email, phone: form.phone, cpfCnpj: form.cpfCnpj, password: form.password });
      if (success) {
        toast.success('Conta criada com sucesso!');
        navigate('/');
      } else {
        toast.error('Erro ao criar conta');
      }
    } catch {
      toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'NOME COMPLETO', type: 'text', placeholder: 'Seu nome' },
    { key: 'email', label: 'E-MAIL', type: 'email', placeholder: 'seu@email.com' },
    { key: 'phone', label: 'TELEFONE', type: 'tel', placeholder: '(00) 00000-0000' },
    { key: 'cpfCnpj', label: 'CPF / CNPJ', type: 'text', placeholder: '000.000.000-00' },
    { key: 'password', label: 'SENHA', type: 'password', placeholder: '••••••••' },
    { key: 'confirmPassword', label: 'CONFIRMAR SENHA', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-16 flex justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-semibold text-foreground">Criar Conta</h1>
            <div className="w-12 h-0.5 gold-gradient mx-auto mt-3"></div>
            <p className="text-sm text-muted-foreground mt-4">Cadastre-se para acessar preços exclusivos de atacado</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-8 border border-border rounded-sm">
            {fields.map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium text-foreground tracking-wide">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)} className="w-full mt-1 border border-border rounded-sm py-2.5 px-4 text-sm bg-background focus:outline-none focus:border-primary" placeholder={f.placeholder} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full gold-gradient text-primary-foreground py-3 font-medium text-sm tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'CRIANDO...' : 'CRIAR CONTA'}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta? <Link to="/login" className="text-primary font-medium hover:text-gold-dark">Entrar</Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
