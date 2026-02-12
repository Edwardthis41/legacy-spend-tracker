"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<any[]>([]);
  
  // 🔒 ESTADO INICIAL: DENEGADO POR DEFECTO
  // No asumimos nada. Empezamos en "Cargando" y sin permiso.
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const protectRoute = async () => {
      console.log("👮‍♂️ Guardia: Iniciando revisión de seguridad...");
      
      // 1. Preguntamos al servidor de Supabase si el usuario es real
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.log("⛔ Guardia: Acceso DENEGADO. Redirigiendo...");
        router.replace("/admin"); // .replace evita que usen el botón "Atrás"
        return;
      }

      console.log("✅ Guardia: Acceso CONCEDIDO a:", user.email);
      setIsAuthorized(true);
      
      // 2. Solo si pasó el guardia, cargamos las ventas
      fetchSales();
    };

    protectRoute();
  }, [router]);

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error cargando ventas:", error);
    else setSales(data || []);
    
    // Quitamos la pantalla de carga al final
    setLoading(false);
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

  // 🚫 SI ESTÁ CARGANDO O NO ESTÁ AUTORIZADO, MOSTRAMOS PANTALLA NEGRA
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="animate-pulse">Verificando Credenciales... 🔐</p>
      </div>
    );
  }

  // ✅ SI LLEGAMOS AQUÍ, ES PORQUE PASAMOS TODAS LAS PRUEBAS
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Historial de Ventas 📈</h1>
          <p className="text-gray-400">Total acumulado: <span className="text-green-400 font-bold">${totalRevenue.toFixed(2)}</span></p>
        </div>
        <Link href="/admin" className="bg-slate-700 px-4 py-2 rounded hover:bg-slate-600">
          ← Volver al Admin
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {sales.length === 0 ? (
          <div className="text-center p-10 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-gray-400 text-lg">Aún no hay ventas registradas.</p>
          </div>
        ) : (
          sales.map((sale) => (
            <div key={sale.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-white">
                    {sale.customer_name || "Cliente Anónimo"}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {new Date(sale.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-2xl font-bold text-green-400">
                    ${Number(sale.total).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <ul className="space-y-1">
                  {Array.isArray(sale.items) && sale.items.map((item: any, index: number) => (
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