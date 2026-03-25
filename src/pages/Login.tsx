import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister) {
      if (!name || !cpf || !email || !password) {
        toast.error("Preencha nome completo, CPF, e-mail e senha.");
        return;
      }
      const result = register({ name, cpf, email, password });
      if (!result.ok) {
        toast.error(result.message || "Não foi possível criar a conta.");
        return;
      }
      toast.success("Conta criada com sucesso!");
      navigate("/minha-conta");
      return;
    }

    if (!email || !password) {
      toast.error("Preencha login e senha.");
      return;
    }

    const result = login(email, password);
    if (!result.ok) {
      toast.error(result.message || "Login inválido.");
      return;
    }

    toast.success("Login realizado com sucesso!");
    navigate(result.isAdmin ? "/admin" : "/minha-conta");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-secondary">
        <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-8">
          <h1 className="font-heading font-black text-2xl text-center mb-2 uppercase">{isRegister ? "Criar conta" : "Entrar"}</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isRegister ? "O mesmo local serve para o cliente criar a conta." : "Admin e clientes entram por aqui."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-heading font-semibold uppercase mb-1">Nome completo</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-border rounded px-3 py-2.5 text-sm bg-background outline-none focus:border-accent transition" placeholder="Seu nome completo" />
                </div>
                <div>
                  <label className="block text-xs font-heading font-semibold uppercase mb-1">CPF</label>
                  <input type="text" value={cpf} onChange={e => setCpf(e.target.value)} className="w-full border border-border rounded px-3 py-2.5 text-sm bg-background outline-none focus:border-accent transition" placeholder="000.000.000-00" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-heading font-semibold uppercase mb-1">{isRegister ? "E-mail" : "E-mail ou usuário"}</label>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-border rounded px-3 py-2.5 text-sm bg-background outline-none focus:border-accent transition" placeholder={isRegister ? "seu@email.com" : "Digite ADM ou seu e-mail"} />
            </div>
            <div>
              <label className="block text-xs font-heading font-semibold uppercase mb-1">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-border rounded px-3 py-2.5 text-sm bg-background outline-none focus:border-accent transition" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-accent text-accent-foreground font-heading font-bold text-sm py-3 rounded hover:opacity-90 transition uppercase tracking-wider">
              {isRegister ? "Criar conta" : "Entrar"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-muted-foreground">
            {isRegister ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button onClick={() => setIsRegister(!isRegister)} className="text-accent font-semibold hover:underline">
              {isRegister ? "Fazer login" : "Cadastre-se"}
            </button>
          </p>

          <div className="mt-4 p-3 bg-shop-price-hidden rounded">
            <p className="text-xs text-muted-foreground text-center">
              Painel ADM: use <strong>ADM</strong> e senha <strong>ADM123@</strong>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
