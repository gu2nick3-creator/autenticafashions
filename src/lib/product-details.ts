import type { Product } from "@/data/products";

export type AdminProduct = {
  id: string;
  sku?: string;
  name: string;
  image?: string;
  category?: string;
  productType?: "roupas" | "sapatos";
  sizes?: string[];
  colors?: string[];
  normalPrice: number;
  resalePrice: number;
  createdAt?: string;
};

const STORAGE_KEY = "af_admin_products";

const readAdminProducts = (): AdminProduct[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminProduct[]) : [];
  } catch {
    return [];
  }
};

const colorMap: Record<string, string> = {
  preto: "#111111",
  branco: "#FFFFFF",
  nude: "#D2B48C",
  rosa: "#E8909C",
  vermelho: "#C62828",
  azul: "#1E4DB7",
  verde: "#2E7D32",
  amarelo: "#FBC02D",
  bege: "#D7C2A3",
  marrom: "#6D4C41",
  dourado: "#C9A227",
  prata: "#B0BEC5",
  laranja: "#EF6C00",
  roxo: "#7E57C2",
};

export const getAdminProductMatch = (product: Product) => {
  const adminProducts = readAdminProducts();
  return adminProducts.find((item) => item.id === product.id) || adminProducts.find((item) => item.name.trim().toLowerCase() === product.name.trim().toLowerCase()) || null;
};

export const getResolvedProductData = (product: Product) => {
  const adminMatch = getAdminProductMatch(product);
  const sizes = adminMatch?.sizes?.length ? adminMatch.sizes : product.sizes;
  const colors = adminMatch?.colors?.length
    ? adminMatch.colors.map((name, index) => ({
        name,
        hex: colorMap[name.trim().toLowerCase()] || product.colors[index % product.colors.length]?.hex || "#cccccc",
      }))
    : product.colors;
  return {
    sizes,
    colors,
    productType: adminMatch?.productType || "sapatos",
    adminMatch,
  };
};
