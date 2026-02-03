"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // O "../../lib/supabase" según te funcione
import Link from "next/link";

const CATEGORIES = [
  "Todos", "Cuidado Personal", "Abarrotes", "Bebidas", 
  "Snacks y Golosinas", "Refrigerados y Congelados", 
  "Limpieza del Hogar", "Comida Preparada", "Frutas y Verduras"
];

export default function StorePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isLoading, setIsLoading] = useState(true);

  // 1. CARGAR PRODUCTOS AL INICIAR
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. FILTRADO INTELIGENTE
  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 pb-20">
      
      {/* --- ENCABEZADO FIJO --- */}
      <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-700">OmniStore Cundualo 🛒</h1>
          <p className="text-xs text-gray-500">Abierto hasta las 10pm</p>
        </div>
        <Link href="/admin" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          ⚙️
        </Link>
      </header>

      {/* --- PESTAÑAS DE CATEGORÍA --- */}
      <div className="bg-white border-b border-gray-100 py-2 sticky top-14 z-10">
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- GRILLA DE PRODUCTOS --- */}
      <main className="p-4">
        {isLoading ? (
          <p className="text-center text-gray-400 mt-10">Cargando bodega...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-gray-400 text-lg">No hay productos aquí 📦</p>
            <p className="text-sm text-gray-400">Selecciona otra categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden">
                
                {/* 👇👇👇 AQUÍ ESTÁ LA MAGIA DE LAS IMÁGENES 👇👇👇 */}
                {product.image_url ? (
                  // Si tiene imagen, mostramos la foto
                  <div className="h-32 mb-3 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  // Si NO tiene imagen, mostramos el Emoji de siempre
                  <div className="h-32 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-4xl">
                    {getEmoji(product.category)}
                  </div>
                )}
                {/* 👆👆👆 FIN DE LA MAGIA 👆👆👆 */}

                <div>
                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2 truncate">
                    {product.description || "Sin descripción"}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-blue-600 text-lg">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <button className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold hover:bg-green-200">
                    + Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function getEmoji(category: string) {
  switch (category) {
    case "Cuidado Personal": return "🧼";
    case "Abarrotes": return "🥫";
    case "Bebidas": return "🥤";
    case "Snacks y Golosinas": return "🍪";
    case "Refrigerados y Congelados": return "🧊";
    case "Limpieza del Hogar": return "🧽";
    case "Comida Preparada": return "🍽️";
    case "Frutas y Verduras": return "🥦";
    default: return "📦";
  }
}