"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface Championship {
  id: number;
  name: string;
  is_active: boolean;
}

interface Tournament {
  id: number;
  name: string;
  date: string;
  format: string;
  entry_fee: number;
  max_players: number;
  is_active: boolean;
  is_virtual?: boolean;
  championship_id?: number;
}

interface Registration {
  id: number;
  user_id: number;
  user_email: string;
  user_whatsapp?: string;
  payment_method: string;
  status: string;
  registered_at: string;
}

export default function TournamentsAdmin() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTournamentId, setEditingTournamentId] = useState<number | null>(null);
  
  // Registration View State
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activeTab, setActiveTab] = useState<"inscripciones" | "resultados">("inscripciones");
  const [resultsData, setResultsData] = useState<{ [userId: number]: { points: number, position: number | "" } }>({});

  // Main Tabs
  const [mainTab, setMainTab] = useState<"torneos" | "campeonatos">("torneos");

  // Championships State
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [showChampForm, setShowChampForm] = useState(false);
  const [editingChampId, setEditingChampId] = useState<number | null>(null);
  const [champFormData, setChampFormData] = useState({ name: "", is_active: true });

  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 16),
    format: "Standard",
    entry_fee: 5000,
    max_players: 16,
    is_virtual: false,
    championship_id: "" as number | ""
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments`);
      if (res.ok) setTournaments(await res.json());

      const resChamp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/championships`);
      if (resChamp.ok) setChampionships(await resChamp.json());
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
      const payload = {
        ...formData,
        championship_id: formData.championship_id === "" ? null : formData.championship_id,
        date: new Date(formData.date).toISOString()
      };

      const isEditing = editingTournamentId !== null;
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/${editingTournamentId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/tournaments`;
      const method = isEditing ? "PUT" : "POST";

      const toastId = toast.loading(isEditing ? 'Actualizando...' : 'Publicando evento...');

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(isEditing ? 'Torneo actualizado' : 'Torneo creado', { id: toastId });
        setShowForm(false);
        setEditingTournamentId(null);
        resetForm();
        fetchData();
      } else {
        toast.error('Error guardando torneo', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión');
    }
  };

  const handleChampSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    
    const isEditing = editingChampId !== null;
    const url = isEditing 
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/championships/${editingChampId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/api/championships`;
    const method = isEditing ? "PUT" : "POST";

    const toastId = toast.loading(isEditing ? 'Actualizando campeonato...' : 'Guardando campeonato...');
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(champFormData)
      });
      if (res.ok) {
        toast.success(isEditing ? 'Campeonato actualizado' : 'Campeonato creado', { id: toastId });
        setShowChampForm(false);
        setEditingChampId(null);
        setChampFormData({ name: "", is_active: true });
        fetchData();
      } else {
        toast.error('Error guardando', { id: toastId });
      }
    } catch (err) {
      toast.error('Error de conexión', { id: toastId });
    }
  };

  const handleChampEdit = (champ: Championship) => {
    setChampFormData({
      name: champ.name,
      is_active: champ.is_active
    });
    setEditingChampId(champ.id);
    setShowChampForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", date: new Date().toISOString().slice(0, 16), format: "Standard", entry_fee: 5000, max_players: 16, is_virtual: false, championship_id: "" });
    setEditingTournamentId(null);
  };

  const handleEdit = (t: Tournament, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering viewRegistrations
    const formatDateTimeLocal = (dateString: string) => {
      const d = new Date(dateString);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormData({
      name: t.name,
      date: formatDateTimeLocal(t.date),
      format: t.format,
      entry_fee: t.entry_fee,
      max_players: t.max_players,
      is_virtual: t.is_virtual || false,
      championship_id: t.championship_id || ""
    });
    setEditingTournamentId(t.id);
    setShowForm(true);
  };

  const handleDelete = async (tId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering viewRegistrations
    if (!confirm("¿Seguro que deseas eliminar este torneo? Se borrarán también las inscripciones (sin reembolso automático).")) return;
    
    const token = localStorage.getItem("auth_token");
    const toastId = toast.loading('Eliminando...');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/${tId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Torneo eliminado', { id: toastId });
        if (selectedTournamentId === tId) setSelectedTournamentId(null);
        fetchData();
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || 'Error eliminando el torneo', { id: toastId });
      }
    } catch (err) {
      toast.error('Error de conexión', { id: toastId });
    }
  };

  const viewRegistrations = async (id: number) => {
    setSelectedTournamentId(id);
    setActiveTab("inscripciones");
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/${id}/registrations`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setRegistrations(await res.json());
      }
      
      // Fetch Results
      const resResults = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/${id}/results`);
      if (resResults.ok) {
        const resultsArray = await resResults.json();
        const resultsMap: any = {};
        resultsArray.forEach((r: any) => {
          resultsMap[r.user_id] = { points: r.points, position: r.position || "" };
        });
        setResultsData(resultsMap);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResultChange = (userId: number, field: "points" | "position", value: number | string) => {
    setResultsData(prev => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || { points: 0, position: "" }),
        [field]: value
      }
    }));
  };

  const saveResults = async () => {
    if (!selectedTournamentId) return;
    const token = localStorage.getItem("auth_token");
    const payload = Object.entries(resultsData).map(([userId, data]) => ({
      user_id: parseInt(userId),
      points: data.points,
      position: data.position === "" ? null : data.position
    }));

    const toastId = toast.loading("Guardando resultados...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/${selectedTournamentId}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success("Resultados guardados", { id: toastId });
      } else {
        toast.error("Error guardando", { id: toastId });
      }
    } catch (err) {
      toast.error("Error de conexión", { id: toastId });
    }
  };

  const confirmRegistration = async (regId: number) => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tournaments/registrations/${regId}/confirm`, {
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

      {/* Main Tabs */}
      <div className="flex border-b border-white/10 mx-6 mt-6 overflow-x-auto">
        <button 
          onClick={() => setMainTab("torneos")}
          className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${mainTab === "torneos" ? "text-brand-yellow border-b-2 border-brand-yellow" : "text-white/40 hover:text-white"}`}
        >
          Gestión de Torneos
        </button>
        <button 
          onClick={() => setMainTab("campeonatos")}
          className={`px-6 py-3 font-bold uppercase tracking-widest text-sm transition-colors whitespace-nowrap ${mainTab === "campeonatos" ? "text-brand-yellow border-b-2 border-brand-yellow" : "text-white/40 hover:text-white"}`}
        >
          Campeonatos & Temporadas
        </button>
      </div>

      {mainTab === "torneos" && (
        <div className="container mx-auto px-6 py-8 flex flex-col xl:flex-row gap-8">
        
        {/* Left Column: Torneos */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-white">Torneos Activos</h1>
            <Button variant="primary" onClick={() => {
              if (showForm) {
                setShowForm(false);
                resetForm();
              } else {
                setShowForm(true);
              }
            }}>
              {showForm ? "Cancelar" : "+ Nuevo Torneo"}
            </Button>
          </div>

          {showForm && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingTournamentId ? "Editar Torneo" : "Configurar Torneo"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
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
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Campeonato / Temporada</label>
                  <select value={formData.championship_id} onChange={e => setFormData({...formData, championship_id: e.target.value ? Number(e.target.value) : ""})} className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors">
                    <option value="">Ninguno (Independiente)</option>
                    {championships.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Costo de Inscripción (CRC)</label>
                  <input type="number" required min="0" value={Number.isNaN(formData.entry_fee) ? "" : formData.entry_fee} onChange={e => setFormData({...formData, entry_fee: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Max Jugadores</label>
                  <input type="number" required min="2" value={Number.isNaN(formData.max_players) ? "" : formData.max_players} onChange={e => setFormData({...formData, max_players: parseInt(e.target.value)})} className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Tipo de Evento</label>
                  <select value={formData.is_virtual ? "true" : "false"} onChange={e => setFormData({...formData, is_virtual: e.target.value === "true"})} className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors">
                    <option value="false">Físico (En Tienda)</option>
                    <option value="true">Virtual (En Línea)</option>
                  </select>
                </div>

                <div className="md:col-span-2 mt-4 flex justify-end gap-3">
                  <Button variant="ghost" type="button" onClick={() => {setShowForm(false); resetForm();}}>Cancelar</Button>
                  <Button variant="primary" type="submit" className="shadow-[0_0_15px_rgba(255,222,0,0.3)]">
                    {editingTournamentId ? "Guardar Cambios" : "Publicar Evento"}
                  </Button>
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
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-brand-yellow text-brand-blue text-xs font-black uppercase tracking-widest px-2 py-1 rounded">
                      {t.format}
                    </span>
                    {t.is_virtual && (
                      <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                        Virtual
                      </span>
                    )}
                    <div className="flex gap-2">
                      <button onClick={(e) => handleEdit(t, e)} className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/40 transition-colors" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </button>
                      <button onClick={(e) => handleDelete(t.id, e)} className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
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

        {/* Right Column: Registrations & Results */}
        {selectedTournamentId && (
          <div className="w-full md:w-1/3 bg-black/20 border border-white/10 rounded-xl p-6 self-start sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-brand-yellow">Gestión</h2>
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                <button
                  onClick={() => setActiveTab("inscripciones")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
                    activeTab === "inscripciones" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/80"
                  }`}
                >
                  Inscripciones
                </button>
                <button
                  onClick={() => setActiveTab("resultados")}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${
                    activeTab === "resultados" ? "bg-brand-yellow text-black" : "text-white/40 hover:text-brand-yellow"
                  }`}
                >
                  Puntajes
                </button>
              </div>
            </div>
            
            {activeTab === "inscripciones" ? (
              <>
                <p className="text-white/40 text-xs mb-6">Administra los jugadores y autoriza sus pagos.</p>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {registrations.map(reg => (
                    <div key={reg.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <p className="text-white font-bold text-sm truncate" title={reg.user_email}>{reg.user_email}</p>
                        {reg.user_whatsapp && (
                          <a 
                            href={`https://wa.me/${reg.user_whatsapp.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-green-500/20 text-green-400 hover:bg-green-500/40 border border-green-500/30 rounded px-2 py-1 flex items-center gap-1 transition-colors ml-2 shrink-0"
                            title="Contactar por WhatsApp"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">WhatsApp</span>
                          </a>
                        )}
                      </div>
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
              </>
            ) : (
              <>
                <p className="text-white/40 text-xs mb-6">Asigna puntos a los participantes para el Ranking Global.</p>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 mb-4">
                  {registrations.filter(r => r.status === "Confirmado").map(reg => {
                    const data = resultsData[reg.user_id] || { points: 0, position: "" };
                    return (
                      <div key={reg.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-3">
                        <p className="text-white font-bold text-sm truncate">{reg.user_email}</p>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-brand-yellow uppercase tracking-widest block mb-1 font-bold">Puntos Obtenidos</label>
                            <input 
                              type="number" 
                              min="0"
                              value={Number.isNaN(data.points) ? "" : data.points} 
                              onChange={(e) => handleResultChange(reg.user_id, "points", parseInt(e.target.value))}
                              className="w-full bg-black/40 border border-brand-yellow/30 rounded p-1.5 text-white text-sm focus:border-brand-yellow outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {registrations.filter(r => r.status === "Confirmado").length === 0 && (
                    <p className="text-white/40 text-xs text-center py-4">No hay jugadores confirmados para asignar puntajes.</p>
                  )}
                </div>
                {registrations.filter(r => r.status === "Confirmado").length > 0 && (
                  <Button variant="primary" className="w-full" onClick={saveResults}>
                    Guardar Resultados
                  </Button>
                )}
              </>
            )}
          </div>
        )}

      </div>
      )}

      {mainTab === "campeonatos" && (
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-white">Campeonatos y Temporadas</h1>
            <Button variant="primary" onClick={() => {
              if (showChampForm) {
                setShowChampForm(false);
                setEditingChampId(null);
                setChampFormData({ name: "", is_active: true });
              } else {
                setShowChampForm(true);
              }
            }}>
              {showChampForm ? "Cancelar" : "+ Nuevo Campeonato"}
            </Button>
          </div>

          {showChampForm && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 backdrop-blur-md animate-in fade-in slide-in-from-top-4">
              <h2 className="text-xl font-bold text-white mb-4">{editingChampId ? "Editar Campeonato" : "Crear Campeonato"}</h2>
              <form onSubmit={handleChampSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-grow space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Nombre de la Temporada</label>
                  <input type="text" required value={champFormData.name} onChange={e => setChampFormData({...champFormData, name: e.target.value})} className="w-full bg-black/40 border border-brand-yellow/30 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors" placeholder="Ej. Liga Nacional Verano 2026" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <input type="checkbox" checked={champFormData.is_active} onChange={e => setChampFormData({...champFormData, is_active: e.target.checked})} className="w-4 h-4 accent-brand-yellow" />
                  <label className="text-white text-sm font-bold">Activo (Líder actual)</label>
                </div>
                <Button variant="primary" type="submit" className="py-3 px-6">Guardar</Button>
              </form>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-black/60">
                <tr className="text-white/60 text-xs uppercase tracking-widest border-b border-white/10">
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">Nombre del Campeonato</th>
                  <th className="p-4 font-bold text-center">Estado</th>
                  <th className="p-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {championships.map(champ => (
                  <tr key={champ.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white/60 font-mono">#{champ.id}</td>
                    <td className="p-4 text-white font-bold">{champ.name}</td>
                    <td className="p-4 text-center">
                      {champ.is_active ? (
                        <span className="bg-green-500/20 text-green-400 text-[10px] font-bold uppercase px-2 py-1 rounded">Activo</span>
                      ) : (
                        <span className="bg-white/10 text-white/40 text-[10px] font-bold uppercase px-2 py-1 rounded">Inactivo</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="secondary" size="sm" onClick={() => handleChampEdit(champ)}>
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
                {championships.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-white/40 italic">No hay campeonatos creados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
