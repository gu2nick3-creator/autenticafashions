import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Preencha todos os campos'); return; }
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success('Bem-vinda!');
        navigate('/');
      } else {
        toast.error('E-mail ou senha inválidos');
      }
    } catch {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-16 flex justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-semibold text-foreground">Entrar</h1>
            <div className="w-12 h-0.5 gold-gradient mx-auto mt-3"></div>
            <p className="text-sm text-muted-foreground mt-4">Acesse sua conta para ver preços exclusivos</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-8 border border-border rounded-sm">
            <div>
              <label className="text-xs font-medium text-foreground tracking-wide">E-MAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 border border-border rounded-sm py-2.5 px-4 text-sm bg-background focus:outline-none focus:border-primary" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground tracking-wide">SENHA</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 border border-border rounded-sm py-2.5 px-4 text-sm bg-background focus:outline-none focus:border-primary" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full gold-gradient text-primary-foreground py-3 font-medium text-sm tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Não tem conta? <Link to="/cadastro" className="text-primary font-medium hover:text-gold-dark">Cadastre-se</Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
