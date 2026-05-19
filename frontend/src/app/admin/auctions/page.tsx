"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  condition?: string;
  is_foil?: boolean;
  category?: { name: string };
}

interface Auction {
  id: number;
  product_id: number;
  start_price: number;
  current_price: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export default function AuctionsAdmin() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingAuctionId, setEditingAuctionId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    product_id: 1,
    start_price: 0,
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16) // Default 24h
  });

  const fetchData = async () => {
    try {
      const [aucRes, prodRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?visibility=admin`)
      ]);
      if (!aucRes.ok) {
        console.error("Auction API Error:", await aucRes.text());
        throw new Error("Auction API returned error");
      }
      if (!prodRes.ok) {
        console.error("Product API Error:", await prodRes.text());
        throw new Error("Product API returned error");
      }
      const [aucData, prodData] = await Promise.all([aucRes.json(), prodRes.json()]);
      setAuctions(aucData);
      setProducts(prodData);
      
      if (prodData.length > 0) {
        setFormData(prev => ({ ...prev, product_id: prodData[0].id, start_price: prodData[0].price }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    try {
      // Necesitamos enviar tiempos como formato ISO estándar
      const payload = {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString()
      };

      const isEditing = editingAuctionId !== null;
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/auctions/${editingAuctionId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/auctions`;
      const method = isEditing ? "PUT" : "POST";

      const toastId = toast.loading(isEditing ? 'Actualizando...' : 'Creando subasta...');

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(isEditing ? 'Subasta actualizada' : 'Subasta creada', { id: toastId });
        setShowForm(false);
        setEditingAuctionId(null);
        resetForm();
        fetchData(); // Refresh list
      } else {
        toast.error('Error guardando subasta', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: products.length > 0 ? products[0].id : 1,
      start_price: products.length > 0 ? products[0].price : 0,
      start_time: new Date().toISOString().slice(0, 16),
      end_time: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    });
    setEditingAuctionId(null);
  };

  const handleEdit = (auction: Auction) => {
    // Format dates to datetime-local expected format (YYYY-MM-DDTHH:mm)
    const formatDateTimeLocal = (dateString: string) => {
      const d = new Date(dateString);
      // We need local time, pad correctly
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormData({
      product_id: auction.product_id,
      start_price: auction.start_price,
      start_time: formatDateTimeLocal(auction.start_time),
      end_time: formatDateTimeLocal(auction.end_time)
    });
    setEditingAuctionId(auction.id);
    setShowForm(true);
  };

  const handleDelete = async (auctionId: number) => {
    if (!confirm("¿Seguro que deseas eliminar esta subasta?")) return;
    const token = localStorage.getItem("auth_token");
    const toastId = toast.loading('Eliminando...');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/${auctionId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Subasta eliminada', { id: toastId });
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || 'Error eliminando la subasta', { id: toastId });
      }
    } catch (err) {
      toast.error('Error de conexión', { id: toastId });
    }
  };

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  const getProductName = (id: number) => {
    const prod = products.find(p => p.id === id);
    return prod ? prod.name : `Producto #${id}`;
  };

  if (loading) return <div className="p-8 text-white">Cargando subastas...</div>;

  return (
    <div className="min-h-screen bg-brand-blue pb-12">
      {/* Navbar */}
      <nav className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/admin/dashboard"}>
            &larr; Volver
          </Button>
          <span className="text-white font-black italic tracking-widest uppercase ml-4">Gestión de Subastas</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-white">Arena de Subastas</h1>
          <Button variant="primary" onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              setShowForm(true);
            }
          }}>
            {showForm ? "Cancelar" : "+ Nueva Subasta"}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingAuctionId ? "Editar Subasta" : "Configurar Nueva Subasta"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-1 md:col-span-3">
                <label className="text-xs text-white/60 font-bold uppercase">Producto a Subastar (Desde Inventario)</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow">
                    <select 
                      value={formData.product_id} 
                      onChange={e => {
                        const pid = parseInt(e.target.value);
                        const prod = products.find(p => p.id === pid);
                        setFormData({...formData, product_id: pid, start_price: prod?.price || 0});
                      }} 
                      className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors"
                    >
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (Venta regular: {formatCRC(p.price)})</option>)}
                    </select>
                    <p className="text-[10px] text-white/40 mt-2 italic">
                      Las subastas heredan automáticamente la imagen y las etiquetas (tags) del producto en inventario.
                    </p>
                  </div>
                  
                  {/* Vista Previa del Producto */}
                  {products.find(p => p.id === formData.product_id) && (
                    <div className="w-full md:w-64 bg-black/20 border border-white/5 rounded p-3 flex gap-3 items-center flex-shrink-0">
                      <div className="w-16 h-16 bg-black/40 rounded overflow-hidden flex-shrink-0">
                        {products.find(p => p.id === formData.product_id)?.image_url ? (
                          <img src={products.find(p => p.id === formData.product_id)?.image_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-white/20">NO IMG</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="text-sm font-bold text-white truncate">{products.find(p => p.id === formData.product_id)?.name}</span>
                        <div className="flex flex-wrap gap-1">
                          <span className="bg-white/10 text-white text-[9px] px-1 rounded uppercase">{products.find(p => p.id === formData.product_id)?.condition}</span>
                          {products.find(p => p.id === formData.product_id)?.category && <span className="bg-purple-600/60 text-white text-[9px] px-1 rounded uppercase">{products.find(p => p.id === formData.product_id)?.category?.name}</span>}
                          {products.find(p => p.id === formData.product_id)?.is_foil && <span className="bg-yellow-500 text-black text-[9px] px-1 font-bold rounded uppercase">Foil</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Monto Mínimo de Salida (CRC)</label>
                <input 
                  type="number" 
                  required 
                  min="0" 
                  value={Number.isNaN(formData.start_price) ? "" : formData.start_price} 
                  onChange={e => setFormData({...formData, start_price: parseFloat(e.target.value)})} 
                  className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors" 
                />
                <p className="text-[10px] text-white/40 mt-1">Precio en el que arranca la puja</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Fecha y Hora de Inicio</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={formData.start_time} 
                  onChange={e => setFormData({...formData, start_time: e.target.value})} 
                  className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors" 
                  style={{ colorScheme: "dark" }}
                />
                <p className="text-[10px] text-white/40 mt-1">Momento en que la subasta aparecerá al público</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Fecha y Hora de Cierre</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={formData.end_time} 
                  onChange={e => setFormData({...formData, end_time: e.target.value})} 
                  className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors" 
                  style={{ colorScheme: "dark" }}
                />
                <p className="text-[10px] text-white/40 mt-1">Momento exacto en que se cerrará el martillo</p>
              </div>

              <div className="md:col-span-3 mt-4 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => {setShowForm(false); resetForm();}}>Cancelar</Button>
                <Button variant="primary" type="submit" className="shadow-[0_0_15px_rgba(255,222,0,0.3)]">
                  {editingAuctionId ? "Guardar Cambios" : "Iniciar Subasta"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de Subastas */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left text-white">
            <thead className="bg-black/40 text-xs uppercase tracking-widest text-white/60 border-b border-white/10">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Producto</th>
                <th className="p-4 text-right">Precio Inicial</th>
                <th className="p-4 text-right">Puja Actual</th>
                <th className="p-4">Cierre</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map(a => {
                const now = new Date();
                const startTime = new Date(a.start_time);
                const endTime = new Date(a.end_time);
                let statusBadge;
                
                if (endTime <= now) {
                  statusBadge = <span className="bg-white/10 text-white/40 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Finalizada</span>;
                } else if (startTime > now) {
                  statusBadge = <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-blue-500/30">Programada</span>;
                } else {
                  statusBadge = <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-green-500/30"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Activa</span>;
                }

                return (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-white/40">#{a.id}</td>
                    <td className="p-4 font-bold">{getProductName(a.product_id)}</td>
                    <td className="p-4 text-right text-white/60 font-mono">{formatCRC(a.start_price)}</td>
                    <td className="p-4 text-right text-brand-yellow font-black text-lg">{formatCRC(a.current_price)}</td>
                    <td className="p-4 text-sm text-white/80">
                      I: {startTime.toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' })}<br/>
                      <span className="text-brand-yellow">C: {endTime.toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </td>
                    <td className="p-4 text-center">
                      {statusBadge}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(a)} className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/40 transition-colors" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors" title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {auctions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">No hay subastas en el historial.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
