"use client";

import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeItem, clearCart, total } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");

// 👇 TU NÚMERO DE TELÉFONO (Formato internacional: 593 para Ecuador)
  const PHONE_NUMBER = "593985586543";

const handleCheckout = async () => {
    if (!customerName.trim()) return alert("Por favor escribe tu nombre");
    setLoading(true);

    try {
      // 1. Guardamos en Supabase (Tu respaldo secreto)
      const { error } = await supabase.from("sales").insert([
        {
          total: total,
          items: items,
          customer_name: customerName,
        },
      ]);

      if (error) throw error;

      // 2. CREAMOS EL MENSAJE DE WHATSAPP 💬
      // Usamos %0A para saltos de línea
      let message = `Nuevo pedido desde la web, Hola, buen día \nMi nombre es *${customerName}*. \nQuisiera confirmar disponibilidad y precio: \n`;
      message += `--------------------------------\n`;
      
      
      items.forEach((item) => {
        message += `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}\n`;
      });

      message += `\n*TOTAL A PAGAR: $${total.toFixed(2)}*`;
      message += `\n\n(Pedido enviado desde la Web)`;
      message += `Hora: ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      // 3. ABRIMOS WHATSAPP AUTOMÁTICAMENTE
      // encodeURIComponent convierte los espacios y símbolos para que la URL los entienda
      const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank'); // Abre en nueva pestaña

      // 4. LIMPIEZA
      alert("¡Pedido generado! Se abrirá WhatsApp para enviarlo. 📲");
      clearCart();
      router.push("/"); 

    } catch (error) {
      console.error(error);
      alert("Error al procesar el pedido en la base de datos ❌");
    } finally {
      setLoading(false);
    }
  };

  // SI EL CARRITO ESTÁ VACÍO
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-400 mb-4">Tu carrito está vacío 🛒</h1>
        <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700">
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  // SI HAY PRODUCTOS
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Tu Pedido 📝</h1>

      {/* LISTA DE PRODUCTOS */}
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500">
                ${item.price} x {item.quantity} unidades
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-blue-600">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RESUMEN DE PAGO */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl text-gray-600">Total a Pagar:</span>
          <span className="text-3xl font-bold text-green-600">${total.toFixed(2)}</span>
        </div>

        {/* FORMULARIO SIMPLE */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-500 mb-2">Tu Nombre:</label>
          <input 
            type="text" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            className="w-full p-3 bg-gray-50 rounded border border-gray-300 focus:border-blue-500 outline-none text-black"
          />
        </div>

        <button 
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 bg-green-600 text-white font-bold text-xl rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-md"
        >
          {loading ? "Procesando..." : "✅ Confirmar Pedido"}
        </button>
        
        <Link href="/" className="block text-center mt-4 text-gray-500 text-sm hover:text-blue-500">
          ← Seguir comprando
        </Link>
      </div>
    </div>
  );
}