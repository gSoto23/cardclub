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

interface Registration {
  id: number;
  user_email: string;
  payment_method: string;
  status: string;
  registered_at: string;
}

export default function TournamentsAdmin() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Registration View State
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 16),
    format: "Standard",
    entry_fee: 5000,
    max_players: 16
  });

  const fetchData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/tournaments");
      const data = await res.json();
      setTournaments(data);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString()
      };

      const res = await fetch("http://127.0.0.1:8000/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: "", date: new Date().toISOString().slice(0, 16), format: "Standard", entry_fee: 5000, max_players: 16 });
        fetchData();
      } else {
        alert("Error creando torneo");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const viewRegistrations = async (id: number) => {
    setSelectedTournamentId(id);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tournaments/${id}/registrations`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setRegistrations(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmRegistration = async (regId: number) => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tournaments/registrations/${regId}/confirm`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok && selectedTournamentId) {
        viewRegistrations(selectedTournamentId); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <div className="p-8 text-white">Cargando torneos...</div>;

  return (
    <div className="min-h-screen bg-brand-blue pb-12">
      {/* Navbar */}
      <nav className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/admin/dashboard"}>
            &larr; Volver
          </Button>
          <span className="text-white font-black italic tracking-widest uppercase ml-4">Gestión de Torneos</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Torneos */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-white">Torneos Activos</h1>
            <Button variant="primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancelar" : "+ Nuevo Torneo"}
            </Button>
          </div>

          {showForm && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white mb-4">Configurar Torneo</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Nombre del Evento</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors" placeholder="Ej. Pre-release Scarlet & Violet" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Fecha y Hora</label>
                  <input type="datetime-local" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors" style={{ colorScheme: "dark" }} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Formato</label>
                  <select value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})} className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors">
                    <option value="Standard">Standard</option>
                    <option value="Modern">Modern / Expanded</option>
                    <option value="Draft">Draft / Sealed</option>
                    <option value="Commander">Commander (EDH)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Costo de Inscripción (CRC)</label>
                  <input type="number" required min="0" value={formData.entry_fee} onChange={e => setFormData({...formData, entry_fee: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Max Jugadores</label>
                  <input type="number" required min="2" value={formData.max_players} onChange={e => setFormData({...formData, max_players: parseInt(e.target.value)})} className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors" />
                </div>

                <div className="md:col-span-2 mt-4 flex justify-end">
                  <Button variant="primary" type="submit" className="shadow-[0_0_15px_rgba(255,222,0,0.3)]">Publicar Evento</Button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {tournaments.map(t => (
              <div key={t.id} onClick={() => viewRegistrations(t.id)} className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition-all ${selectedTournamentId === t.id ? 'border-brand-yellow shadow-[0_0_15px_rgba(255,222,0,0.2)]' : 'border-white/10 hover:border-brand-yellow/30'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-bold text-lg">{t.name}</h3>
                    <p className="text-white/60 text-sm">{new Date(t.date).toLocaleString('es-CR')}</p>
                  </div>
                  <span className="bg-brand-yellow text-brand-blue text-xs font-black uppercase tracking-widest px-2 py-1 rounded">
                    {t.format}
                  </span>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <p className="text-white/80 font-mono text-sm">Costo: {formatCRC(t.entry_fee)}</p>
                  <p className="text-white/40 text-xs">Max: {t.max_players} jugadores</p>
                </div>
              </div>
            ))}
            {tournaments.length === 0 && (
              <p className="text-white/40 text-center py-8 border border-white/10 rounded-xl border-dashed">No hay torneos creados.</p>
            )}
          </div>
        </div>

        {/* Right Column: Registrations */}
        {selectedTournamentId && (
          <div className="w-full md:w-1/3 bg-black/20 border border-white/10 rounded-xl p-6 self-start sticky top-6">
            <h2 className="text-xl font-bold text-brand-yellow mb-2">Inscripciones</h2>
            <p className="text-white/40 text-xs mb-6">Administra los jugadores y autoriza sus pagos.</p>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {registrations.map(reg => (
                <div key={reg.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-white font-bold text-sm truncate" title={reg.user_email}>{reg.user_email}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-white/60 uppercase">Pago: {reg.payment_method}</span>
                      <span className={`text-[10px] font-bold uppercase ${reg.status === 'Confirmado' ? 'text-green-400' : 'text-orange-400'}`}>
                        {reg.status}
                      </span>
                    </div>
                    {reg.status === 'Pendiente' && (
                      <Button variant="primary" size="sm" className="text-[10px] py-1 px-2" onClick={() => confirmRegistration(reg.id)}>
                        Confirmar Pago
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {registrations.length === 0 && (
                <p className="text-white/40 text-xs text-center py-4">Nadie se ha inscrito aún.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
