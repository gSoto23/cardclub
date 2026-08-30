"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  display_order: number;
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error(err);
      toast.error("Error cargando categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchData();
  }, []);

  const handleUpdate = async (id: number, name: string, display_order: number) => {
    const token = localStorage.getItem("auth_token");
    const toastId = toast.loading('Guardando...');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, display_order })
      });
      
      if (res.ok) {
        toast.success("Categoría actualizada", { id: toastId });
        fetchData();
      } else {
        toast.error("Error al actualizar", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión", { id: toastId });
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando categorías...</div>;

  return (
    <div className="min-h-screen bg-brand-blue pb-12">
      {/* Navbar */}
      <nav className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/admin/dashboard"}>
            &larr; Volver
          </Button>
          <span className="text-white font-black italic tracking-widest uppercase ml-4">Gestión de Categorías</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Categorías de la Tienda</h1>
          <p className="text-white/60 text-sm mt-2">
            Configura el orden en que aparecerán las secciones en la tienda. Un número menor indica mayor prioridad (ej. 1 aparece de primero).
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-white">
            <thead className="bg-black/40 text-xs uppercase tracking-widest text-white/60 border-b border-white/10">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Nombre de Categoría</th>
                <th className="p-4 text-center">Orden de Visualización</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-white/40">#{c.id}</td>
                  <td className="p-4">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => setCategories(categories.map(cat => cat.id === c.id ? { ...cat, name: e.target.value } : cat))}
                      className="bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white text-sm w-full outline-none focus:border-brand-yellow"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="number"
                      value={c.display_order}
                      onChange={(e) => setCategories(categories.map(cat => cat.id === c.id ? { ...cat, display_order: parseInt(e.target.value) || 0 } : cat))}
                      className="bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white text-sm w-24 text-center outline-none focus:border-brand-yellow mx-auto"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleUpdate(c.id, c.name, c.display_order)}
                    >
                      Guardar
                    </Button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/40">No hay categorías configuradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
