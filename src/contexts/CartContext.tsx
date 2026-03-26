import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: CartItem) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  couponCode: string;
  setCouponCode: (code: string) => void;
  discount: number;
  setDiscount: (d: number) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, item: CartItem) => {
    setItems(prev => prev.map((it, i) => i === index ? item : it));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode('');
    setDiscount(0);
  }, []);

  const totalItems = items.reduce((sum, item) => {
    const qty = item.priceType === 'resale'
      ? Object.values(item.sizeDistribution).reduce((a, b) => a + b, 0)
      : item.quantity;
    return sum + qty;
  }, 0);

  const totalPrice = items.reduce((sum, item) => {
    const price = item.priceType === 'resale' ? item.product.priceResale : item.product.priceNormal;
    const qty = item.priceType === 'resale'
      ? Object.values(item.sizeDistribution).reduce((a, b) => a + b, 0)
      : item.quantity;
    return sum + price * qty;
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem, clearCart, totalItems, totalPrice, couponCode, setCouponCode, discount, setDiscount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
