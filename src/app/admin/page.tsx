"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
// NUEVO 1: Importamos la librería de compresión
import imageCompression from 'browser-image-compression'; 

const CATEGORIES = [
  "Todos", "Cuidado Personal", "Abarrotes", "Bebidas", 
  "Snacks y Golosinas", "Refrigerados y Congelados", 
  "Limpieza del Hogar", "Comida Preparada", "Frutas y Verduras"
];

// --- ESQUEMA DE PRODUCTOS ---
const productSchema = z.object({
  name: z.string().min(3, "Mínimo 3 letras"),
  price: z.coerce.number().min(0.01, "Precio mayor a 0"),
  stock: z.coerce.number().int().min(0, "Stock no negativo"),
  category: z.string().min(1, "Selecciona una categoría"),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminPage() {
  const router = useRouter(); 

  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { name: "", price: 0, stock: 0, category: "", description: "" },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Credenciales incorrectas ❌");
    setAuthLoading(false);
  };

  const handleLogout = async () => await supabase.auth.signOut();

  // --- FUNCIÓN DE GUARDAR PRODUCTO + COMPRESIÓN ---
  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    let imageUrl = "";

    try {
      if (imageFile) {
        // 👇 NUEVO 2: Configuración de la compresión
        const options = {
          maxSizeMB: 0.2, // Máximo 200 KB (perfecto para web)
          maxWidthOrHeight: 800, // Ajusta el tamaño a 800px máximo
          useWebWorker: true, // Usa el máximo poder del procesador
        };

        // 👇 NUEVO 3: Ejecutamos la compresión
        console.log(`Peso original: ${imageFile.size / 1024 / 1024} MB`);
        const compressedFile = await imageCompression(imageFile, options);
        console.log(`Peso comprimido: ${compressedFile.size / 1024 / 1024} MB`);

        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        // 👇 NUEVO 4: Subimos el archivo COMPRIMIDO, no el original
        const { error: uploadError } = await supabase.storage
          .from("product-images") 
          .upload(fileName, compressedFile); 

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase.from("products").insert([
        {
          name: data.name,
          price: Number(data.price),
          stock: Number(data.stock),
          category: data.category,
          description: data.description,
          image_url: imageUrl || null,
        },
      ]);

      if (dbError) throw dbError;

      alert("✅ ¡Producto guardado con éxito! (Imagen optimizada)");
      reset();
      setImageFile(null); 
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-700">
          <h1 className="text-2xl font-bold text-blue-400 mb-6 text-center">Acceso Privado 🔒</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="text-xs font-bold text-slate-400 uppercase">Correo</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-slate-900 rounded border border-slate-700 focus:border-blue-500 outline-none" required /></div>
            <div><label className="text-xs font-bold text-slate-400 uppercase">Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-slate-900 rounded border border-slate-700 focus:border-blue-500 outline-none" required /></div>
            <button type="submit" disabled={authLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold rounded">{authLoading ? "Verificando..." : "Entrar al Sistema"}</button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-700 text-center"><button onClick={() => router.push('/')} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition-colors">← Cancelar y Volver</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-400">Admin</h1>
          <div className="flex gap-4 items-center">
            <Link href="/admin/sales" className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500 font-bold">
              Ver Ventas 💰
            </Link>                       
            <Link href="/" className="text-sm bg-slate-700 px-3 py-1 rounded hover:bg-slate-600">Ver Tienda</Link>
            <button onClick={handleLogout} className="text-sm bg-red-600 px-3 py-1 rounded hover:bg-red-500">Salir</button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-800 p-6 rounded-xl shadow-xl space-y-4 border border-slate-700">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Foto (Se optimizará automáticamente) ⚡</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full p-2 bg-slate-900 rounded border border-slate-700 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase">Producto</label><input {...register("name")} className="w-full p-3 bg-slate-900 rounded border border-slate-700 outline-none" /></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase">Categoría</label><select {...register("category")} className="w-full p-3 bg-slate-900 rounded border border-slate-700 outline-none"><option value="">Seleccionar...</option>{CATEGORIES.filter(c => c !== "Todos").map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
          <div className="flex gap-4"><div className="w-1/2"><label className="text-xs font-bold text-slate-400 uppercase">Precio ($)</label><input {...register("price")} type="number" step="0.01" className="w-full p-3 bg-slate-900 rounded border border-slate-700 outline-none" /></div><div className="w-1/2"><label className="text-xs font-bold text-slate-400 uppercase">Stock</label><input {...register("stock")} type="number" className="w-full p-3 bg-slate-900 rounded border border-slate-700 outline-none" /></div></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase">Descripción</label><textarea {...register("description")} rows={3} className="w-full p-3 bg-slate-900 rounded border border-slate-700 outline-none" /></div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors">{isLoading ? "Optimizando y Subiendo..." : "Guardar Producto"}</button>
        </form>
      </div>
    </div>
  );
}