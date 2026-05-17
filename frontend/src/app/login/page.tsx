"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await res.json();
      const token = data.access_token;
      
      // Decodificar el JWT payload (la segunda parte del token)
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      // Guardar token en localStorage
      localStorage.setItem("auth_token", token);
      
      // Redirigir según el rol
      if (decodedPayload.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/lounge"; // Dashboard de jugador
      }

    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-md backdrop-blur-xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Card Club" className="w-16 h-16 mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(255,222,0,0.3)]" />
          <h1 className="text-3xl font-black text-white italic uppercase">Iniciar Sesión</h1>
          <p className="text-white/60 text-sm mt-2">Accede a tu cuenta de Card Club</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div>
            <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <Button variant="primary" className="w-full py-4 text-lg" type="submit">
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}
