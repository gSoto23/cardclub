"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface Registration {
  id: number;
  tournament_name: string;
  date: string;
  format: string;
  entry_fee: number;
  payment_method: string;
  status: string;
  registered_at: string;
}

export default function LoungePage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/me/tournaments", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setRegistrations(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  };

  if (loading) return <div className="min-h-screen bg-brand-blue flex items-center justify-center text-white">Cargando tu Lounge...</div>;

  return (
    <div className="min-h-screen bg-brand-blue pb-12">
      {/* Navbar de Lounge */}
      <nav className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/"}>
            &larr; Volver a la Tienda
          </Button>
          <span className="text-white font-black italic tracking-widest uppercase ml-4">Player Lounge</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300">
          Cerrar Sesión
        </Button>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-2">
            Bienvenido a la <span className="text-brand-yellow">Arena</span>
          </h1>
          <p className="text-white/60 text-lg">Tu centro de mando personal. Gestiona tus torneos, pujas y perfil.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Torneos */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-1 bg-brand-yellow"></span> Mis Próximos Torneos
            </h2>

            {registrations.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center border-dashed">
                <p className="text-white/60 mb-4">Aún no estás inscrito en ningún torneo.</p>
                <Button variant="primary" onClick={() => window.location.href = "/torneos"}>Ver Calendario</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map(reg => (
                  <div key={reg.id} className="bg-black/20 border border-white/10 hover:border-brand-yellow/30 transition-colors rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-white font-bold text-xl">{reg.tournament_name}</h3>
                      <div className="text-white/60 text-sm mt-1 flex flex-wrap gap-4">
                        <span>📅 {new Date(reg.date).toLocaleString('es-CR')}</span>
                        <span className="uppercase tracking-widest text-[10px] bg-white/10 px-2 py-0.5 rounded text-white">{reg.format}</span>
                      </div>
                    </div>
                    
                    <div className="text-right w-full md:w-auto bg-white/5 md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none">
                      <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Estado de Pago ({reg.payment_method})</p>
                      {reg.status === 'Confirmado' ? (
                        <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-green-500/30">
                          ✓ Plaza Asegurada
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-orange-500/30">
                          ⏳ Esperando Pago
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Actividad (Subastas futuras) */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-1 bg-brand-yellow"></span> Mi Actividad
            </h2>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 opacity-50 relative overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                <span className="bg-brand-blue text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded border border-white/20">Próximamente</span>
              </div>
              <h3 className="text-white/60 text-sm font-bold uppercase tracking-widest mb-4">Mis Subastas</h3>
              <div className="space-y-3 blur-[2px]">
                <div className="h-12 bg-white/10 rounded"></div>
                <div className="h-12 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
