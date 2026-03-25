import type { Product } from "@/types/api";

export const getProductPrices = (product: Product) => ({
  normalPrice: Number(product.normalPrice || 0),
  resalePrice: Number(product.resalePrice || 0),
});

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
