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

interface ActiveBid {
  auction_id: number;
  product_name: string;
  image_url: string;
  current_price: number;
  end_time: string;
  is_winning: boolean;
}

interface WonAuction {
  auction_id: number;
  product_name: string;
  image_url: string;
  final_price: number;
  end_time: string;
}

interface UserProfile {
  id: number;
  email: string;
  full_name: string | null;
  nickname: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  pokemon_player_id: string | null;
  one_piece_player_id: string | null;
}

export default function LoungePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [activeBids, setActiveBids] = useState<ActiveBid[]>([]);
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
  const [ranking, setRanking] = useState<{ position: string; total_points: number }>({ position: "-", total_points: 0 });
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    nickname: "",
    whatsapp: "",
    pokemon_player_id: "",
    one_piece_player_id: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("auth_token");
    const headers = { "Authorization": `Bearer ${token}` };
    try {
      const [userRes, regRes, bidsRes, wonRes, rankingRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/tournaments`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/bids/active`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/auctions/won`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me/ranking`, { headers })
      ]);
      
      if (userRes.ok) {
        const user = await userRes.json();
        setUserProfile(user);
        setEditForm({
          full_name: user.full_name || "",
          nickname: user.nickname || "",
          whatsapp: user.whatsapp || "",
          pokemon_player_id: user.pokemon_player_id || "",
          one_piece_player_id: user.one_piece_player_id || ""
        });
      }
      if (regRes.ok) setRegistrations(await regRes.json());
      if (bidsRes.ok) setActiveBids(await bidsRes.json());
      if (wonRes.ok) setWonAuctions(await wonRes.json());
      if (rankingRes.ok) setRanking(await rankingRes.json());
      
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const token = localStorage.getItem("auth_token");
    
    try {
      let avatarUrl = userProfile?.avatar_url;
      
      // Upload avatar first if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          avatarUrl = uploadData.image_url;
        }
      }

      const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...editForm,
          avatar_url: avatarUrl
        })
      });

      if (updateRes.ok) {
        const updatedUser = await updateRes.json();
        setUserProfile(updatedUser);
        setIsEditModalOpen(false);
        setAvatarFile(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
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
        {/* Profile Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 mb-12 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 bg-brand-yellow h-full"></div>
          
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black/40 bg-black/40 flex-shrink-0 relative group">
            {userProfile?.avatar_url ? (
              <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-yellow text-4xl font-black">
                {userProfile?.nickname ? userProfile.nickname[0].toUpperCase() : userProfile?.email[0].toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
              <span className="text-white text-xs font-bold uppercase">Editar</span>
            </div>
          </div>

          <div className="flex-grow flex-shrink-0 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-1">
              {userProfile?.nickname || userProfile?.full_name?.split(' ')[0] || "Jugador"}
            </h1>
            <div className="text-brand-yellow text-xs font-bold uppercase tracking-widest mb-3">
              Card Club ID: #{userProfile?.id}
            </div>
            <p className="text-white/60 text-sm mb-4 font-medium">{userProfile?.full_name || "Sin Nombre Registrado"}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold uppercase tracking-widest text-white/40">
              <span className="bg-black/40 px-3 py-1.5 rounded">📧 {userProfile?.email}</span>
              {userProfile?.whatsapp && <span className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded">📱 {userProfile.whatsapp}</span>}
            </div>
            
            {/* Stats and Game IDs block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col justify-center">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Ranking Mensual</span>
                <span className="text-brand-yellow text-lg font-black">{ranking.position !== "-" ? `#${ranking.position}` : "-"}</span>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col justify-center">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Puntos Acumulados</span>
                <span className="text-white text-lg font-black">{ranking.total_points} pts</span>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col justify-center">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Pokémon ID</span>
                <span className="text-white text-xs font-bold truncate block">{userProfile?.pokemon_player_id || "No registrado"}</span>
              </div>
              <div className="bg-black/20 rounded-xl p-3 border border-white/5 flex flex-col justify-center">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">One Piece ID</span>
                <span className="text-white text-xs font-bold truncate block">{userProfile?.one_piece_player_id || "No registrado"}</span>
              </div>
            </div>
          </div>

          <div>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              Editar Perfil
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Torneos */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
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

            {/* Vitrina de Victorias removida */}
          </div>

          {/* Right Column: Actividad (Pujas Activas) */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-1 bg-brand-yellow"></span> Pujas Activas
            </h2>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 min-h-[400px]">
              {activeBids.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40 text-sm mb-4">No tienes pujas activas en este momento.</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = "/subastas"}>Ir a las Subastas</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBids.map(bid => (
                    <div key={bid.auction_id} className={`border rounded-lg p-4 transition-all ${bid.is_winning ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold text-sm line-clamp-1 flex-1">{bid.product_name}</h4>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ml-2 whitespace-nowrap ${bid.is_winning ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {bid.is_winning ? 'Vas Ganando' : 'Superado'}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">Oferta Actual</p>
                          <p className="text-white font-mono">₡{bid.current_price}</p>
                        </div>
                        {!bid.is_winning && (
                          <Button variant="primary" size="sm" className="px-3 py-1 text-xs" onClick={() => window.location.href = `/subastas`}>
                            Volver a Pujar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-blue border border-white/20 p-8 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6">Editar Perfil</h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black/40 bg-black/40 mb-4">
                  {(avatarFile || userProfile?.avatar_url) ? (
                    <img 
                      src={avatarFile ? URL.createObjectURL(avatarFile) : userProfile?.avatar_url!} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-yellow text-3xl font-black">
                      {userProfile?.nickname ? userProfile.nickname[0].toUpperCase() : userProfile?.email[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="text-xs text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
              </div>

              <div>
                <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Apodo Gamer</label>
                <input 
                  type="text" 
                  value={editForm.nickname}
                  onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">WhatsApp</label>
                <input 
                  type="text" 
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Pokémon Player ID</label>
                <input 
                  type="text" 
                  value={editForm.pokemon_player_id}
                  onChange={(e) => setEditForm({...editForm, pokemon_player_id: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">One Piece Player ID</label>
                <input 
                  type="text" 
                  value={editForm.one_piece_player_id}
                  onChange={(e) => setEditForm({...editForm, one_piece_player_id: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>
              <div className="opacity-50">
                <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Correo (No modificable)</label>
                <input 
                  type="email" 
                  value={userProfile?.email || ""}
                  disabled
                  className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-2 text-white cursor-not-allowed"
                />
              </div>
              
              <div className="pt-4 flex gap-4">
                <Button variant="outline" className="w-full" onClick={() => setIsEditModalOpen(false)} type="button">Cancelar</Button>
                <Button variant="primary" className="w-full" type="submit" disabled={savingProfile}>
                  {savingProfile ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
