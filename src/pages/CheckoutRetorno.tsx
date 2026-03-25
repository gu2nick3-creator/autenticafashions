import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CheckoutRetorno = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "success";
  const order = searchParams.get("order") || "-";
  const paid = status === "success";
  return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 bg-secondary/40 px-4 py-10 md:py-16"><div className="mx-auto max-w-3xl rounded-[28px] border border-border bg-card p-6 md:p-10 shadow-sm"><p className="text-xs uppercase tracking-[0.28em] text-muted-foreground font-heading">Checkout</p><h1 className="mt-3 font-heading font-black text-3xl uppercase">{paid ? "Pedido criado com sucesso" : "Pagamento pendente"}</h1><p className="mt-4 text-muted-foreground leading-7">{paid ? "Seu pedido foi salvo no backend e já aparece na área do cliente e no painel administrativo." : "O pagamento ainda não foi confirmado. Quando a integração real da InfinitePay estiver conectada, este retorno poderá ser validado automaticamente."}</p><div className="mt-8 grid gap-4 md:grid-cols-2"><Info label="Pedido" value={order} /><Info label="Status" value={paid ? "Sucesso" : "Pendente"} /></div><div className="mt-8 flex flex-wrap gap-3"><Link to="/minha-conta" className="rounded-xl bg-accent px-5 py-3 text-sm font-heading font-bold uppercase text-accent-foreground">Ir para Minha Conta</Link><Link to="/produtos" className="rounded-xl border border-border px-5 py-3 text-sm font-heading font-bold uppercase">Continuar comprando</Link></div></div></main><Footer /></div>;
};
const Info = ({ label, value }: { label: string; value: string }) => <div className="rounded-2xl border border-border bg-background p-4"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">{label}</p><p className="mt-2 break-all text-sm font-medium">{value}</p></div>;
export default CheckoutRetorno;
