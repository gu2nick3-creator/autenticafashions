import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { authService } from '@/services/auth';
import { supabase } from '@/lib/supabase';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Digite seu e-mail');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('Se o e-mail existir, enviamos as instruções para redefinir sua senha.');
    } catch {
      toast.error('Não foi possível solicitar a redefinição de senha');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Senha redefinida com sucesso!');
      navigate('/');
    } catch {
      toast.error('Não foi possível redefinir a senha');
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
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Redefinir Senha
            </h1>
            <div className="w-12 h-0.5 gold-gradient mx-auto mt-3"></div>
            <p className="text-sm text-muted-foreground mt-4">
              {recoveryMode
                ? 'Digite sua nova senha.'
                : 'Digite seu e-mail para receber as instruções de redefinição.'}
            </p>
          </div>

          {recoveryMode ? (
            <form
              onSubmit={handleSetNewPassword}
              className="space-y-4 bg-card p-8 border border-border rounded-sm"
            >
              <div>
                <label className="text-xs font-medium text-foreground tracking-wide">
                  NOVA SENHA
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 border border-border rounded-sm py-2.5 px-4 text-sm bg-background focus:outline-none focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground tracking-wide">
                  CONFIRMAR SENHA
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 border border-border rounded-sm py-2.5 px-4 text-sm bg-background focus:outline-none focus:border-primary"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient text-primary-foreground py-3 font-medium text-sm tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'SALVANDO...' : 'SALVAR NOVA SENHA'}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleReset}
              className="space-y-4 bg-card p-8 border border-border rounded-sm"
            >
              <div>
                <label className="text-xs font-medium text-foreground tracking-wide">
                  E-MAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 border border-border rounded-sm py-2.5 px-4 text-sm bg-background focus:outline-none focus:border-primary"
                  placeholder="seu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient text-primary-foreground py-3 font-medium text-sm tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'ENVIANDO...' : 'REDEFINIR SENHA'}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Lembrou sua senha?{' '}
                <Link to="/login" className="text-primary font-medium hover:text-gold-dark">
                  Entrar
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
