"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface Tournament {
  id: number;
  name: string;
  date: string;
  format: string;
  entry_fee: number;
  max_players: number;
  is_active: boolean;
}

export default function TorneosPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Modal State
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsLoggedIn(true);
    }
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/tournaments");
      if (res.ok) {
        setTournaments(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedTournament) return;
    setIsRegistering(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tournaments/${selectedTournament.id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          tournament_id: selectedTournament.id,
          payment_method: paymentMethod
        })
      });

      if (res.ok) {
        alert("¡Inscripción exitosa! Está pendiente de confirmación en tienda.");
        setSelectedTournament(null);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.detail}`);
      }
    } catch (err) {
      console.error(err);
      alert("Hubo un error de conexión.");
    } finally {
      setIsRegistering(false);
    }
  };

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center text-white">Cargando eventos...</div>;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[70vh]">
      {/* Cabecera */}
      <div className="mb-12 border-b border-white/10 pb-8 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(255,222,0,0.2)]">
          Calendario <span className="text-brand-yellow">Competitivo</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl">
          Participa en nuestros torneos oficiales y mide tus habilidades contra los mejores jugadores de Card Club. Reúne tu deck, confirma tu asistencia y lucha por los premios.
        </p>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-white/60 font-medium">No hay eventos programados en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tournaments.map(t => {
            const dateObj = new Date(t.date);
            const isPast = dateObj < new Date();

            return (
              <div key={t.id} className={`bg-black/20 border ${isPast ? 'border-white/5 opacity-50' : 'border-white/10 hover:border-brand-yellow/30'} rounded-2xl overflow-hidden flex flex-col md:flex-row transition-colors`}>
                
                {/* Date Block */}
                <div className="bg-brand-yellow/10 p-6 flex flex-col justify-center items-center min-w-[140px] border-b md:border-b-0 md:border-r border-white/10">
                  <span className="text-brand-yellow font-bold uppercase tracking-widest text-sm">{dateObj.toLocaleString('es-CR', { month: 'short' })}</span>
                  <span className="text-white text-5xl font-black">{dateObj.getDate()}</span>
                  <span className="text-white/60 text-xs mt-1">{dateObj.toLocaleString('es-CR', { weekday: 'long' })}</span>
                  <span className="text-white font-mono mt-3">{dateObj.toLocaleString('es-CR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                {/* Info Block */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold text-xl leading-tight">{t.name}</h3>
                    <span className="bg-white/10 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
                      {t.format}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-6 flex justify-between items-end">
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Inscripción</p>
                      <p className="text-brand-yellow font-black text-2xl">{formatCRC(t.entry_fee)}</p>
                    </div>
                    
                    {!isPast && (
                      <Button 
                        variant="primary" 
                        onClick={() => {
                          if (isLoggedIn) {
                            setSelectedTournament(t);
                          } else {
                            window.location.href = "/login";
                          }
                        }}
                      >
                        {isLoggedIn ? "Inscribirse" : "Inicia Sesión para Inscribirte"}
                      </Button>
                    )}
                    {isPast && (
                      <span className="text-white/40 font-bold uppercase text-sm">Finalizado</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Inscripción */}
      {selectedTournament && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-blue border border-brand-yellow/30 rounded-2xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(255,222,0,0.1)]">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Inscripción al Torneo</h2>
            <p className="text-white/60 text-sm mb-6">Estás a punto de inscribirte al evento <span className="text-brand-yellow font-bold">{selectedTournament.name}</span>.</p>
            
            <div className="bg-black/40 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-white/60 text-sm">Costo de Entrada:</span>
                <span className="text-white font-mono font-bold">{formatCRC(selectedTournament.entry_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Formato:</span>
                <span className="text-white font-mono font-bold">{selectedTournament.format}</span>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-xs text-white/60 font-bold uppercase tracking-widest">Método de Pago</label>
              <select 
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white focus:border-brand-yellow outline-none"
              >
                <option value="Efectivo" className="text-black">Efectivo en Tienda</option>
                <option value="SINPE" className="text-black">SINPE Móvil (Aprobación manual)</option>
                <option value="Tarjeta" className="text-black">Tarjeta (Datáfono en Tienda)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setSelectedTournament(null)}>
                Cancelar
              </Button>
              <Button variant="primary" className="flex-1 shadow-[0_0_15px_rgba(255,222,0,0.3)]" onClick={handleRegister} disabled={isRegistering}>
                {isRegistering ? "Procesando..." : "Confirmar Inscripción"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
