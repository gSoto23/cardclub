"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminDashboard() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
    } else {
      setIsChecking(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  if (isChecking) {
    return <div className="min-h-screen bg-brand-blue flex items-center justify-center text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-blue">
      {/* Admin Navbar */}
      <nav className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-yellow rounded transform -skew-x-12 flex items-center justify-center">
            <span className="text-brand-blue font-black text-sm skew-x-12">CC</span>
          </div>
          <span className="text-white font-black italic tracking-widest uppercase">Admin Panel</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-white mb-8">Resumen de Control</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tarjeta de Inventario */}
          <div onClick={() => window.location.href = '/admin/inventory'} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-brand-yellow/30 transition-colors cursor-pointer group">
            <h3 className="text-white/60 text-sm font-bold uppercase tracking-widest mb-2">Inventario</h3>
            <p className="text-3xl font-black text-white group-hover:text-brand-yellow transition-colors">Productos</p>
            <p className="text-white/40 text-xs mt-4">Gestionar catálogo y precios</p>
          </div>

          {/* Tarjeta de Subastas */}
          <div onClick={() => window.location.href = '/admin/auctions'} className="bg-white/5 border border-white/10 p-6 rounded-xl hover:border-brand-yellow/30 transition-colors cursor-pointer group">
            <h3 className="text-white/60 text-sm font-bold uppercase tracking-widest mb-2">Subastas en Vivo</h3>
            <p className="text-3xl font-black text-white group-hover:text-brand-yellow transition-colors">Arena</p>
            <p className="text-white/40 text-xs mt-4">Iniciar / Detener subastas</p>
          </div>
          
          {/* Torneos Placeholder */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl opacity-50">
            <h3 className="text-white/60 text-sm font-bold uppercase tracking-widest mb-2">Eventos</h3>
            <p className="text-3xl font-black text-white">Torneos</p>
            <p className="text-brand-yellow text-xs mt-4">Próximamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
