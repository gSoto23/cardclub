"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FiX, FiInfo } from "react-icons/fi";

interface OfferAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OfferAuctionModal({ isOpen, onClose }: OfferAuctionModalProps) {
  const [formData, setFormData] = useState({
    card_name: "",
    expansion: "",
    condition: "NM",
    expected_price: ""
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("auth_token");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          card_name: formData.card_name,
          expansion: formData.expansion,
          condition: formData.condition,
          expected_price: parseFloat(formData.expected_price)
        })
      });

      if (!res.ok) {
        throw new Error("Error enviando solicitud");
      }

      toast.success("¡Solicitud enviada! Revisa tu correo.");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Hubo un problema al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-brand-yellow/30 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-2xl font-black text-white uppercase italic tracking-wider mb-6">
          Ofrecer <span className="text-brand-yellow">Carta</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white/70 mb-1">Nombre de la Carta</label>
            <input 
              required
              type="text"
              value={formData.card_name}
              onChange={(e) => setFormData({...formData, card_name: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brand-yellow outline-none"
              placeholder="Ej: Charizard Base Set"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white/70 mb-1">Expansión / Set</label>
            <input 
              required
              type="text"
              value={formData.expansion}
              onChange={(e) => setFormData({...formData, expansion: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brand-yellow outline-none"
              placeholder="Ej: Base Set 1999"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white/70 mb-1">Condición</label>
              <select 
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brand-yellow outline-none"
              >
                <option value="NM">Near Mint (NM)</option>
                <option value="LP">Lightly Played (LP)</option>
                <option value="MP">Moderately Played (MP)</option>
                <option value="HP">Heavily Played (HP)</option>
                <option value="Sealed">Sellado (Sealed)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-white/70 mb-1">Precio Esperado (₡)</label>
              <input 
                required
                type="number"
                min="0"
                value={formData.expected_price}
                onChange={(e) => setFormData({...formData, expected_price: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-brand-yellow outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mt-6 bg-brand-yellow/10 border border-brand-yellow/30 p-4 rounded-lg flex items-start gap-3">
            <FiInfo className="text-brand-yellow shrink-0 mt-0.5" size={20} />
            <p className="text-xs text-brand-yellow/90 leading-relaxed">
              <strong>IMPORTANTE:</strong> Card Club cobrará un porcentaje de comisión por venta. 
              Para que tu carta sea subastada oficialmente, primero deberá ser entregada en tienda para su evaluación, custodia y fotografiado profesional.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-brand-yellow text-slate-900 font-black py-3 rounded-lg uppercase tracking-widest hover:bg-white disabled:opacity-50 transition-colors"
          >
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
}
