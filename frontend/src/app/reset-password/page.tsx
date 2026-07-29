"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("El enlace de recuperación es inválido o no contiene un token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Error al restablecer la contraseña");
      }

      setStatus("success");
      setMessage(data.message || "Tu contraseña ha sido actualizada.");
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
          <h1 className="text-2xl font-black text-white italic uppercase">Nueva Contraseña</h1>
          <p className="text-white/60 text-sm mt-2">Crea una nueva contraseña para tu cuenta</p>
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
              Ir al inicio de sesión
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Nueva Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="••••••••"
                required
                disabled={status === "loading" || !token}
              />
            </div>
            <div>
              <label className="block text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Confirmar Contraseña</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-yellow transition-colors"
                placeholder="••••••••"
                required
                disabled={status === "loading" || !token}
              />
            </div>
            <Button variant="primary" className="w-full py-4 text-lg" type="submit" disabled={status === "loading" || !token}>
              {status === "loading" ? "Procesando..." : "Actualizar Contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-blue flex items-center justify-center text-white">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
