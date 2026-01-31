"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const CATEGORIES = [
  "Cuidado Personal",
  "Abarrotes",
  "Bebidas",
  "Snacks y Golosinas",
  "Refrigerados y Congelados",
  "Limpieza del Hogar",
  "Comida Preparada",
  "Frutas y Verduras"
];

// 1. Esquema de validación
const productSchema = z.object({
  name: z.string().min(3, "Mínimo 3 letras"),
  // Zod coerce convierte el string del input a number automáticamente
  price: z.coerce.number().min(0.01, "Precio mayor a 0"),
  stock: z.coerce.number().int().min(0, "Stock no negativo"),
  category: z.string().min(1, "Selecciona una categoría"),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    // 👇👇👇 AQUÍ ESTÁ EL TRUCO DEL SENIOR 👇👇👇
    // Agregamos 'as any' para que TypeScript deje de pelear por los tipos de number/unknown
    resolver: zodResolver(productSchema) as any, 
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      category: "",
      description: "",
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("products").insert([
        {
          name: data.name,
          price: Number(data.price),
          stock: Number(data.stock),
          category: data.category,
          description: data.description,
        },
      ]);
      
      if (error) throw error;
      
      alert("✅ Producto registrado correctamente");
      reset();
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar en la base de datos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-400">Administración</h1>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">Ir a la Tienda →</Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-800 p-6 rounded-xl shadow-xl space-y-4 border border-slate-700">
          
          {/* Nombre */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Producto</label>
            <input 
              {...register("name")} 
              className="w-full p-3 bg-slate-900 rounded border border-slate-700 focus:border-blue-500 outline-none" 
              placeholder="Ej: Atún Real" 
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Categoría */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Categoría</label>
            <select 
              {...register("category")} 
              className="w-full p-3 bg-slate-900 rounded border border-slate-700 focus:border-blue-500 outline-none"
            >
              <option value="">Seleccionar...</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
          </div>

          {/* Precio y Stock */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-xs font-bold text-slate-400 uppercase">Precio ($)</label>
              <input 
                {...register("price")} 
                type="number" 
                step="0.01" 
                className="w-full p-3 bg-slate-900 rounded border border-slate-700 focus:border-blue-500 outline-none" 
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div className="w-1/2">
              <label className="text-xs font-bold text-slate-400 uppercase">Stock</label>
              <input 
                {...register("stock")} 
                type="number" 
                className="w-full p-3 bg-slate-900 rounded border border-slate-700 focus:border-blue-500 outline-none" 
              />
              {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          {/* Descripción (Recuperada) */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Descripción (Opcional)</label>
            <textarea 
              {...register("description")} 
              rows={3}
              className="w-full p-3 bg-slate-900 rounded border border-slate-700 focus:border-blue-500 outline-none" 
              placeholder="Detalles extra: 250ml, Pack de 6, etc..." 
            />
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors">
            {isLoading ? "Guardando..." : "Guardar Producto"}
          </button>
        </form>
      </div>
    </div>
  );
}