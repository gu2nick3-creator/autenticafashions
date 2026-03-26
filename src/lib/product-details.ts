import type { Product } from "@/lib/api";

export const getAdminProductMatch = (product: Product) => product;

export const getResolvedProductData = (product: Product) => ({
  sizes: product.sizes,
  colors: product.colors,
  productType: product.productType || "sapatos",
  adminMatch: product,
});
