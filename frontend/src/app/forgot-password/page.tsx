"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Error al solicitar la recuperación");
      }

      setStatus("success");
      setMessage(data.message || "Revisa tu correo para el enlace de recuperación.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Error al procesar la solicitud.");
    }
  };

  return (
    <div className="min-h-screen bg-brand-blue flex items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-md backdrop-blur-xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Card Club" className="h-[70px] w-auto mx-auto mb-4 object-contain drop-shadow-[0_0_15px_rgba(255,222,0,0.3)]" />
          <h1 className="text-2xl font-black text-white italic uppercase">Recuperar Contraseña</h1>
          <p className="text-white/60 text-sm mt-2">Ingresa tu correo para recibir un enlace seguro</p>
        </div>

        {status === "error" && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm mb-6 text-center">
            {message}
          </div>
        )}

        {status === "success" ? (
          <div className="text-center space-y-6">
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-4 rounded-lg text-sm">
              {message}
            </div>
            <a href="/login" className="inline-block text-white/80 hover:text-brand-yellow font-semibold text-sm transition-colors">
              Volver al inicio de sesión
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Correo Electrónico</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="correo@ejemplo.com"
                required
                disabled={status === "loading"}
              />
            </div>
            <Button variant="primary" className="w-full py-4 text-lg" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Procesando..." : "Enviar Enlace"}
            </Button>
            
            <div className="text-center mt-4">
              <a href="/login" className="text-white/60 hover:text-brand-yellow text-xs font-semibold transition-colors">
                Regresar al Login
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
