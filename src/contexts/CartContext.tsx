import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import type { CartItem } from "@/types/api";

interface CartCtx {
  items: CartItem[];
  wishlist: number[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: number, size: string, color: string) => Promise<void>;
  updateQty: (productId: number, size: string, color: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartCtx>({} as CartCtx);
export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      setWishlist([]);
      return;
    }
    try {
      const data = await api.get<{ items: CartItem[]; wishlist: number[] }>("/account/cart");
      setItems(data.items || []);
      setWishlist(data.wishlist || []);
    } catch {
      setItems([]);
      setWishlist([]);
    }
  }, [isLoggedIn]);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addToCart = useCallback(async (item: CartItem) => {
    await api.post("/account/cart/items", item);
    await refreshCart();
  }, [refreshCart]);

  const removeFromCart = useCallback(async (productId: number, size: string, color: string) => {
    await api.post("/account/cart/remove", { productId, size, color });
    await refreshCart();
  }, [refreshCart]);

  const updateQty = useCallback(async (productId: number, size: string, color: string, qty: number) => {
    await api.post("/account/cart/update", { productId, size, color, qty });
    await refreshCart();
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    await api.delete("/account/cart");
    await refreshCart();
  }, [refreshCart]);

  const toggleWishlist = useCallback(async (productId: number) => {
    await api.post("/account/wishlist/toggle", { productId });
    await refreshCart();
  }, [refreshCart]);

  const isInWishlist = useCallback((productId: number) => wishlist.includes(productId), [wishlist]);

  const value = useMemo(() => ({ items, wishlist, addToCart, removeFromCart, updateQty, clearCart, toggleWishlist, isInWishlist, cartCount: items.reduce((a, b) => a + b.qty, 0), refreshCart }), [items, wishlist, addToCart, removeFromCart, updateQty, clearCart, toggleWishlist, isInWishlist, refreshCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
