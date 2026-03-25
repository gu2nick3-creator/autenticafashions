import type { Product } from "@/types/api";

export const getAdminProductMatch = (product: Product) => ({
  id: product.id,
  name: product.name,
  productType: product.productType,
  sizes: product.sizes,
  colors: product.colors.map((item) => item.name),
  normalPrice: product.normalPrice,
  resalePrice: product.resalePrice,
});

export const getResolvedProductData = (product: Product) => ({
  sizes: product.sizes,
  colors: product.colors,
  productType: product.productType,
  adminMatch: getAdminProductMatch(product),
});
