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
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [selectedIncrement, setSelectedIncrement] = useState<number>(1000);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws")}/api/ws/auctions/${initialAuction.id}`);

    ws.current.onopen = () => {
      setWsStatus("En Vivo");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_bid") {
        setCurrentPrice(data.new_price);
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

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const end = new Date(initialAuction.end_time).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft("Finalizado");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [initialAuction.end_time]);

  const formatCRC = (amount: number) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  const placeBid = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const newBid = currentPrice + selectedIncrement;
      ws.current.send(JSON.stringify({
        user_id: 1,
        amount: newBid
      }));
    }
  };

  return (
    <div className={`relative bg-white/5 border rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${isFlashing ? 'border-brand-yellow shadow-[0_0_30px_rgba(255,222,0,0.4)] scale-[1.02]' : 'border-white/10 hover:border-brand-yellow/30'}`}>
      
      {/* IMAGEN DEL PRODUCTO (Prioridad) */}
      <div className="relative w-full aspect-[4/3] bg-black/40 group overflow-hidden">
        {/* Etiqueta de Estado */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span className={`w-2 h-2 rounded-full ${wsStatus === 'En Vivo' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-white text-xs font-bold uppercase tracking-widest">{wsStatus}</span>
        </div>

        {initialAuction.image_url ? (
          <img 
            src={initialAuction.image_url} 
            alt={initialAuction.product_name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xl font-black uppercase">NO IMAGE</div>
        )}

        {/* Countdown Overlay */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent pt-12 pb-3 px-4 flex justify-between items-end">
          <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Termina en:</span>
          <span className="text-brand-yellow font-mono text-xl font-black tracking-wider">{timeLeft}</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-white font-black text-xl leading-tight mb-3">{initialAuction.product_name}</h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {initialAuction.condition && (
            <span className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-wider">
              {initialAuction.condition}
            </span>
          )}
          {initialAuction.category_name && (
            <span className="bg-purple-600/60 text-white text-xs font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-wider">
              {initialAuction.category_name}
            </span>
          )}
          {initialAuction.is_foil && (
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 text-brand-blue text-xs font-black px-2 py-1 rounded uppercase tracking-wider">
              Foil
            </span>
          )}
        </div>
        
        <div className="mt-auto border-t border-white/10 pt-4 flex flex-col items-center">
          <p className="text-white/60 text-sm uppercase tracking-widest mb-1">Puja Actual</p>
          <div className={`text-4xl font-black transition-colors duration-300 ${isFlashing ? 'text-brand-yellow' : 'text-white'}`}>
            {formatCRC(currentPrice)}
          </div>
        </div>
      </div>

      {/* Botones de incremento y Puja */}
      <div className="p-4 bg-black/20 flex flex-col gap-3">
        {timeLeft !== "Finalizado" && (
          <div className="flex gap-2 justify-between">
            {[1000, 5000, 10000].map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedIncrement(amount)}
                className={`flex-1 py-2 rounded font-bold text-sm transition-all border ${selectedIncrement === amount ? 'bg-brand-yellow text-black border-brand-yellow shadow-[0_0_10px_rgba(255,222,0,0.3)]' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
              >
                +₡{amount / 1000}k
              </button>
            ))}
          </div>
        )}
        <Button 
          variant="primary" 
          className="w-full py-4 text-lg shadow-[0_0_15px_rgba(255,222,0,0.2)]" 
          onClick={placeBid}
          disabled={timeLeft === "Finalizado"}
        >
          {timeLeft === "Finalizado" ? "Subasta Finalizada" : `Confirmar Puja +${formatCRC(selectedIncrement)}`}
        </Button>
      </div>
    </div>
  );
};
