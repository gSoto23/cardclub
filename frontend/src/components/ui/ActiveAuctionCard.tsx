"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./Button";

interface Auction {
  id: number;
  product_id: number;
  product_name: string;
  image_url: string;
  start_price: number;
  current_price: number;
  end_time: string;
  condition?: string;
  is_foil?: boolean;
  category_name?: string;
}

export const ActiveAuctionCard = ({ initialAuction }: { initialAuction: Auction }) => {
  const [currentPrice, setCurrentPrice] = useState(initialAuction.current_price);
  const [wsStatus, setWsStatus] = useState("Conectando...");
  const [isFlashing, setIsFlashing] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Conectar al WebSocket
    ws.current = new WebSocket(`ws://127.0.0.1:8000/api/ws/auctions/${initialAuction.id}`);

    ws.current.onopen = () => {
      setWsStatus("En Vivo");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_bid") {
        setCurrentPrice(data.new_price);
        // Disparar animación
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 500);
      }
    };

    ws.current.onclose = () => {
      setWsStatus("Desconectado");
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [initialAuction.id]);

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  const placeBid = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const newBid = currentPrice + 1000;
      ws.current.send(JSON.stringify({
        user_id: 1,
        amount: newBid
      }));
    }
  };

  return (
    <div className={`relative bg-white/5 border rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${isFlashing ? 'border-brand-yellow shadow-[0_0_30px_rgba(255,222,0,0.4)] scale-[1.02]' : 'border-white/10 hover:border-brand-yellow/30'}`}>
      {/* Etiqueta de Estado */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
        <span className={`w-2 h-2 rounded-full ${wsStatus === 'En Vivo' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-white text-xs font-bold uppercase tracking-widest">{wsStatus}</span>
      </div>

      <div className="flex p-4 gap-4 items-center border-b border-white/5">
        <div className="w-20 h-20 rounded-md overflow-hidden bg-black/40 flex-shrink-0">
          {initialAuction.image_url ? (
            <img src={initialAuction.image_url} alt={initialAuction.product_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">NO IMG</div>
          )}
        </div>
        <div>
          <h3 className="text-white font-bold text-lg leading-tight">{initialAuction.product_name}</h3>
          
          <div className="flex flex-wrap gap-1 mt-1 mb-1">
            {initialAuction.condition && (
              <span className="bg-white/10 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/20 uppercase tracking-wider">
                {initialAuction.condition}
              </span>
            )}
            {initialAuction.category_name && (
              <span className="bg-purple-600/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/20 uppercase tracking-wider">
                {initialAuction.category_name}
              </span>
            )}
            {initialAuction.is_foil && (
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 text-brand-blue text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                Foil
              </span>
            )}
          </div>
          
          <p className="text-brand-yellow text-[10px] font-black uppercase tracking-widest">Acaba pronto</p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-b from-transparent to-brand-blue/50 flex-grow flex flex-col items-center justify-center">
        <p className="text-white/60 text-sm uppercase tracking-widest mb-1">Puja Actual</p>
        <div className={`text-5xl font-black transition-colors duration-300 ${isFlashing ? 'text-brand-yellow' : 'text-white'}`}>
          {formatCRC(currentPrice)}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 bg-black/20">
        <Button variant="ghost" className="w-full text-xs">
          Ver Detalles
        </Button>
        <Button variant="primary" className="w-full shadow-[0_0_15px_rgba(255,222,0,0.2)]" onClick={placeBid}>
          Pujar +₡1,000
        </Button>
      </div>
    </div>
  );
};
