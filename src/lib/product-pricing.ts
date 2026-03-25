import type { Product } from "@/data/products";
import { getAdminProductMatch } from "@/lib/product-details";

const fallbackFromId = (productId: string) => {
  const numeric = Number(String(productId).replace(/\D/g, "")) || 1;
  return {
    normalPrice: 199.9 + (numeric - 1) * 10,
    resalePrice: 139.9 + (numeric - 1) * 8,
  };
};

export const getProductPrices = (product: Product) => {
  const match = getAdminProductMatch(product);

  if (match) {
    return {
      normalPrice: Number(match.normalPrice || 0),
      resalePrice: Number(match.resalePrice || 0),
    };
  }

  return fallbackFromId(product.id);
};

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
