import React, { createContext, useContext, useState, useCallback } from 'react';
import { randomId } from '../lib/ids';
import type { CartItem, MenuItem } from '../types';

interface CartContextValue {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity: number, notes: string) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  total: 0,
  itemCount: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((menuItem: MenuItem, quantity: number, notes: string) => {
    setItems((prev) => {
      const normalizedNotes = notes.trim();
      const existing = prev.find((i) => i.menu_item_id === menuItem.id && i.notes === normalizedNotes);
      if (existing) {
        return prev.map((i) =>
          i.cart_item_id === existing.cart_item_id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          cart_item_id: randomId(menuItem.id),
          menu_item_id: menuItem.id,
          menu_item: menuItem,
          quantity,
          notes: normalizedNotes,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cart_item_id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => sum + i.menu_item.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
