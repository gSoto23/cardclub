"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  condition: string;
  is_foil: boolean;
}

interface SaleItem {
  id: number;
  description: string;
  price: number;
  quantity: number;
  reference_type: string;
}

interface Sale {
  id: number;
  total_amount: number;
  payment_method: string;
  status: string;
  sale_type: string;
  sale_date: string;
  items: SaleItem[];
}

export default function SalesAdmin() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"POS" | "Historial">("POS");
  
  // POS State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [searchTerm, setSearchTerm] = useState("");
  const [addQuantities, setAddQuantities] = useState<Record<number, number>>({});

  // History State
  const [sales, setSales] = useState<Sale[]>([]);
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("sale_date");
  const [order, setOrder] = useState("desc");

  const LIMIT = 10;

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchProducts();
    fetchSales();
  }, [page, startDate, endDate, sortBy, order]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/products");
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSales = async () => {
    try {
      let url = `http://127.0.0.1:8000/api/sales?skip=${page * LIMIT}&limit=${LIMIT}&sort_by=${sortBy}&order=${order}`;
      if (startDate) url += `&start_date=${new Date(startDate).toISOString()}`;
      if (endDate) url += `&end_date=${new Date(endDate).toISOString()}`;

      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
      });
      if (res.ok) {
        setSales(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: number, qty: number) => {
    setAddQuantities({ ...addQuantities, [productId]: qty });
  };

  const addToCart = (product: Product) => {
    const qtyToAdd = addQuantities[product.id] || 1;
    if (qtyToAdd <= 0) return;

    if (product.stock <= 0) {
      alert("No hay stock disponible.");
      return;
    }
    
    const existing = cart.find(item => item.product.id === product.id);
    const newTotalQty = (existing ? existing.quantity : 0) + qtyToAdd;
    
    if (newTotalQty > product.stock) {
      alert(`Stock insuficiente. Solo quedan ${product.stock} disponibles.`);
      return;
    }

    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: newTotalQty } : item));
    } else {
      setCart([...cart, { product, quantity: qtyToAdd }]);
    }
    
    // Reset local quantity
    setAddQuantities({ ...addQuantities, [product.id]: 1 });
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const processCheckout = async () => {
    if (cart.length === 0) return;
    
    const total_amount = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const token = localStorage.getItem("auth_token");

    const payload = {
      total_amount,
      payment_method: paymentMethod,
      sale_type: "POS",
      items: cart.map(item => ({
        description: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        reference_type: "Producto",
        reference_id: item.product.id
      }))
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert("Venta registrada exitosamente");
        setCart([]);
        fetchProducts(); // Refresh stock
        fetchSales(); // Refresh history
      } else {
        alert("Error al procesar la venta");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <div className="p-8 text-white">Cargando módulo de ventas...</div>;

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const filteredProducts = products.filter(p => p.stock > 0 && p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-brand-blue pb-12">
      <nav className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/admin/dashboard"}>
            &larr; Volver
          </Button>
          <span className="text-white font-black italic tracking-widest uppercase ml-4">Ventas & POS</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        
        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-8">
          <button 
            onClick={() => setActiveTab("POS")}
            className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-colors ${activeTab === "POS" ? "text-brand-yellow border-b-2 border-brand-yellow" : "text-white/40 hover:text-white"}`}
          >
            Punto de Venta (POS)
          </button>
          <button 
            onClick={() => setActiveTab("Historial")}
            className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-colors ${activeTab === "Historial" ? "text-brand-yellow border-b-2 border-brand-yellow" : "text-white/40 hover:text-white"}`}
          >
            Historial de Ventas
          </button>
        </div>

        {activeTab === "POS" && (
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Izquierda: Catálogo en Tabla */}
            <div className="xl:w-2/3 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Catálogo</h2>
                <input 
                  type="text" 
                  placeholder="🔍 Buscar producto..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-black/40 border border-white/20 rounded-lg p-2 text-white text-sm focus:border-brand-yellow outline-none w-64"
                />
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/60 sticky top-0 z-10 backdrop-blur-md">
                      <tr className="text-white/60 text-[10px] uppercase tracking-widest">
                        <th className="p-4 font-bold">Producto</th>
                        <th className="p-4 font-bold text-center">Tags</th>
                        <th className="p-4 font-bold text-center">Stock</th>
                        <th className="p-4 font-bold text-right">Precio</th>
                        <th className="p-4 font-bold text-center w-32">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredProducts.map(p => (
                        <tr 
                          key={p.id} 
                          className="border-b border-white/5 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,222,0,0.1)] transition-all cursor-pointer group"
                          onClick={() => addToCart(p)}
                        >
                          <td className="p-4 text-white font-bold max-w-[200px] truncate" title={p.name}>{p.name}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-1 text-[9px] uppercase">
                              {p.is_foil && <span className="text-yellow-500 font-bold bg-yellow-500/10 px-1 rounded">Foil</span>}
                              {p.condition && <span className="text-white/60 bg-white/10 px-1 rounded">{p.condition}</span>}
                            </div>
                          </td>
                          <td className="p-4 text-center text-white/40">{p.stock}</td>
                          <td className="p-4 text-right text-brand-yellow font-mono">{formatCRC(p.price)}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-white/60 hover:text-white bg-white/5 hover:bg-white/10" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(p.id, Math.max(1, (addQuantities[p.id] || 1) - 1));
                                }}
                              >
                                -
                              </Button>
                              <input 
                                type="number" 
                                min="1" 
                                max={p.stock}
                                value={addQuantities[p.id] || 1}
                                onChange={e => handleQuantityChange(p.id, parseInt(e.target.value) || 1)}
                                className="w-10 bg-black/40 border border-white/20 rounded p-1 text-center text-white text-xs outline-none focus:border-brand-yellow [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 text-white/60 hover:text-white bg-white/5 hover:bg-white/10" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(p.id, Math.min(p.stock, (addQuantities[p.id] || 1) + 1));
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-white/40 italic">
                            No se encontraron productos disponibles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Derecha: Carrito y Checkout */}
            <div className="xl:w-1/3">
              <div className="bg-black/40 border border-brand-yellow/30 rounded-xl p-6 shadow-[0_0_20px_rgba(255,222,0,0.1)] flex flex-col sticky top-24 min-h-[60vh]">
                <h3 className="text-white font-black italic uppercase text-xl mb-4">Orden Actual</h3>
                
                {/* Lista del carrito */}
                <div className="flex-grow space-y-3 mb-6 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-bold truncate max-w-[180px]">{item.product.name}</span>
                        <span className="text-white/40 text-xs mt-1">{item.quantity} x {formatCRC(item.product.price)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-brand-yellow font-mono text-sm font-bold">{formatCRC(item.product.price * item.quantity)}</span>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-300 text-lg font-bold bg-white/5 w-8 h-8 rounded-full flex items-center justify-center transition-colors">&times;</button>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-white/20 py-12">
                      <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-sm uppercase tracking-widest font-bold">Carrito Vacío</p>
                    </div>
                  )}
                </div>

                {/* Zona de Cobro */}
                <div className="mt-auto border-t border-brand-yellow/30 pt-6">
                  <div className="flex justify-between items-end mb-6 bg-brand-yellow/5 p-4 rounded-xl border border-brand-yellow/10">
                    <span className="text-brand-yellow uppercase text-xs font-black tracking-widest">Total a Cobrar</span>
                    <span className="text-4xl font-black text-brand-yellow">{formatCRC(cartTotal)}</span>
                  </div>

                  <p className="text-white/60 uppercase text-[10px] font-bold tracking-widest mb-3">Método de Pago</p>
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <button 
                      onClick={() => setPaymentMethod("Efectivo")}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${paymentMethod === 'Efectivo' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                    >
                      <span className="text-2xl">💵</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Efectivo</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod("Tarjeta")}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${paymentMethod === 'Tarjeta' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                    >
                      <span className="text-2xl">💳</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Tarjeta</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod("SINPE")}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${paymentMethod === 'SINPE' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                    >
                      <span className="text-2xl">📱</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">SINPE</span>
                    </button>
                  </div>

                  <Button variant="primary" className="w-full py-4 text-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,222,0,0.2)]" onClick={processCheckout} disabled={cart.length === 0}>
                    Facturar Venta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Historial" && (
          <div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              {/* Controles de Filtro */}
              <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Desde</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-black/40 border border-white/20 rounded p-2 text-white text-sm" style={{ colorScheme: "dark" }} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Hasta</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-black/40 border border-white/20 rounded p-2 text-white text-sm" style={{ colorScheme: "dark" }} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Ordenar Por</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-black/40 border border-white/20 rounded p-2 text-white text-sm">
                    <option value="sale_date">Fecha</option>
                    <option value="total_amount">Monto</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Orden</label>
                  <select value={order} onChange={e => setOrder(e.target.value)} className="bg-black/40 border border-white/20 rounded p-2 text-white text-sm">
                    <option value="desc">Descendente ↓</option>
                    <option value="asc">Ascendente ↑</option>
                  </select>
                </div>
                <div className="flex items-end ml-auto">
                  <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); setSortBy("sale_date"); setOrder("desc"); }}>Limpiar Filtros</Button>
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/10">
                      <th className="pb-4 font-normal">ID</th>
                      <th className="pb-4 font-normal">Fecha</th>
                      <th className="pb-4 font-normal">Tipo</th>
                      <th className="pb-4 font-normal">Items</th>
                      <th className="pb-4 font-normal">Pago</th>
                      <th className="pb-4 font-normal text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {sales.map(sale => (
                      <tr key={sale.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 text-white/60 font-mono">#{sale.id}</td>
                        <td className="py-4 text-white">{new Date(sale.sale_date).toLocaleString('es-CR')}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${sale.sale_type === 'POS' ? 'bg-blue-500/20 text-blue-400' : sale.sale_type === 'Torneo' ? 'bg-purple-500/20 text-purple-400' : 'bg-brand-yellow/20 text-brand-yellow'}`}>
                            {sale.sale_type}
                          </span>
                        </td>
                        <td className="py-4 text-white/80 text-xs">
                          {sale.items.map(item => (
                            <div key={item.id} className="truncate max-w-[150px]" title={item.description}>
                              {item.quantity}x {item.description}
                            </div>
                          ))}
                        </td>
                        <td className="py-4 text-white/60">{sale.payment_method}</td>
                        <td className="py-4 text-brand-yellow font-black text-right">{formatCRC(sale.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sales.length === 0 && (
                  <div className="text-center py-12 text-white/40">
                    No se encontraron ventas para los filtros seleccionados.
                  </div>
                )}
              </div>

              {/* Paginación */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/10">
                <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                  &larr; Anterior
                </Button>
                <span className="text-white/40 text-xs font-mono">Página {page + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(page + 1)} disabled={sales.length < LIMIT}>
                  Siguiente &rarr;
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
