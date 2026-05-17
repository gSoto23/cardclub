"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    nickname: "",
    whatsapp: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Registrar usuario
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al registrarse");
      }

      // 2. Auto-login
      const loginParams = new URLSearchParams();
      loginParams.append("username", formData.email);
      loginParams.append("password", formData.password);

      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: loginParams,
      });

      if (!loginRes.ok) throw new Error("Registro exitoso, pero falló el auto-login");

      const data = await loginRes.json();
      localStorage.setItem("auth_token", data.access_token);
      
      // 3. Redirigir al Lounge
      window.location.href = "/lounge";

    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center p-4 py-12">
      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-md backdrop-blur-xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Card Club" className="w-16 h-16 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(255,222,0,0.3)]" />
          <h1 className="text-3xl font-black text-white italic uppercase">Crear Cuenta</h1>
          <p className="text-white/60 text-sm mt-2">Únete al Club y comienza a jugar</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Nombre Completo</label>
            <input 
              type="text" 
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Apodo Gamer</label>
              <input 
                type="text" 
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="Ej. JuanPZ"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">WhatsApp</label>
              <input 
                type="text" 
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="88888888"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Correo Electrónico (ID)</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div>
            <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Contraseña</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
          <Button variant="primary" className="w-full py-4 text-lg mt-4" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            ¿Ya tienes una cuenta? <a href="/login" className="text-brand-yellow hover:underline">Inicia Sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
}
