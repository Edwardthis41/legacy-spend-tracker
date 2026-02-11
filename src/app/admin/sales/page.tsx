"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar ventas al entrar
  useEffect(() => {
    const fetchSales = async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false }); // Las más nuevas primero

      if (error) console.error("Error cargando ventas:", error);
      else setSales(data || []);
      setLoading(false);
    };

    fetchSales();
  }, []);

  // Calcular el total vendido hoy (Opcional, matemática simple)
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

  if (loading) return <div className="p-10 text-white">Cargando libro contable...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      
      {/* ENCABEZADO */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Historial de Ventas 📈</h1>
          <p className="text-gray-400">Total acumulado: <span className="text-green-400 font-bold">${totalRevenue.toFixed(2)}</span></p>
        </div>
        <Link href="/admin" className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600">
          ← Volver al Admin
        </Link>
      </div>

      {/* LISTA DE VENTAS */}
      <div className="max-w-4xl mx-auto space-y-4">
        {sales.length === 0 ? (
          <p className="text-center text-gray-500">Aún no hay ventas registradas.</p>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-white">
                    {sale.customer_name || "Cliente Anónimo"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Fecha: {new Date(sale.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-green-400">
                    ${Number(sale.total).toFixed(2)}
                  </span>
                  <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
                    Venta #{sale.id}
                  </span>
                </div>
              </div>

              {/* DETALLE DE PRODUCTOS (El JSON) */}
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Productos Comprados:</p>
                <ul className="space-y-1">
                  {sale.items.map((item: any, index: number) => (
                    <li key={index} className="flex justify-between text-sm text-gray-300 border-b border-slate-800 pb-1 last:border-0">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}