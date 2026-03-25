import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useSearchParams } from "react-router-dom";

const PagamentoRetorno = () => {
  const [params] = useSearchParams();
  const order = params.get("order") || "-";
  return <div className="min-h-screen flex flex-col bg-secondary/30"><Header /><div className="container-shop flex-1 py-12"><div className="max-w-2xl mx-auto bg-background border border-border rounded-3xl p-8 md:p-10 text-center"><h1 className="font-heading font-black text-2xl uppercase mt-6">Retorno do pagamento</h1><p className="text-muted-foreground mt-2">O backend está preparado para validar o retorno real da InfinitePay quando as credenciais forem conectadas.</p><div className="mt-6 rounded-2xl border border-border p-4"><p className="text-xs uppercase text-muted-foreground">Pedido</p><p className="font-semibold mt-1">{order}</p></div><div className="flex flex-wrap gap-3 justify-center mt-8"><Link to="/minha-conta" className="bg-accent text-accent-foreground font-heading font-bold text-sm px-6 py-3 rounded-2xl uppercase">Ver meus pedidos</Link><Link to="/carrinho" className="border border-border font-heading font-bold text-sm px-6 py-3 rounded-2xl uppercase">Voltar ao checkout</Link></div></div></div><Footer /></div>;
};

export default PagamentoRetorno;
