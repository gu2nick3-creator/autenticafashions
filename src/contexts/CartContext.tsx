import React, { createContext, useContext, useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  qty: number;
  unitPrice?: number;
  priceType?: "normal" | "revenda";
  selectedSizes?: string[];
  isResaleKit?: boolean;
}

interface CartCtx {
  items: CartItem[];
  wishlist: string[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartCount: number;
}

const CartContext = createContext<CartCtx>({} as CartCtx);
export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const s = localStorage.getItem("af_cart");
    return s ? JSON.parse(s) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const s = localStorage.getItem("af_wish");
    return s ? JSON.parse(s) : [];
  });

  const save = (i: CartItem[]) => { setItems(i); localStorage.setItem("af_cart", JSON.stringify(i)); };

  const addToCart = useCallback((item: CartItem) => {
    setItems(prev => {
      const idx = prev.findIndex(x => x.productId === item.productId && x.size === item.size && x.color === item.color && JSON.stringify(x.selectedSizes || []) === JSON.stringify(item.selectedSizes || []));
      const next = idx >= 0
        ? prev.map((x, i) => i === idx ? { ...x, qty: x.qty + item.qty } : x)
        : [...prev, item];
      localStorage.setItem("af_cart", JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId: string, size: string, color: string) => {
    setItems(prev => {
      const next = prev.filter(x => !(x.productId === productId && x.size === size && x.color === color));
      localStorage.setItem("af_cart", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQty = useCallback((productId: string, size: string, color: string, qty: number) => {
    setItems(prev => {
      const next = prev.map(x => x.productId === productId && x.size === size && x.color === color ? { ...x, qty } : x);
      localStorage.setItem("af_cart", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => save([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev => {
      const next = prev.includes(productId) ? prev.filter(x => x !== productId) : [...prev, productId];
      localStorage.setItem("af_wish", JSON.stringify(next));
      return next;
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  return (
    <CartContext.Provider value={{ items, wishlist, addToCart, removeFromCart, updateQty, clearCart, toggleWishlist, isInWishlist, cartCount: items.reduce((a, b) => a + b.qty, 0) }}>
      {children}
    </CartContext.Provider>
  );
};
