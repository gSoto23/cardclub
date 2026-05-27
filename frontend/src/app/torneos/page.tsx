"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface Tournament {
  id: number;
  name: string;
  date: string;
  format: string;
  entry_fee: number;
  max_players: number;
  is_active: boolean;
  is_virtual: boolean;
  registered_count: number;
  registered_players: string[];
}

export default function TorneosPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Dropdowns state
  const [openDropdowns, setOpenDropdowns] = useState<{[key: number]: boolean}>({});

  const toggleDropdown = (id: number) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Modal State
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [isRegistering, setIsRegistering] = useState(false);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<string>("Todos");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsLoggedIn(true);
    }
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments`);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/${selectedTournament.id}/register`, {
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
        toast.success("¡Inscripción exitosa! Está pendiente de confirmación en tienda.");
        setSelectedTournament(null);
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Hubo un error de conexión.");
    } finally {
      setIsRegistering(false);
    }
  };

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  const getAvailableMonths = () => {
    const months = new Set<string>();
    tournaments.forEach(t => {
      const dateObj = new Date(t.date);
      const monthStr = dateObj.toLocaleString('es-CR', { month: 'long', year: 'numeric' });
      months.add(monthStr);
    });
    return ["Todos", ...Array.from(months)];
  };

  const filteredTournaments = tournaments.filter(t => {
    if (selectedMonth === "Todos") return true;
    const monthStr = new Date(t.date).toLocaleString('es-CR', { month: 'long', year: 'numeric' });
    return monthStr === selectedMonth;
  });

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center text-white">Cargando eventos...</div>;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[70vh]">
      {/* Cabecera */}
      <div className="mb-8 border-b border-white/10 pb-8 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(255,222,0,0.2)]">
          <span className="text-brand-yellow">Calendario</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mb-8">
          Participá en nuestros eventos oficiales, torneos competitivos y clases para aprender a jugar. Además, mantenete al tanto de todas nuestras actividades.
        </p>
        {/* Filtro por Mes */}
        {tournaments.length > 0 && (
          <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
            {getAvailableMonths().map(month => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm uppercase tracking-widest transition-colors ${selectedMonth === month
                  ? "bg-brand-yellow text-brand-blue"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {month}
              </button>
            ))}
          </div>
        )}
      </div>

      {filteredTournaments.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-white/60 font-medium">No hay eventos programados en este momento.</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-6 lg:gap-8 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {filteredTournaments.map(t => {
            const dateObj = new Date(t.date);
            const isPast = dateObj < new Date();

            return (
              <div key={t.id} className={`bg-black/20 border ${isPast ? 'border-white/5 opacity-50' : 'border-white/10 hover:border-brand-yellow/30'} rounded-2xl overflow-hidden flex flex-col md:flex-row transition-colors min-w-[85vw] lg:min-w-0 snap-center`}>

                {/* Date Block */}
                <div className="bg-brand-yellow/10 p-6 flex flex-col justify-center items-center min-w-[140px] border-b md:border-b-0 md:border-r border-white/10">
                  <span className="text-brand-yellow font-bold uppercase tracking-widest text-sm">{dateObj.toLocaleString('es-CR', { month: 'short' })}</span>
                  <span className="text-white text-5xl font-black">{dateObj.getDate()}</span>
                  <span className="text-white/60 text-xs mt-1">{dateObj.toLocaleString('es-CR', { weekday: 'long' })}</span>
                  <span className="text-white font-mono mt-3">{dateObj.toLocaleString('es-CR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Info Block */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-white font-bold text-xl leading-tight flex-grow">{t.name}</h3>
                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                      <span className="bg-white/10 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded text-center">
                        {t.format}
                      </span>
                      {t.is_virtual ? (
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-center">
                          VIRTUAL
                        </span>
                      ) : (
                        <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-center">
                          EN TIENDA
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 bg-black/40 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Inscritos</span>
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[100px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-yellow transition-all"
                          style={{ width: `${Math.min(100, (t.registered_count / t.max_players) * 100)}%` }}
                        />
                      </div>
                      <span className="text-brand-yellow font-mono text-sm font-bold">
                        {t.registered_count}<span className="text-white/40">/{t.max_players}</span>
                      </span>
                    </div>
                  </div>

                  {/* Dropdown de Inscritos */}
                  <div className="mt-3">
                    <button 
                      onClick={() => toggleDropdown(t.id)}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between text-xs text-white/80 font-bold transition-all uppercase tracking-wider"
                    >
                      <span>Ver Inscritos ({t.registered_players?.length || 0})</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${openDropdowns[t.id] ? "rotate-180" : ""}`} 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {openDropdowns[t.id] && (
                      <div className="mt-2 bg-black/40 border border-white/5 rounded-lg p-3 max-h-[150px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                        {t.registered_players && t.registered_players.length > 0 ? (
                          t.registered_players.map((player, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-white/80 font-medium py-1 px-2 hover:bg-white/5 rounded transition-colors">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow"></span>
                              <span>{player}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[11px] text-white/40 text-center py-2 font-medium italic">
                            No hay jugadores inscritos aún
                          </div>
                        )}
                      </div>
                    )}
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
