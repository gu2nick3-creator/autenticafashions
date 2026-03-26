import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CheckoutRetorno = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 bg-secondary/40 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-border bg-card p-6 md:p-10 shadow-sm">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground font-heading">Checkout</p>
        <h1 className="mt-3 font-heading font-black text-3xl uppercase">Retorno do pagamento</h1>
        <p className="mt-4 text-muted-foreground leading-7">Esta tela ficou preparada para integração real com InfinitePay pelo backend. Ao ativar as credenciais e o webhook, este retorno pode consultar o status do pagamento diretamente na API.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/minha-conta" className="rounded-xl bg-accent px-5 py-3 text-sm font-heading font-bold uppercase text-accent-foreground">Ir para Minha Conta</Link>
          <Link to="/produtos" className="rounded-xl border border-border px-5 py-3 text-sm font-heading font-bold uppercase">Continuar comprando</Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default CheckoutRetorno;
