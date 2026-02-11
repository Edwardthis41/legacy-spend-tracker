"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Definimos cómo se ve un producto en el carrito
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

// Definimos qué funciones tendrá nuestra "Mochila"
type CartContextType = {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Función para agregar producto
  const addItem = (product: any) => {
    setItems((prev) => {
      // ¿El producto ya está en el carrito?
      const existing = prev.find((item) => item.id === product.id);
      
      if (existing) {
        // Si ya está, solo aumentamos la cantidad (+1)
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Si no está, lo agregamos como nuevo con cantidad 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Función para quitar producto
  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Función para vaciar el carrito (después de pagar)
  const clearCart = () => setItems([]);

  // Calcular el total automáticamente
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar el carrito en cualquier página
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
}