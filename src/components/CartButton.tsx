"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartButton() {
  const { items, total } = useCart();

  // Si no hay productos, escondemos el botón
  if (items.length === 0) return null;

  return (
    <Link href="/cart">
      <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-3 hover:bg-green-700 transition-all z-50 animate-bounce">
        
        {/* Icono del Carrito */}
        <span className="text-xl">🛒</span>

        {/* Contador de Productos */}
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm">
            {items.length} {items.length === 1 ? "Producto" : "Productos"}
          </span>
          <span className="text-xs font-light">
            Total: ${total.toFixed(2)}
          </span>
        </div>

        {/* Flecha */}
        <span>➜</span>
      </div>
    </Link>
  );
}