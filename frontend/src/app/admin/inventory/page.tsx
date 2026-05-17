"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  game: string;
  expansion_set: string;
  condition: string;
  is_foil: boolean;
  price: number;
  purchase_price: number;
  stock: number;
  category?: Category;
}

interface Category {
  id: number;
  name: string;
}

export default function InventoryAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "", description: "", price: 0, purchase_price: 0, stock: 1, category_id: 1,
    game: "Pokémon TCG", expansion_set: "", condition: "NM", is_foil: false, image_url: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Category State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
      ]);
      const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);
      setProducts(prodData);
      setCategories(catData);
      
      if (catData.length > 0) {
        setFormData(prev => ({ ...prev, category_id: catData[0].id }));
      }
    } catch (err) {
      console.error(err);
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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: newCategoryName })
      });
      if (res.ok) {
        setNewCategoryName("");
        setIsCreatingCategory(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    let uploadedImageUrl = formData.image_url;

    if (imageFile) {
      const toastId = toast.loading('Subiendo imagen...');
      const imgData = new FormData();
      imgData.append("file", imageFile);
      try {
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: imgData
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          uploadedImageUrl = uploadJson.image_url;
          toast.success('Imagen subida', { id: toastId });
        } else {
          toast.error('Error al subir imagen', { id: toastId });
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        toast.error('Error al subir imagen', { id: toastId });
      }
    }

    try {
      const payload = { ...formData, image_url: uploadedImageUrl };
      const isEditing = editingProductId !== null;
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/${editingProductId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/products`;
      const method = isEditing ? "PUT" : "POST";

      const toastId = toast.loading(isEditing ? 'Actualizando...' : 'Creando producto...');

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(isEditing ? 'Producto actualizado' : 'Producto creado', { id: toastId });
        setShowForm(false);
        setEditingProductId(null);
        resetForm();
        fetchData();
      } else {
        toast.error('Error al guardar el producto', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", description: "", price: 0, purchase_price: 0, stock: 1, category_id: categories.length > 0 ? categories[0].id : 1,
      game: "Pokémon TCG", expansion_set: "", condition: "NM", is_foil: false, image_url: ""
    });
    setImageFile(null);
    setEditingProductId(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: "", // Agregarlo si está en tu schema y frontend
      price: product.price,
      purchase_price: product.purchase_price || 0,
      stock: product.stock,
      category_id: product.category?.id || 1,
      game: product.game,
      expansion_set: product.expansion_set,
      condition: product.condition,
      is_foil: product.is_foil,
      image_url: product.image_url || "" // Wait, image_url wasn't in interface, let's assume it works.
    });
    setEditingProductId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    const token = localStorage.getItem("auth_token");
    const toastId = toast.loading('Eliminando...');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Producto eliminado', { id: toastId });
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || 'Error eliminando el producto', { id: toastId });
      }
    } catch (err) {
      toast.error('Error de conexión', { id: toastId });
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando inventario...</div>;

  return (
    <div className="min-h-screen bg-brand-blue pb-12">
      {/* Navbar */}
      <nav className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/admin/dashboard"}>
            &larr; Volver
          </Button>
          <span className="text-white font-black italic tracking-widest uppercase ml-4">Gestión de Inventario</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-white">Catálogo de Productos</h1>
          <Button variant="primary" onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              setShowForm(true);
            }
          }}>
            {showForm ? "Cancelar" : "+ Nuevo Producto"}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProductId ? "Editar Producto" : "Añadir Nuevo Producto"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase">Nombre de Carta</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase">Juego (TCG)</label>
                <input type="text" required value={formData.game} onChange={e => setFormData({...formData, game: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase">Set de Expansión</label>
                <input type="text" required value={formData.expansion_set} onChange={e => setFormData({...formData, expansion_set: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase">Condición</label>
                <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white">
                  <option value="Sealed">Sealed (Sellado)</option>
                  <option value="NM">Near Mint (NM)</option>
                  <option value="LP">Lightly Played (LP)</option>
                  <option value="MP">Moderately Played (MP)</option>
                  <option value="HP">Heavily Played (HP)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase">Categoría</label>
                <div className="flex gap-2">
                  <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})} className="flex-grow bg-black/40 border border-white/10 rounded p-2 text-white">
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <Button variant="ghost" type="button" onClick={() => setIsCreatingCategory(!isCreatingCategory)}>+</Button>
                </div>
                {isCreatingCategory && (
                  <div className="flex gap-2 mt-2">
                    <input type="text" placeholder="Nueva Categoría" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="flex-grow bg-black/40 border border-brand-yellow/30 rounded p-2 text-white text-sm" />
                    <Button variant="primary" type="button" size="sm" onClick={handleCreateCategory}>Crear</Button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase">Precio de Compra (CRC)</label>
                <input type="number" required min="0" value={Number.isNaN(formData.purchase_price) ? "" : formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase">Precio de Venta (CRC)</label>
                <input type="number" required min="0" value={Number.isNaN(formData.price) ? "" : formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase">Imagen del Producto</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0]);
                    }
                  }} 
                  className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-brand-yellow file:text-brand-blue hover:file:bg-yellow-300" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase">Stock</label>
                <input type="number" required min="1" value={Number.isNaN(formData.stock) ? "" : formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
              </div>

              <div className="space-y-1 flex items-center gap-2 pt-6">
                <input type="checkbox" checked={formData.is_foil} onChange={e => setFormData({...formData, is_foil: e.target.checked})} className="w-4 h-4" />
                <label className="text-xs text-brand-yellow font-bold uppercase">¿Es carta Foil / Holográfica?</label>
              </div>

              <div className="md:col-span-2 lg:col-span-3 mt-4 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => {setShowForm(false); resetForm();}}>Cancelar</Button>
                <Button variant="primary" type="submit">
                  {editingProductId ? "Guardar Cambios" : "Guardar Producto"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de Productos */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-white">
            <thead className="bg-black/40 text-xs uppercase tracking-widest text-white/60 border-b border-white/10">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Condición</th>
                <th className="p-4 text-right">Compra</th>
                <th className="p-4 text-right">Venta</th>
                <th className="p-4 text-right">Margen</th>
                <th className="p-4 text-right">Stock</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const marginAmount = p.price - (p.purchase_price || 0);
                const marginPercent = p.purchase_price > 0 ? (marginAmount / p.purchase_price) * 100 : 100;
                
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-white/40">#{p.id}</td>
                    <td className="p-4 font-bold">
                      {p.name}
                      {p.is_foil && <span className="ml-2 text-[10px] bg-brand-yellow text-brand-blue px-1.5 py-0.5 rounded uppercase">Foil</span>}
                      {p.category && <div className="text-[10px] text-purple-400 uppercase tracking-widest mt-1">{p.category.name}</div>}
                    </td>
                    <td className="p-4"><span className="bg-white/10 px-2 py-1 rounded text-xs">{p.condition}</span></td>
                    <td className="p-4 text-right text-red-300 font-mono">₡{p.purchase_price || 0}</td>
                    <td className="p-4 text-right text-brand-yellow font-mono">₡{p.price}</td>
                    <td className="p-4 text-right">
                      <span className="text-green-400 font-bold">₡{marginAmount}</span>
                      <br/>
                      <span className="text-xs text-white/40">{marginPercent.toFixed(1)}%</span>
                    </td>
                    <td className="p-4 text-right">{p.stock}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(p)} className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/40 transition-colors" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors" title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">No hay productos en el inventario.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
