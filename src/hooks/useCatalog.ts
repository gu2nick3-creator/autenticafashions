import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { Category, Product } from "@/types/api";

export function useCatalog() {
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: () => api.get<Product[]>("/products") });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: () => api.get<Category[]>("/categories") });

  return {
    products: productsQuery.data || [],
    categories: categoriesQuery.data || [],
    loading: productsQuery.isLoading || categoriesQuery.isLoading,
    error: productsQuery.error || categoriesQuery.error,
    refetch: async () => { await Promise.all([productsQuery.refetch(), categoriesQuery.refetch()]); },
  };
}
