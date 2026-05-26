"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface PromoCode {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  expiration_date: string | null;
  max_uses: number | null;
  uses_count: number;
  created_at: string;
}

export default function PromoCodesAdmin() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [expirationDate, setExpirationDate] = useState("");
  const [maxUses, setMaxUses] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/promo-codes`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPromoCodes(await res.json());
      } else {
        toast.error("Error al cargar códigos promocionales");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue(0);
    setIsActive(true);
    setExpirationDate("");
    setMaxUses("");
    setEditingId(null);
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingId(promo.id);
    setCode(promo.code);
    setDiscountType(promo.discount_type);
    setDiscountValue(promo.discount_value);
    setIsActive(promo.is_active);
    setExpirationDate(
      promo.expiration_date ? new Date(promo.expiration_date).toISOString().split("T")[0] : ""
    );
    setMaxUses(promo.max_uses !== null ? promo.max_uses.toString() : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("El código es obligatorio");
      return;
    }
    if (discountValue <= 0) {
      toast.error("El valor del descuento debe ser mayor que 0");
      return;
    }

    const token = localStorage.getItem("auth_token");
    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      is_active: isActive,
      expiration_date: expirationDate ? new Date(expirationDate).toISOString() : null,
      max_uses: maxUses.trim() ? parseInt(maxUses) : null
    };

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/promo-codes/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/promo-codes`;
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingId ? "Código promocional actualizado" : "Código promocional creado");
        resetForm();
        fetchPromoCodes();
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Error al guardar el código promocional");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este código promocional?")) return;

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/promo-codes/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success("Código promocional eliminado");
        fetchPromoCodes();
      } else {
        toast.error("Error al eliminar el código promocional");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    }
  };

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return <div className="p-8 text-white">Cargando códigos promocionales...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-blue pb-12">
      <nav className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/admin/dashboard"}>
            &larr; Volver
          </Button>
          <span className="text-white font-black italic tracking-widest uppercase ml-4">Descuentos & Promo Codes</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8">
          Gestionar <span className="text-brand-yellow">Códigos Promocionales</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Registro / Edición */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
              {editingId ? "Editar Código" : "Nuevo Código"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60 uppercase font-bold tracking-widest">Código</label>
                <input
                  type="text"
                  placeholder="Ej. POKEMON10"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="bg-black/40 border border-white/20 rounded-lg p-3 text-white text-sm focus:border-brand-yellow focus:outline-none w-full uppercase"
                  disabled={editingId !== null}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60 uppercase font-bold tracking-widest">Tipo de Descuento</label>
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value)}
                  className="bg-black/40 border border-white/20 rounded-lg p-3 text-white text-sm focus:border-brand-yellow focus:outline-none w-full"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo (₡)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60 uppercase font-bold tracking-widest">
                  Valor del Descuento
                </label>
                <input
                  type="number"
                  min="1"
                  value={discountValue || ""}
                  onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === "percentage" ? "Ej. 10 para 10%" : "Ej. 5000 para ₡5,000"}
                  className="bg-black/40 border border-white/20 rounded-lg p-3 text-white text-sm focus:border-brand-yellow focus:outline-none w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60 uppercase font-bold tracking-widest">Límite de Usos (Opcional)</label>
                <input
                  type="number"
                  min="1"
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
                  placeholder="Sin límite"
                  className="bg-black/40 border border-white/20 rounded-lg p-3 text-white text-sm focus:border-brand-yellow focus:outline-none w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-white/60 uppercase font-bold tracking-widest">Fecha de Expiración (Opcional)</label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={e => setExpirationDate(e.target.value)}
                  className="bg-black/40 border border-white/20 rounded-lg p-3 text-white text-sm focus:border-brand-yellow focus:outline-none w-full"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="accent-brand-yellow w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-white/80 font-bold uppercase tracking-wider cursor-pointer">
                  Activo
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="primary" className="flex-grow">
                  {editingId ? "Guardar Cambios" : "Crear Código"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Listado de Códigos existentes */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
              Códigos Activos
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/10">
                    <th className="pb-4 font-normal">Código</th>
                    <th className="pb-4 font-normal">Descuento</th>
                    <th className="pb-4 font-normal text-center">Usos</th>
                    <th className="pb-4 font-normal">Expira</th>
                    <th className="pb-4 font-normal">Estado</th>
                    <th className="pb-4 font-normal text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {promoCodes.map(promo => (
                    <tr key={promo.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <span className="bg-brand-yellow/10 border border-brand-yellow/20 px-2 py-1 rounded text-xs font-mono font-bold text-brand-yellow">
                          {promo.code}
                        </span>
                      </td>
                      <td className="py-4 text-white font-bold">
                        {promo.discount_type === "percentage" ? `${promo.discount_value}%` : formatCRC(promo.discount_value)}
                      </td>
                      <td className="py-4 text-center text-white/80">
                        <span className="font-mono">
                          {promo.uses_count}
                          {promo.max_uses !== null ? ` / ${promo.max_uses}` : ""}
                        </span>
                      </td>
                      <td className="py-4 text-white/60">
                        {promo.expiration_date ? new Date(promo.expiration_date).toLocaleDateString("es-CR") : <span className="text-white/20 italic">Nunca</span>}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${promo.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {promo.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(promo)} className="h-8 py-0">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(promo.id)} className="h-8 py-0 border-red-500/30 text-red-400 hover:bg-red-500/10">
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {promoCodes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-white/40 italic">
                        No hay códigos promocionales registrados aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
