"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

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
  origin_ref?: string;
  user_email?: string;
  items: SaleItem[];
  discount_amount?: number;
  original_total?: number;
  promo_code?: string;
}

interface ApprovalItem {
  id: number;
  type: string;
  user_email: string;
  user_whatsapp?: string;
  payment_method: string;
  total_amount: number;
  date: string;
}

export default function SalesAdmin() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"POS" | "Historial" | "Aprobaciones">("POS");
  
  // POS State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [searchTerm, setSearchTerm] = useState("");
  const [addQuantities, setAddQuantities] = useState<Record<number, number>>({});
  const [buyerEmail, setBuyerEmail] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);

  // History State
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesStats, setSalesStats] = useState({ total_ventas: 0, total_costo: 0, ganancia: 0, total_orders: 0 });
  const [page, setPage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("sale_date");
  const [order, setOrder] = useState("desc");
  const [searchId, setSearchId] = useState("");

  // Approvals State
  const [approvalsSales, setApprovalsSales] = useState<ApprovalItem[]>([]);
  const [approvalsRegs, setApprovalsRegs] = useState<ApprovalItem[]>([]);

  const LIMIT = 10;

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchProducts();
    fetchSales();
    fetchApprovals();
  }, [page, startDate, endDate, sortBy, order, searchId]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?visibility=pos`);
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSales = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/sales?skip=${page * LIMIT}&limit=${LIMIT}&sort_by=${sortBy}&order=${order}`;
      let statsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/sales/stats?`;
      
      if (startDate) {
        url += `&start_date=${new Date(startDate).toISOString()}`;
        statsUrl += `start_date=${new Date(startDate).toISOString()}&`;
      }
      if (endDate) {
        url += `&end_date=${new Date(endDate).toISOString()}`;
        statsUrl += `end_date=${new Date(endDate).toISOString()}&`;
      }
      if (searchId) {
        url += `&search_id=${searchId}`;
        statsUrl += `search_id=${searchId}&`;
      }

      const headers = { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` };
      
      const [resSales, resStats] = await Promise.all([
        fetch(url, { headers }),
        fetch(statsUrl, { headers })
      ]);

      if (resSales.ok) setSales(await resSales.json());
      if (resStats.ok) setSalesStats(await resStats.json());
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovals = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/approvals/pending`;
      if (searchId) url += `?search_id=${searchId}`;
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApprovalsSales(data.sales);
        setApprovalsRegs(data.registrations);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmApproval = async (id: number, type: "sale" | "registration") => {
    try {
      const endpoint = type === "sale" 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/sales/${id}/confirm`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/registrations/${id}/confirm`;
      
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${localStorage.getItem("auth_token")}` }
      });

      if (res.ok) {
        toast.success("Pago confirmado");
        fetchApprovals(); // Refresh approvals
        fetchSales(); // Refresh history
      } else {
        toast.error("Error confirmando pago");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuantityChange = (productId: number, qty: number) => {
    setAddQuantities({ ...addQuantities, [productId]: qty });
  };

  const addToCart = (product: Product) => {
    const qtyToAdd = addQuantities[product.id] || 1;
    if (qtyToAdd <= 0) return;

    if (product.stock <= 0) {
      toast.error("No hay stock disponible.");
      return;
    }
    
    const existing = cart.find(item => item.product.id === product.id);
    const newTotalQty = (existing ? existing.quantity : 0) + qtyToAdd;
    
    if (newTotalQty > product.stock) {
      toast.error(`Stock insuficiente. Solo quedan ${product.stock} disponibles.`);
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
    
    const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const discountAmount = discountType === "percentage" 
      ? Math.round(cartTotal * (discountValue / 100)) 
      : discountValue;
    const finalTotal = Math.max(0, cartTotal - discountAmount);
    const token = localStorage.getItem("auth_token");

    const payload = {
      total_amount: finalTotal,
      discount_amount: discountAmount,
      original_total: cartTotal,
      payment_method: paymentMethod,
      sale_type: "POS",
      buyer_email: buyerEmail.trim() || undefined,
      items: cart.map(item => ({
        description: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        reference_type: "Producto",
        reference_id: item.product.id
      }))
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success("Venta registrada exitosamente");
        setCart([]);
        setBuyerEmail("");
        setDiscountValue(0);
        fetchProducts(); // Refresh stock
        fetchSales(); // Refresh history
      } else {
        toast.error("Error al procesar la venta");
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
  const discountAmount = discountType === "percentage" 
    ? Math.round(cartTotal * (discountValue / 100)) 
    : discountValue;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

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
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab("POS")}
            className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${activeTab === "POS" ? "text-brand-yellow border-b-2 border-brand-yellow" : "text-white/40 hover:text-white"}`}
          >
            Punto de Venta (POS)
          </button>
          <button 
            onClick={() => setActiveTab("Historial")}
            className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${activeTab === "Historial" ? "text-brand-yellow border-b-2 border-brand-yellow" : "text-white/40 hover:text-white"}`}
          >
            Historial de Ventas
          </button>
          <button 
            onClick={() => setActiveTab("Aprobaciones")}
            className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === "Aprobaciones" ? "text-brand-yellow border-b-2 border-brand-yellow" : "text-white/40 hover:text-white"}`}
          >
            Aprobaciones
            {(approvalsSales.length > 0 || approvalsRegs.length > 0) && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {approvalsSales.length + approvalsRegs.length}
              </span>
            )}
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

                {/* Descuentos POS */}
                {cart.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                    <p className="text-white/60 uppercase text-[10px] font-bold tracking-widest mb-3">Aplicar Descuento</p>
                    <div className="flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => { setDiscountType("percentage"); setDiscountValue(0); }}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase rounded border transition-colors ${discountType === "percentage" ? "bg-brand-yellow/20 border-brand-yellow text-brand-yellow" : "bg-black/20 border-white/10 text-white/60 hover:text-white"}`}
                      >
                        Porcentaje (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDiscountType("fixed"); setDiscountValue(0); }}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase rounded border transition-colors ${discountType === "fixed" ? "bg-brand-yellow/20 border-brand-yellow text-brand-yellow" : "bg-black/20 border-white/10 text-white/60 hover:text-white"}`}
                      >
                        Monto Fijo (₡)
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={discountType === "percentage" ? 100 : cartTotal}
                        placeholder={discountType === "percentage" ? "Ej. 10%" : "Ej. 1000 ₡"}
                        value={discountValue || ""}
                        onChange={e => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          if (discountType === "percentage") {
                            setDiscountValue(Math.min(100, val));
                          } else {
                            setDiscountValue(Math.min(cartTotal, val));
                          }
                        }}
                        className="bg-black/40 border border-white/20 rounded-lg p-2 text-white text-sm focus:border-brand-yellow outline-none flex-grow w-full"
                      />
                      <div className="flex gap-1">
                        {[5, 10, 15, 20].map(pct => (
                          discountType === "percentage" && (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setDiscountValue(pct)}
                              className={`px-2 py-1.5 text-xs font-bold rounded transition-colors ${discountValue === pct ? "bg-brand-yellow text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
                            >
                              {pct}%
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Zona de Cobro */}
                <div className="mt-auto border-t border-brand-yellow/30 pt-6">
                  {discountAmount > 0 && (
                    <div className="space-y-1.5 mb-4 text-sm px-1">
                      <div className="flex justify-between text-white/60">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatCRC(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-red-400">
                        <span>Descuento ({discountType === "percentage" ? `${discountValue}%` : "Monto"})</span>
                        <span className="font-mono">-{formatCRC(discountAmount)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-end mb-6 bg-brand-yellow/5 p-4 rounded-xl border border-brand-yellow/10">
                    <span className="text-brand-yellow uppercase text-xs font-black tracking-widest">Total a Cobrar</span>
                    <span className="text-4xl font-black text-brand-yellow">{formatCRC(finalTotal)}</span>
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

                  <div className="flex flex-col gap-1 mb-6">
                    <label className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Correo del comprador (Opcional)</label>
                    <input 
                      type="email" 
                      placeholder="Para enviar recibo por correo" 
                      value={buyerEmail} 
                      onChange={e => setBuyerEmail(e.target.value)} 
                      className="bg-black/40 border border-white/20 rounded-lg p-3 text-white text-sm focus:border-brand-yellow focus:outline-none w-full" 
                    />
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
                  <label className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Buscar por ID</label>
                  <input type="number" placeholder="Ej. 102" value={searchId} onChange={e => setSearchId(e.target.value)} className="bg-black/40 border border-white/20 rounded p-2 text-white text-sm w-32" />
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

              {/* Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Total Ventas</p>
                  <p className="text-2xl font-black text-brand-yellow">{formatCRC(salesStats.total_ventas)}</p>
                </div>
                <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Total Costo</p>
                  <p className="text-2xl font-black text-white">{formatCRC(salesStats.total_costo)}</p>
                </div>
                <div className="bg-black/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400/60 text-[10px] uppercase tracking-widest font-bold">Ganancia</p>
                  <p className="text-2xl font-black text-green-400">{formatCRC(salesStats.ganancia)}</p>
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/10">
                      <th className="pb-4 font-normal">ID</th>
                      <th className="pb-4 font-normal">Origen</th>
                      <th className="pb-4 font-normal">Email</th>
                      <th className="pb-4 font-normal">Fecha</th>
                      <th className="pb-4 font-normal">Tipo</th>
                      <th className="pb-4 font-normal">Items</th>
                      <th className="pb-4 font-normal">Estado</th>
                      <th className="pb-4 font-normal">Pago</th>
                      <th className="pb-4 font-normal text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {sales.map(sale => (
                      <tr key={sale.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 text-white/60 font-mono">#{sale.id}</td>
                        <td className="py-4">
                          <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-mono font-bold text-white/80">{sale.origin_ref || `V-${sale.id}`}</span>
                        </td>
                        <td className="py-4 text-white/80 text-xs truncate max-w-[120px]" title={sale.user_email || 'N/A'}>
                          {sale.user_email || <span className="text-white/20 italic">No Registrado</span>}
                        </td>
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
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${sale.status === 'Completado' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            {sale.status}
                          </span>
                        </td>
                        <td className="py-4 text-white/60">{sale.payment_method}</td>
                        <td className="py-4 text-brand-yellow font-black text-right">
                          {sale.discount_amount && sale.discount_amount > 0 ? (
                            <div className="flex flex-col items-end">
                              <span className="text-white/40 text-[10px] line-through font-normal font-mono">
                                {formatCRC(sale.original_total || sale.total_amount + sale.discount_amount)}
                              </span>
                              <span>{formatCRC(sale.total_amount)}</span>
                              <span className="text-red-400 text-[9px] font-bold mt-0.5">
                                -{formatCRC(sale.discount_amount)}
                                {sale.promo_code ? ` (${sale.promo_code})` : ""}
                              </span>
                            </div>
                          ) : (
                            formatCRC(sale.total_amount)
                          )}
                        </td>
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

        {activeTab === "Aprobaciones" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-black text-brand-yellow italic uppercase tracking-tighter mb-2">Cobros Pendientes</h2>
            <p className="text-white/60 text-sm mb-6">Confirma la recepción de SINPE o Efectivo para liberar pedidos online o confirmar inscripciones.</p>
            
            <div className="flex mb-8 pb-6 border-b border-white/10">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Buscar por ID</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Ej. 45" value={searchId} onChange={e => setSearchId(e.target.value)} className="bg-black/40 border border-white/20 rounded p-2 text-white text-sm w-32" />
                  <Button variant="ghost" size="sm" onClick={() => setSearchId("")}>Limpiar</Button>
                </div>
              </div>
            </div>
            
            {(approvalsSales.length === 0 && approvalsRegs.length === 0) ? (
              <div className="text-center py-16 border border-white/5 rounded-xl bg-black/20">
                <p className="text-white/40 font-bold uppercase tracking-widest">No hay pagos pendientes de confirmación.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Pedidos Online */}
                <div className="bg-black/20 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-black uppercase tracking-widest text-lg mb-4 flex items-center justify-between">
                    Pedidos Online
                    <span className="text-brand-yellow text-xs">{approvalsSales.length} pendientes</span>
                  </h3>
                  <div className="space-y-4">
                    {approvalsSales.map(sale => (
                      <div key={sale.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-bold">{sale.user_email}</p>
                              {sale.user_whatsapp && (
                                <a 
                                  href={`https://wa.me/${sale.user_whatsapp.replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="bg-green-500/20 text-green-400 hover:bg-green-500/40 border border-green-500/30 rounded px-2 py-0.5 flex items-center gap-1 transition-colors shrink-0"
                                  title="Contactar por WhatsApp"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                  <span className="text-[9px] font-black uppercase tracking-widest hidden lg:inline">Contactar</span>
                                </a>
                              )}
                            </div>
                            <p className="text-white/40 text-xs">
                              <span className="font-mono font-bold text-brand-yellow">#V-{sale.id}</span> - {new Date(sale.date).toLocaleString('es-CR')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${sale.payment_method === 'SINPE' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                            {sale.payment_method}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <p className="text-brand-yellow font-black text-xl">{formatCRC(sale.total_amount)}</p>
                          <Button variant="primary" size="sm" onClick={() => confirmApproval(sale.id, "sale")}>
                            Confirmar Pago
                          </Button>
                        </div>
                      </div>
                    ))}
                    {approvalsSales.length === 0 && (
                      <p className="text-white/40 text-sm italic">Todo al día en la tienda online.</p>
                    )}
                  </div>
                </div>

                {/* Inscripciones a Torneos */}
                <div className="bg-black/20 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-black uppercase tracking-widest text-lg mb-4 flex items-center justify-between">
                    Inscripciones a Torneos
                    <span className="text-brand-yellow text-xs">{approvalsRegs.length} pendientes</span>
                  </h3>
                  <div className="space-y-4">
                    {approvalsRegs.map(reg => (
                      <div key={reg.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-bold">{reg.user_email}</p>
                              {reg.user_whatsapp && (
                                <a 
                                  href={`https://wa.me/${reg.user_whatsapp.replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="bg-green-500/20 text-green-400 hover:bg-green-500/40 border border-green-500/30 rounded px-2 py-0.5 flex items-center gap-1 transition-colors shrink-0"
                                  title="Contactar por WhatsApp"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                                  <span className="text-[9px] font-black uppercase tracking-widest hidden lg:inline">Contactar</span>
                                </a>
                              )}
                            </div>
                            <p className="text-white/40 text-xs">
                              <span className="font-mono font-bold text-brand-yellow">#I-{reg.id}</span> - {reg.type}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${reg.payment_method === 'SINPE' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                            {reg.payment_method}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <p className="text-brand-yellow font-black text-xl">{formatCRC(reg.total_amount)}</p>
                          <Button variant="primary" size="sm" onClick={() => confirmApproval(reg.id, "registration")}>
                            Confirmar Pago
                          </Button>
                        </div>
                      </div>
                    ))}
                    {approvalsRegs.length === 0 && (
                      <p className="text-white/40 text-sm italic">Todo al día en las inscripciones.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
