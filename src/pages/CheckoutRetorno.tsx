import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { checkInfinitePayPayment } from "@/lib/infinitepay";
import { getPendingCheckout, persistPaidOrder, removePendingCheckout } from "@/lib/order-storage";

const CheckoutRetorno = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [message, setMessage] = useState("Validando seu pagamento...");

  const orderNsu = searchParams.get("order_nsu") || "";
  const slug = searchParams.get("slug") || "";
  const transactionNsu = searchParams.get("transaction_nsu") || "";
  const receiptUrl = searchParams.get("receipt_url") || "";
  const captureMethod = searchParams.get("capture_method") || "";

  const pendingOrder = useMemo(() => (orderNsu ? getPendingCheckout(orderNsu) : undefined), [orderNsu]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!orderNsu || !slug || !transactionNsu) {
        setStatus("error");
        setMessage("Parâmetros do retorno da InfinitePay não vieram completos.");
        return;
      }

      try {
        const result = await checkInfinitePayPayment({ orderNsu, slug, transactionNsu });
        if (!active) return;

        if (result.paid && pendingOrder) {
          persistPaidOrder({
            ...pendingOrder,
            paymentMethod: captureMethod || result.capture_method || "InfinitePay",
            paymentStatus: "Pago",
            receiptUrl: receiptUrl || pendingOrder.receiptUrl,
            transactionNsu,
            invoiceSlug: slug,
            status: pendingOrder.status || "Em preparo",
          });
          removePendingCheckout(orderNsu);
          clearCart();
          setStatus("success");
          setMessage("Pagamento confirmado e pedido criado com sucesso.");
          return;
        }

        if (result.paid && !pendingOrder) {
          setStatus("pending");
          setMessage("Pagamento confirmado, mas o pedido temporário não foi encontrado neste navegador.");
          return;
        }

        setStatus("pending");
        setMessage("Seu pagamento ainda não aparece como aprovado. Confira novamente em alguns instantes.");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Não foi possível validar o pagamento.");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [orderNsu, slug, transactionNsu, captureMethod, receiptUrl, pendingOrder, clearCart]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/40 px-4 py-10 md:py-16">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-border bg-card p-6 md:p-10 shadow-sm">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground font-heading">Checkout InfinitePay</p>
          <h1 className="mt-3 font-heading font-black text-3xl uppercase">
            {status === "success" ? "Pagamento aprovado" : status === "pending" ? "Pagamento em análise" : status === "error" ? "Não foi possível concluir" : "Validando pagamento"}
          </h1>
          <p className="mt-4 text-muted-foreground leading-7">{message}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Info label="Pedido" value={orderNsu || "-"} />
            <Info label="Forma de pagamento" value={captureMethod || "InfinitePay"} />
            <Info label="Transação" value={transactionNsu || "-"} />
            <Info label="Fatura" value={slug || "-"} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/minha-conta" className="rounded-xl bg-accent px-5 py-3 text-sm font-heading font-bold uppercase text-accent-foreground">
              Ir para Minha Conta
            </Link>
            <Link to="/produtos" className="rounded-xl border border-border px-5 py-3 text-sm font-heading font-bold uppercase">
              Continuar comprando
            </Link>
            {receiptUrl ? (
              <a href={receiptUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-border px-5 py-3 text-sm font-heading font-bold uppercase">
                Ver comprovante
              </a>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-border bg-background p-4">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-heading">{label}</p>
    <p className="mt-2 break-all text-sm font-medium">{value}</p>
  </div>
);

export default CheckoutRetorno;
