"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";

interface SiteConfig {
  key: string;
  value: string;
  description?: string;
}

export default function ConfigAdmin() {
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`);
      if (res.ok) {
        setConfigs(await res.json());
      }
    } catch (err) {
      console.error(err);
      toast.error("Error cargando configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setConfigs(prev => {
      const exists = prev.find(c => c.key === key);
      if (exists) {
        return prev.map(c => c.key === key ? { ...c, value } : c);
      } else {
        return [...prev, { key, value, description: "" }];
      }
    });
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const token = localStorage.getItem("auth_token");
    const toastId = toast.loading('Subiendo banner...');
    setUploadingBanner(true);

    const imgData = new FormData();
    imgData.append("file", file);

    try {
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: imgData
      });
      if (uploadRes.ok) {
        const uploadJson = await uploadRes.json();
        handleInputChange('page_membership_banner', uploadJson.image_url);
        toast.success('Banner subido correctamente', { id: toastId });
      } else {
        toast.error('Error al subir el banner', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al subir', { id: toastId });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleBrasilUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const token = localStorage.getItem("auth_token");
    const toastId = toast.loading('Subiendo banner de Brasil...');
    setUploadingBanner(true);

    const imgData = new FormData();
    imgData.append("file", file);

    try {
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: imgData
      });
      if (uploadRes.ok) {
        const uploadJson = await uploadRes.json();
        handleInputChange('page_brasil_banner', uploadJson.image_url);
        toast.success('Banner de Brasil subido correctamente', { id: toastId });
      } else {
        toast.error('Error al subir el banner de Brasil', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al subir', { id: toastId });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("auth_token");
    const toastId = toast.loading('Guardando configuración...');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ configs })
      });

      if (res.ok) {
        toast.success('Configuración actualizada', { id: toastId });
      } else {
        toast.error('Error guardando', { id: toastId });
      }
    } catch (err) {
      toast.error('Error de conexión', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const getValue = (key: string) => configs.find(c => c.key === key)?.value || "";
  const getDesc = (key: string) => configs.find(c => c.key === key)?.description || "";

  if (loading) return <div className="p-8 text-white">Cargando configuración...</div>;

  return (
    <div className="min-h-screen bg-brand-blue pb-12">
      {/* Navbar */}
      <nav className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/admin/dashboard"}>
            &larr; Volver
          </Button>
          <span className="text-white font-black italic tracking-widest uppercase ml-4">Configuración Global</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-white">Configuración del Sistema</h1>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Redes Sociales */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold text-brand-yellow mb-6">Redes y Contacto</h2>
              
              <div className="space-y-4">
                {['social_whatsapp', 'social_ig', 'social_fb', 'social_tiktok', 'social_discord', 'contact_email', 'sinpe_number'].map(key => {
                  const labelMap: Record<string, string> = {
                    social_whatsapp: "WhatsApp (Link de invitación)",
                    social_ig: "Instagram",
                    social_fb: "Facebook",
                    social_tiktok: "TikTok",
                    social_discord: "Discord",
                    contact_email: "Email de Contacto",
                    sinpe_number: "Número SINPE"
                  };
                  return (
                    <div key={key} className="space-y-1">
                      <label className="text-xs text-white/60 font-bold uppercase">{labelMap[key] || key}</label>
                      <input 
                        type="text" 
                        value={getValue(key)} 
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors"
                      />
                      <p className="text-[10px] text-white/30 italic">{getDesc(key)}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Contenidos de Páginas */}
            <div className="space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-brand-yellow mb-2">Preguntas Frecuentes (FAQ)</h2>
                <p className="text-white/40 text-xs mb-4">Puedes usar HTML básico como &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;br/&gt;</p>
                <textarea 
                  value={getValue('page_faq')} 
                  onChange={(e) => handleInputChange('page_faq', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors h-48 font-mono text-sm"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-brand-yellow mb-2">Membresía (Membership)</h2>
                <p className="text-white/40 text-xs mb-4">Puedes usar HTML básico como &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;br/&gt;</p>
                
                <div className="mb-6 space-y-2">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Banner de Membresía</label>
                  {getValue('page_membership_banner') && (
                    <div className="relative w-full max-w-sm aspect-[16/9] mb-3 rounded-lg overflow-hidden border border-white/10">
                      <img 
                        src={getValue('page_membership_banner')} 
                        alt="Vista previa del banner" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    disabled={uploadingBanner}
                    onChange={handleBannerUpload}
                    className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-brand-yellow file:text-brand-blue hover:file:bg-yellow-300 cursor-pointer disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase">Contenido de la Página</label>
                  <textarea 
                    value={getValue('page_membership')} 
                    onChange={(e) => handleInputChange('page_membership', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors h-48 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-brand-yellow mb-2">Road to Brasil (Torneo Especial)</h2>
                <p className="text-white/40 text-xs mb-4">Información sobre el torneo y su premio (viaje a Brasil LAIC Pokemon).</p>
                
                <div className="mb-6 space-y-2">
                  <label className="text-xs text-white/60 font-bold uppercase text-brand-yellow">Banner del Evento</label>
                  {getValue('page_brasil_banner') && (
                    <div className="relative w-full max-w-sm aspect-[16/9] mb-3 rounded-lg overflow-hidden border border-white/10">
                      <img 
                        src={getValue('page_brasil_banner')} 
                        alt="Vista previa del banner Brasil" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    disabled={uploadingBanner}
                    onChange={handleBrasilUpload}
                    className="w-full bg-black/40 border border-white/10 rounded p-1.5 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-brand-yellow file:text-brand-blue hover:file:bg-yellow-300 cursor-pointer disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60 font-bold uppercase">Contenido de la Sección</label>
                  <textarea 
                    value={getValue('page_brasil_content')} 
                    onChange={(e) => handleInputChange('page_brasil_content', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors h-48 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-brand-yellow mb-2">Reglas Oficiales</h2>
                <p className="text-white/40 text-xs mb-4">Puedes usar HTML básico como &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;br/&gt;</p>
                <textarea 
                  value={getValue('page_rules')} 
                  onChange={(e) => handleInputChange('page_rules', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors h-48 font-mono text-sm"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-brand-yellow mb-2">Política de Privacidad</h2>
                <p className="text-white/40 text-xs mb-4">Puedes usar HTML básico</p>
                <textarea 
                  value={getValue('page_privacy')} 
                  onChange={(e) => handleInputChange('page_privacy', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors h-48 font-mono text-sm"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-brand-yellow mb-2">Política de Cookies</h2>
                <p className="text-white/40 text-xs mb-4">Puedes usar HTML básico</p>
                <textarea 
                  value={getValue('page_cookies')} 
                  onChange={(e) => handleInputChange('page_cookies', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-brand-yellow focus:outline-none transition-colors h-48 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
