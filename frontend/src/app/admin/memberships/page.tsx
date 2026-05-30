"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface MembershipItem {
  id: number;
  name: string;
}

interface UserMembershipItem {
  id: number;
  user_id: number;
  membership_item_id: number;
  is_delivered: boolean;
  delivered_at?: string;
  item: MembershipItem;
}

interface UserMembership {
  id: number;
  email: string;
  full_name: string | null;
  nickname: string | null;
  has_membership: boolean;
  membership_status: string;
  membership_items: UserMembershipItem[];
}

export default function AdminMemberships() {
  const [users, setUsers] = useState<UserMembership[]>([]);
  const [configItems, setConfigItems] = useState<MembershipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const term = searchTerm.toLowerCase();
      const matchesEmail = user.email?.toLowerCase().includes(term);
      const matchesNickname = user.nickname?.toLowerCase().includes(term);
      const matchesFullName = user.full_name?.toLowerCase().includes(term);
      return matchesEmail || matchesNickname || matchesFullName;
    });
  }, [users, searchTerm]);

  const fetchData = async () => {
    const token = localStorage.getItem("auth_token");
    const headers = { "Authorization": `Bearer ${token}` };
    try {
      const [usersRes, configRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/memberships`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/membership-config-items`, { headers })
      ]);

      if (usersRes.ok && configRes.ok) {
        setUsers(await usersRes.json());
        setConfigItems(await configRes.json());
      } else {
        toast.error("Error al cargar datos");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
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

  const handleCreateConfigItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsAddingItem(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/membership-config-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newItemName })
      });

      if (res.ok) {
        toast.success("Beneficio agregado a la membresía");
        setNewItemName("");
        fetchData();
      } else {
        toast.error("Error al guardar beneficio");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleDeleteConfigItem = async (itemId: number) => {
    if (!confirm("¿Deseas eliminar este beneficio? Se removerá del registro de todos los usuarios.")) return;

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/membership-config-items/${itemId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Beneficio eliminado");
        fetchData();
      } else {
        toast.error("Error al eliminar beneficio");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    }
  };

  const handleToggleMembership = async (userId: number, currentHas: boolean) => {
    const token = localStorage.getItem("auth_token");
    const nextHas = !currentHas;
    const nextStatus = nextHas ? "Activa" : "Ninguna";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/membership`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          has_membership: nextHas,
          membership_status: nextStatus
        })
      });

      if (res.ok) {
        toast.success(nextHas ? "Membresía Activada" : "Membresía Desactivada");
        fetchData();
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    }
  };

  const handleToggleItemDelivery = async (userId: number, itemId: number) => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/membership-items/${itemId}/toggle`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const updatedItem = await res.json();
        toast.success(updatedItem.is_delivered ? "Entregado" : "Pendiente");
        
        // Update local state directly to be instant and smooth!
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.id !== userId) return user;
            return {
              ...user,
              membership_items: user.membership_items.map(mi => {
                if (mi.membership_item_id !== itemId) return mi;
                return {
                  ...mi,
                  is_delivered: updatedItem.is_delivered,
                  delivered_at: updatedItem.delivered_at
                };
              })
            };
          })
        );
      } else {
        toast.error("Error al actualizar entrega");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    const token = localStorage.getItem("auth_token");
    const hasMem = newStatus !== "Ninguna";
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/membership`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          has_membership: hasMem,
          membership_status: newStatus
        })
      });

      if (res.ok) {
        toast.success(`Estado cambiado a: ${newStatus}`);
        fetchData();
      } else {
        toast.error("Error al cambiar estado");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando gestión de membresías...</div>;

  return (
    <div className="min-h-screen bg-brand-blue pb-12">
      {/* Navbar */}
      <nav className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/admin/dashboard"}>
            &larr; Volver
          </Button>
          <span className="text-white font-black italic tracking-widest uppercase ml-4">Membresías Card Club</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Membership Config */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 border-l-4 border-brand-yellow pl-3">
                Configuración
              </h2>
              <p className="text-xs text-white/60 mb-6">
                Define aquí los beneficios físicos o entregables incluidos en la membresía. Al agregar un beneficio, se vinculará a todos los miembros activos.
              </p>

              {/* Add form */}
              <form onSubmit={handleCreateConfigItem} className="space-y-3 mb-6">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Playmat Oficial, Sleeves..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-brand-yellow rounded-xl px-4 py-2 text-sm text-white outline-none"
                  />
                </div>
                <Button variant="primary" type="submit" className="w-full text-xs" disabled={isAddingItem}>
                  {isAddingItem ? "Agregando..." : "+ Agregar Beneficio"}
                </Button>
              </form>

              {/* Items List */}
              <div className="space-y-2">
                <h3 className="text-xs text-white/40 font-bold uppercase tracking-widest mb-3">Beneficios Definidos</h3>
                {configItems.length === 0 ? (
                  <p className="text-sm text-white/30 italic">No hay beneficios configurados.</p>
                ) : (
                  configItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-black/20 rounded-xl p-3 border border-white/5">
                      <span className="text-white text-sm font-semibold">{item.name}</span>
                      <button
                        onClick={() => handleDeleteConfigItem(item.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Members List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter border-l-4 border-brand-yellow pl-3">
                  Usuarios y Entregables
                </h2>
                
                {/* Search */}
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 bg-black/40 border border-white/10 focus:border-brand-yellow rounded-xl px-4 py-2 text-sm text-white outline-none"
                />
              </div>

              {/* Members Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-white min-w-[700px]">
                  <thead className="bg-black/40 text-xs uppercase tracking-widest text-white/60 border-b border-white/10">
                    <tr>
                      <th className="p-4">Usuario</th>
                      <th className="p-4">Membresía</th>
                      <th className="p-4">Beneficios / Entregas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-white/40 italic">
                          No se encontraron usuarios.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors align-top">
                          
                          {/* User Column */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow text-sm font-black flex-shrink-0">
                                {user.nickname ? user.nickname[0].toUpperCase() : user.email[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate max-w-[150px]">{user.nickname || "Jugador"}</p>
                                <p className="text-[10px] text-white/40 truncate max-w-[150px]">{user.email}</p>
                                <p className="text-[10px] text-white/50">Club ID: #{user.id}</p>
                              </div>
                            </div>
                          </td>

                          {/* Membership Status Column */}
                          <td className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={user.has_membership}
                                  onChange={() => handleToggleMembership(user.id, user.has_membership)}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-white/80">Tiene Membresía</span>
                              </div>
                              
                              {user.has_membership && (
                                <select
                                  value={user.membership_status}
                                  onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                  className="bg-black/35 border border-white/10 rounded px-2 py-1 text-xs text-brand-yellow font-bold outline-none cursor-pointer"
                                >
                                  <option value="Activa" className="bg-brand-blue text-white">Activa</option>
                                  <option value="Vencida" className="bg-brand-blue text-white">Vencida</option>
                                </select>
                              )}
                            </div>
                          </td>

                          {/* Items Checklist Column */}
                          <td className="p-4">
                            {!user.has_membership ? (
                              <span className="text-xs text-white/30 italic">Sin membresía activa</span>
                            ) : user.membership_items.length === 0 ? (
                              <span className="text-xs text-white/30 italic">No hay beneficios configurados</span>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {user.membership_items.map(item => (
                                  <label 
                                    key={item.id} 
                                    className={`flex items-center gap-2 text-xs p-1.5 rounded border transition-all cursor-pointer select-none ${
                                      item.is_delivered 
                                        ? "bg-green-500/10 border-green-500/20 text-green-400" 
                                        : "bg-black/20 border-white/5 hover:border-white/10 text-white/60"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={item.is_delivered}
                                      onChange={() => handleToggleItemDelivery(user.id, item.membership_item_id)}
                                      className="w-3.5 h-3.5 cursor-pointer accent-green-500"
                                    />
                                    <span className="font-semibold">{item.item.name}</span>
                                    {item.is_delivered && item.delivered_at && (
                                      <span className="text-[9px] opacity-60 ml-auto hidden sm:inline">
                                        Entregado {new Date(item.delivered_at).toLocaleDateString('es-CR')}
                                      </span>
                                    )}
                                  </label>
                                ))}
                              </div>
                            )}
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
