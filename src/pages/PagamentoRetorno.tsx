import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { checkInfinitePayment } from "@/lib/infinitepay";
import { PENDING_CHECKOUT_KEY, readJson, saveOrder, StoredOrder } from "@/lib/order-storage";

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

type PendingCheckout = {
  orderId: string;
  customerId?: string;
  clientName: string;
  clientEmail: string;
  address: string;
  addressLabel?: string;
  total: number;
  createdAt: string;
  itemsCount: number;
  orderItems: Array<{ productId: string; name: string; size: string; color: string; qty: number }>;
};

const PagamentoRetorno = () => {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<"checking" | "paid" | "unpaid" | "error">("checking");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paidAmount, setPaidAmount] = useState<number | null>(null);

  const pending = useMemo(() => readJson<PendingCheckout | null>(PENDING_CHECKOUT_KEY, null), []);

  useEffect(() => {
    const order_nsu = params.get("order_nsu") || "";
    const slug = params.get("slug") || "";
    const transaction_nsu = params.get("transaction_nsu") || "";
    const receipt_url = params.get("receipt_url") || "";

    const run = async () => {
      if (!pending || !order_nsu || !slug || !transaction_nsu) {
        setStatus("error");
        return;
      }

      try {
        const result = await checkInfinitePayment({ order_nsu, slug, transaction_nsu });
        if (!result.success || !result.paid) {
          setStatus("unpaid");
          return;
        }

        const order: StoredOrder = {
          id: pending.orderId,
          customerId: pending.customerId,
          clientName: pending.clientName,
          clientEmail: pending.clientEmail,
          address: pending.address,
          addressLabel: pending.addressLabel,
          status: "Pagamento aprovado",
          trackingCode: "",
          items: pending.itemsCount,
          total: pending.total,
          createdAt: pending.createdAt,
          paymentMethod: result.capture_method === "pix" ? "Pix - InfinitePay" : "Cartão - InfinitePay",
          paymentStatus: "Pago",
          receiptUrl: receipt_url || undefined,
          infinitepay: {
            slug,
            transactionNsu: transaction_nsu,
            captureMethod: result.capture_method,
            paidAmount: typeof result.paid_amount === "number" ? result.paid_amount / 100 : undefined,
          },
          orderItems: pending.orderItems,
        };

        saveOrder(order);
        localStorage.removeItem(PENDING_CHECKOUT_KEY);
        localStorage.removeItem("af_cart");
        setReceiptUrl(receipt_url);
        setPaymentMethod(order.paymentMethod);
        setPaidAmount(typeof result.paid_amount === "number" ? result.paid_amount / 100 : pending.total);
        setStatus("paid");
        toast.success("Pagamento confirmado e pedido criado com sucesso.");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    run();
  }, [params, pending]);

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <div className="container-shop flex-1 py-12">
        <div className="max-w-2xl mx-auto bg-background border border-border rounded-3xl p-8 md:p-10 text-center">
          {status === "checking" && (
            <>
              <Loader2 className="w-12 h-12 mx-auto text-accent animate-spin" />
              <h1 className="font-heading font-black text-2xl uppercase mt-6">Validando pagamento</h1>
              <p className="text-muted-foreground mt-2">Estamos confirmando o retorno da InfinitePay para gerar seu pedido.</p>
            </>
          )}

          {status === "paid" && (
            <>
              <CheckCircle2 className="w-14 h-14 mx-auto text-green-600" />
              <h1 className="font-heading font-black text-2xl uppercase mt-6">Pagamento aprovado</h1>
              <p className="text-muted-foreground mt-2">Seu pedido já foi criado e agora aparece no painel do cliente e no painel admin deste projeto.</p>
              <div className="mt-6 grid sm:grid-cols-2 gap-4 text-left">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs uppercase text-muted-foreground">Pedido</p>
                  <p className="font-semibold mt-1">{pending?.orderId}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs uppercase text-muted-foreground">Valor pago</p>
                  <p className="font-semibold mt-1">{money(paidAmount ?? pending?.total ?? 0)}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs uppercase text-muted-foreground">Pagamento</p>
                  <p className="font-semibold mt-1">{paymentMethod}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs uppercase text-muted-foreground">Entrega</p>
                  <p className="font-semibold mt-1">{pending?.addressLabel || "Endereço selecionado"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                <Link to="/minha-conta" className="bg-accent text-accent-foreground font-heading font-bold text-sm px-6 py-3 rounded-2xl uppercase">Ver meus pedidos</Link>
                <Link to="/admin" className="border border-border font-heading font-bold text-sm px-6 py-3 rounded-2xl uppercase">Abrir painel admin</Link>
                {receiptUrl && <a href={receiptUrl} target="_blank" rel="noreferrer" className="border border-border font-heading font-bold text-sm px-6 py-3 rounded-2xl uppercase">Comprovante</a>}
              </div>
            </>
          )}

          {status === "unpaid" && (
            <>
              <AlertCircle className="w-14 h-14 mx-auto text-amber-500" />
              <h1 className="font-heading font-black text-2xl uppercase mt-6">Pagamento ainda não confirmado</h1>
              <p className="text-muted-foreground mt-2">A InfinitePay retornou sem confirmação de pagamento. Você pode tentar novamente pelo checkout.</p>
              <div className="mt-8">
                <Link to="/carrinho" className="bg-accent text-accent-foreground font-heading font-bold text-sm px-6 py-3 rounded-2xl uppercase">Voltar ao checkout</Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-14 h-14 mx-auto text-destructive" />
              <h1 className="font-heading font-black text-2xl uppercase mt-6">Não foi possível validar</h1>
              <p className="text-muted-foreground mt-2">O retorno da InfinitePay não veio completo ou a validação falhou. Tente novamente pelo checkout.</p>
              <div className="mt-8">
                <Link to="/carrinho" className="bg-accent text-accent-foreground font-heading font-bold text-sm px-6 py-3 rounded-2xl uppercase">Voltar ao checkout</Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PagamentoRetorno;
