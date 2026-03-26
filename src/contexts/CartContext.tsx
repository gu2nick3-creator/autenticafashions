import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type CartItem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface CartCtx {
  items: CartItem[];
  wishlist: string[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string, size: string, color: string) => Promise<void>;
  updateQty: (productId: string, size: string, color: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartCtx>({} as CartCtx);
export const useCart = () => useContext(CartContext);
export type { CartItem };

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const refreshCart = async () => {
    if (!isLoggedIn) {
      setItems([]);
      setWishlist([]);
      return;
    }
    try {
      const [cartRes, wishRes] = await Promise.all([api.getCart(), api.getWishlist()]);
      setItems(cartRes.items);
      setWishlist(wishRes.wishlist);
    } catch {
      setItems([]);
      setWishlist([]);
    }
  };

  useEffect(() => {
    void refreshCart();
  }, [isLoggedIn]);

  const findItemId = (productId: string, size: string, color: string) =>
    items.find((item) => item.productId === productId && item.size === size && item.color === color)?.id;

  const addToCart = async (item: CartItem) => {
    const res = await api.addToCart(item);
    setItems(res.items);
  };

  const removeFromCart = async (productId: string, size: string, color: string) => {
    const itemId = findItemId(productId, size, color);
    if (!itemId) return;
    const res = await api.removeCartItem(itemId);
    setItems(res.items);
  };

  const updateQty = async (productId: string, size: string, color: string, qty: number) => {
    const itemId = findItemId(productId, size, color);
    if (!itemId) return;
    const res = await api.updateCartItem(itemId, qty);
    setItems(res.items);
  };

  const clearCart = async () => {
    await api.clearCart();
    setItems([]);
  };

  const toggleWishlist = async (productId: string) => {
    const res = await api.toggleWishlist(productId);
    setWishlist(res.wishlist);
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const value = useMemo(() => ({ items, wishlist, addToCart, removeFromCart, updateQty, clearCart, toggleWishlist, isInWishlist, cartCount: items.reduce((a, b) => a + b.qty, 0), refreshCart }), [items, wishlist]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
