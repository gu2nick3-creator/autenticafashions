export type InfinitePayItem = {
  quantity: number;
  price: number; // centavos
  description: string;
};

export type InfinitePayAddress = {
  cep: string;
  street?: string;
  neighborhood?: string;
  number: string;
  complement?: string;
};

export type InfinitePayCustomer = {
  name: string;
  email: string;
  phone_number?: string;
};

const HANDLE = "autentica_fashion";
const LINK_ENDPOINT = "https://api.infinitepay.io/invoices/public/checkout/links";
const CHECK_ENDPOINT = "https://api.infinitepay.io/invoices/public/checkout/payment_check";

export async function createInfinitePayCheckout(payload: {
  orderNsu: string;
  redirectUrl: string;
  webhookUrl?: string;
  items: InfinitePayItem[];
  customer?: InfinitePayCustomer;
  address?: InfinitePayAddress;
}) {
  const response = await fetch(LINK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle: HANDLE,
      order_nsu: payload.orderNsu,
      redirect_url: payload.redirectUrl,
      webhook_url: payload.webhookUrl,
      items: payload.items,
      customer: payload.customer,
      address: payload.address,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Falha ao criar checkout da InfinitePay.");
  }

  return response.json() as Promise<{ url?: string }>;
}

export async function checkInfinitePayPayment(payload: {
  orderNsu: string;
  transactionNsu: string;
  slug: string;
}) {
  const response = await fetch(CHECK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle: HANDLE,
      order_nsu: payload.orderNsu,
      transaction_nsu: payload.transactionNsu,
      slug: payload.slug,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Falha ao verificar pagamento da InfinitePay.");
  }

  return response.json() as Promise<{
    success?: boolean;
    paid?: boolean;
    amount?: number;
    paid_amount?: number;
    installments?: number;
    capture_method?: "pix" | "credit_card" | string;
  }>;
}

export const infinitePayHandle = HANDLE;
