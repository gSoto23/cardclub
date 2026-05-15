import React from "react";
import { ActiveAuctionCard } from "@/components/ui/ActiveAuctionCard";

async function getActiveAuctions() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/auctions/active", { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function SubastasPage() {
  const auctions = await getActiveAuctions();

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[70vh]">
      {/* Cabecera de Subastas */}
      <div className="mb-12 border-b border-white/10 pb-8 text-center md:text-left">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-black tracking-[0.2em] uppercase backdrop-blur-sm mb-6 shadow-[0_0_15px_rgba(255,222,0,0.15)]">
          <span className="w-2 h-2 rounded-full bg-brand-yellow animate-ping" />
          En Vivo
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(255,222,0,0.2)]">
          Subastas <span className="text-brand-yellow">Activas</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl">
          Puja en tiempo real por las cartas más raras y exclusivas. Las ofertas se actualizan al instante para todos los jugadores.
        </p>
      </div>

      {/* Grid de Subastas */}
      {auctions.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-white/60 font-medium">No hay subastas activas en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction: any) => (
            <ActiveAuctionCard key={auction.id} initialAuction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
